import cv2
import threading
import time
import os
import logging
import sys
from OpenCVControl import OpenCVControl
from CompareImages import CompareImages
from ProcessSettings import ProcessSettings
from dotenv import load_dotenv


def threadFuncAnalyzeVideoStream(currPath, rtspStreamURL, processSettingsObj, logger):
    #print('=== Camera Thread ===')
    logger.info('== Camera Thread: Started')
        
    OpenCVControlObj = OpenCVControl(currPath, logger, rtspStreamURL)
    
    if (not OpenCVControlObj.getCaptureOpened()):
        #print(f"ERR: Could not open video stream with URL {rtspStreamURL}")
        logger.critical(f"ERR: Could not open video stream with URL {rtspStreamURL}")
        return
        
    CompareImagesObj = CompareImages(currPath, logger, 32, 32, processSettingsObj.getThresholdPercent())
    
    #captureDelayNs = captureDelayMs * 1000000		#captureDelayMs from param. May need to set capture delay for read() because if unrestricted capture for frames to compare it will sometimes grab the old
    
    #currRun = 0
    #maxRun = processSettingsObj.durationMin * 60	# seconds
    #threadCaptureStream = OpenCVControlObj.startThread()
    #time.sleep(1)	# time to start up stream.
    threadCompareImages = None
    
    # record properties
    #currRecordLen = 0
    #minRecordLen = 1	# seconds
    
    startRecordTime = time.time()
    
    processSettingsObj.setStartTime(time.time())
    logStart = time.time()
    capTime = time.time_ns()
    
    frameRetry = 0
    maxFrameRetry = 3
    
    #print('Camera running...')
    #while (True):
    while (time.time() - processSettingsObj.getStartTime() < processSettingsObj.getDurationMin() * 60 and processSettingsObj.getRunning() == True):
        #if (time.time() - logStart >= 1):
            #logStart = time.time()
            #print('running...')
            
        ret, frame = OpenCVControlObj.readStream()
        
        if (not ret):
            if (frameRetry >= maxFrameRetry):
                #print(f"Frame: {maxFrameRetry} frame retries reached. Break.")
                logger.error(f"Frame: {maxFrameRetry} frame retries reached. Break.")
                break
            frameRetry += 1
            OpenCVControlObj.retryOpenStream()
            continue
            
        frameRetry = 0
            
        #if (not threadCaptureStream.is_alive()):
            #print("Loop: threadCaptureStream dead.")
            #break
            
        # **need to test, without delay need to check if motionFlag is correctly determined. If not, it's probably getting old frame data so it compares the same frame = no motion.
        # send frame to CompareImages obj
        #if (time.time_ns() - capTime >= captureDelayNs):
            #capTime = time.time_ns()
        #timeStamp = str(time.time_ns())
        timeObj = time.localtime()
        timeStamp = "{tm_year}{tm_mon}{tm_mday}_{tm_hour}h{tm_min}m{tm_sec}s".format(tm_year=str(timeObj.tm_year), tm_mon=str(timeObj.tm_mon), tm_mday=str(timeObj.tm_mday), tm_hour=str(timeObj.tm_hour), tm_min=str(timeObj.tm_min), tm_sec=str(timeObj.tm_sec))
    
        #savePath = currPath + f"/output/image_{timeStamp}.png"
        #OpenCVControlObj.saveCurrentFrameLocally(savePath)
    
        CompareImagesObj.setCurrentImage(frame)
        #motionFlag = CompareImagesObj.funcCompareImages(True, f"{timeStamp}", True)
        motionFlag, diffValue = CompareImagesObj.funcCompareImages()
        #print(f"{timeStamp}: {motionFlag}")
        
        if (OpenCVControlObj.getRecord() == True and time.time() - startRecordTime >= processSettingsObj.getRecordTimeMinimumSeconds()):
            startRecordTime = time.time()
            #print(f"**Checking if extend {motionFlag}, thres: {CompareImagesObj.threshold}, diff: {diffValue}")
            #CompareImagesObj.saveImages(timeStamp)
            if (motionFlag == False):
                OpenCVControlObj.setRecord(False)
            # else, if still has 'motion' allow to keep recording.
        
        if (OpenCVControlObj.getRecord() == False and motionFlag == True):
            startRecordTime = time.time()
            OpenCVControlObj.setRecord(True, currPath + f"/output/recorded_{timeStamp}.avi")
        
        if (OpenCVControlObj.getRecord() == True):
            OpenCVControlObj.writeFrame()
    
    
    OpenCVControlObj.endStream()
    processSettingsObj.setRunning(False)
    #print('Camera ended')
    #OpenCVControlObj.quit = True
    #if (threadCaptureStream.is_alive()):
        # wait for join
    #    threadCaptureStream.join()
    #print('===/ Camera Thread ===\n')
    logger.info('===/ Camera Thread ===\n')
    return
        
def main(logger, currPath, rtspStreamURL):
    #print('= Main: Start')
    logger.info('= Main: Start')
    
    processSettingsObj = processSettings()
    settingOpts = []
    for k, v in processSettingsObj.settings.items():
        settingOpts.append(k)
    
    running = True
    newSettings = True
    while (running):
        print('=== Configure settings ===')
        print("*Enter 'back' to go to previous setting.")
        print("*Enter 'quit' to quit the program.")
        i = 0
        while (running == True and newSettings == True and i < len(settingOpts)):
            while (True):
                val = input('> ' + processSettingsObj.settings[settingOpts[i]]['q'])
                try:
                    if (val == 'quit'):
                        print("Terminating...")
                        running = False
                        break
                    elif (val == 'back'):
                        if (i > 0):
                            i = i - 1
                        continue
                        
                    val = float(val)
                    #print(val)
                    
                    res = processSettingsObj.settings[settingOpts[i]]['cb'](val)
                    if (res == True):
                        i = i + 1	# next question
                        break
                except:
                    print("Please enter a number, 'back', or 'quit'.")
        
        print('===/ Configure settings ===\n')
        
        newSettings = False
        
        if (running == False):
            break

        processSettingsObj.setRunning(True)
        threadAnalyzeVideoStream = threading.Thread(target=threadFuncAnalyzeVideoStream, args=(currPath, rtspStreamURL, processSettingsObj, logger))
        threadAnalyzeVideoStream.start()
        
        options = ''
        for k, v in processSettingsObj.changeOptions.items():
            text = v['text']
            options += f"{k}: {text}\n"
            
        while (running):
            print("=== Change settings ===")
            print(options)
            print("*Enter 'new' to choose new settings.")
            print("*Enter 'restart' to restart with same settings.")
            print("*Enter 'quit' to quit the program.")
            print('---')
            opt = input('If want to change a setting, enter a selection: ')
            
            if (opt == 'new'):
                newSettings = True
                processSettingsObj.setRunning(False)
                threadAnalyzeVideoStream.join()
                break
            elif (opt == 'restart'):
                newSettings = False
                processSettingsObj.setRunning(False)
                threadAnalyzeVideoStream.join()
                break
            elif (opt == 'quit'):
                print("Terminating...")
                running = False
                break
            elif (not opt in processSettingsObj.changeOptions):
                print('Option does not exist.')
                continue

            question = processSettingsObj.changeOptions[opt]['q']
            if (question != ''):
                print("*Enter 'back' to go to previous setting.")
                while (True):
                    ans = input(question)
                    try:
                        if (ans == 'quit'):
                            print("Terminating...")
                            running = False
                            break
                        elif (ans == 'back'):
                            break
                            
                        ans = float(ans)
                        
                        res = processSettingsObj.changeOptions[opt]['cb'](ans)
                        if (res == True):
                            break
                    except:
                        print("Please enter a number, 'back', or 'quit'.")
            else:
                processSettingsObj.changeOptions[opt]['cb']()
                        
            print('\n')
        print('\n')
    
    processSettingsObj.setRunning(False)    
    threadAnalyzeVideoStream.join()
    #print('=/ Main: End')
    logger.info('=/ Main: End')

if __name__ == '__main__':
    currPath = os.getcwd()
    
    
    # project's folders
    folders = ["output", "logging"]
    for folder_name in folders:
        folder_path = currPath + "/" + folder_name
        if os.path.isdir(folder_path):
            print(f"The folder '{folder_path}' exists.")
        else:
            print(f"The folder '{folder_path}' does not exist. Creating...")
            try:
                os.mkdir(folder_path)
                print(f"The folder '{folder_path}' created successfully.")
            except Exception as e:
                print(f"The folder '{folder_path}' could not be created. {e}")
                print("Could not initialize program. Quitting...")
                sys.exit(1)
                
    
    # logger
    logger = logging.getLogger('my_camera_logger')
    logger.setLevel(logging.DEBUG) # Set the desired logging level
    # Create a file handler
    file_handler = logging.FileHandler(currPath + '/logging/camera_application.log')
    file_handler.setLevel(logging.DEBUG)
    # Create a formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    # Add the file handler to the logger
    if not logger.handlers: # Prevent adding multiple handlers if the logger is re-configured
        logger.addHandler(file_handler)
    logger.info("Start")
    
    
    # .env
    envVals = []
    load_dotenv() # This loads the variables from .env
    key = "RTSP_STREAM_URL"
    rtspStreamURL = os.getenv(key)
    envVals.append([key, rtspStreamURL])
    
    logMsg = ''
    for val in envVals:
        if (val[1] is None):
            logMsg += f"env: {val[0]} missing.\n"
            
    if (len(logMsg) > 0):
        logger.critical(logMsg)
        logger.info("End")
    
    
    sys.exit(0)
    main(logger, rtspStreamURL)
    logger.info("End")