import cv2
import threading
import time
import os
import logging
import sys
import configparser
from dotenv import load_dotenv
from collections import deque
from OpenCVControl import OpenCVControl
from CompareImages import CompareImages
from ProcessSettings import ProcessSettings
from req_uploadVideo import req_uploadVideo, test
from setup import setup, getConfigPath, getConfigSettings


def threadFuncAnalyzeVideoStream(processSettingsObj):
    load_dotenv()
    
    currPath = os.getcwd()
    configPath = getConfigPath()
    config = getConfigSettings()
    
    logger = logging.getLogger(config['LOG_INFO']['logger_name'])
    
    #print('=== Camera Thread ===')
    logger.info('== Camera Thread: Started')
        
    OpenCVControlObj = OpenCVControl(os.getenv('RTSP_STREAM_URL'))
    
    if (not OpenCVControlObj.getCaptureOpened()):
        #print(f"ERR: Could not open video stream with URL {rtspStreamURL}")
        logger.critical(f"ERR: Could not open video stream with URL, check .env")
        return
        
    CompareImagesObj = CompareImages(processSettingsObj.getThresholdPercent())
    
    #captureDelayNs = captureDelayMs * 1000000		#captureDelayMs from param. May need to set capture delay for read() because if unrestricted capture for frames to compare it will sometimes grab the old
    
    #currRun = 0
    #maxRun = processSettingsObj.durationMin * 60	# seconds
    #threadCaptureStream = OpenCVControlObj.startThread()
    #time.sleep(1)	# time to start up stream.
    uploadVideoThreadsQueue = deque()
    
    # record properties
    #currRecordLen = 0
    #minRecordLen = 1	# seconds
    
    startRecordIntervalTime = time.time()
    startRecordTime = time.time()
    
    processSettingsObj.setStartTime(time.time())
    logStart = time.time()
    capTime = time.time_ns()
    
    frameRetry = 0
    maxFrameRetry = 3
    
    recordExtended = 0
    
    try:
        maxRecordingLengthInSeconds = float(processSettingsObj.maxRecordingLengthInSeconds)
    except ValueError:
        print(f"Error: '{maxRecordingLengthInSeconds}' is not a valid number. Please correct in {configPath} and restart program.")
        logger.critical(f"Error: '{maxRecordingLengthInSeconds}' is not a valid number. Please correct in {configPath}")
        print('\n**Current camera session completed.**\n')
        logger.info('===/ Camera Thread ===\n')
        return
    
    recordFolder = config['FOLDERS']['recorded_folder'] 
    recordFilename = ""
    
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
                logger.error(f"ERR: {maxFrameRetry} frame retries reached. Break.")
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
    
        #savePath = currPath + f"/recorded/image_{timeStamp}.png"
        #OpenCVControlObj.saveCurrentFrameLocally(savePath)
    
        CompareImagesObj.setCurrentImage(frame)
        motionFlag, rectanglePoints, diffValue  = CompareImagesObj.funcCompareImages(True, f"{timeStamp}", False)
        #motionFlag, rectanglePoints, diffValue = CompareImagesObj.funcCompareImages()
        
        #print(f"{timeStamp}: {motionFlag}: {diffValue}: {CompareImagesObj.getThreshold()}")
        
        # if recording and (record length >= min record length for interval or total record time >= max record length)
        if (OpenCVControlObj.getRecord() == True and (time.time() - startRecordIntervalTime >= processSettingsObj.getRecordTimeMinimumSeconds() or time.time() - startRecordTime >= maxRecordingLengthInSeconds)):
            # when recording duration completed
            
            #print(f"**Checking if extend {motionFlag}, thres: {CompareImagesObj.threshold}, diff: {diffValue}")
            #CompareImagesObj.saveImages(timeStamp)
            # Do not extend if; 1. no motion, 2. extended the current recorded max number of times. 3. At max recording length for a single file.
            if (motionFlag == False or recordExtended >= processSettingsObj.getRecordExtendMultiple() or time.time() - startRecordTime >= maxRecordingLengthInSeconds):
                #print(time.time() - startRecordTime)
                print('recording ended')
                OpenCVControlObj.setRecord(False, '')
                
                # clear finished threads. Once found a thread still running, break.
                while (len(uploadVideoThreadsQueue) > 0):
                    if (uploadVideoThreadsQueue[0].is_alive() == False):
                        uploadVideoThreadsQueue.popleft()
                    else:
                        break
                
                # once recording is finised upload to server create thread to upload to server
                #print(recordFilename)
                #threadUploadVideo = threading.Thread(target=req_uploadVideo, args=(recordFilename,))
                #threadUploadVideo.start()
                #uploadVideoThreadsQueue.append(threadUploadVideo)
                
                recordFilename = ""
                
            else:
                # still has 'motion', therefore keep recording.
                # need to track how many times extended
                startRecordIntervalTime = time.time()
                recordExtended += 1
        
        if (OpenCVControlObj.getRecord() == False and motionFlag == True):
            # start recording
            print('recording')
            recordExtended = 0
            startRecordIntervalTime = time.time()
            startRecordTime = time.time()
            recordFilename = f"recorded_{timeStamp}.avi"
            OpenCVControlObj.setRecord(True, recordFolder + f"/{recordFilename}")
        
        if (OpenCVControlObj.getRecord() == True):
            # during record, write the frame
            OpenCVControlObj.writeFrame(rectanglePoints)
    
    
    OpenCVControlObj.endStream()
    logger.info('OpenCV stream closed')
    processSettingsObj.setRunning(False)
    
    logger.info(f'uploadVideoThreads to join: {len(uploadVideoThreadsQueue)}')
    while (len(uploadVideoThreadsQueue) > 0):
        if (uploadVideoThreadsQueue.popleft().is_alive() == True):
            # wait for join
            thread.join()
        logger.info('Joined.')
            
    #print('Camera ended')
    #OpenCVControlObj.quit = True
    #if (threadCaptureStream.is_alive()):
        # wait for join
    #    threadCaptureStream.join()
    #print('===/ Camera Thread ===\n')
    print('\n**Current camera session completed.**\n')
    logger.info('===/ Camera Thread ===')
    return
        
def main():
    config = getConfigSettings()
    
    logger = logging.getLogger(config['LOG_INFO']['logger_name'])
    logger.info('= Main: Start')
    
    processSettingsObj = ProcessSettings()
    
    try:
        maxRecordingLengthInSeconds = float(processSettingsObj.maxRecordingLengthInSeconds)
    except ValueError:
        print(f"Error: '{maxRecordingLengthInSeconds}' is not a valid number. Please correct in {getConfigPath()}")
        return
    
    settingOpts = []
    for k, v in processSettingsObj.settings.items():
        settingOpts.append(k)
    
    threadAnalyzeVideoStream = None
    
    running = True
    newSettings = True
    while (running):
        print('=== Configure settings ===')
        print("*Enter 'back' to go to previous setting.")
        print("*Enter 'quit' to quit the program.")
        print(f"Reminder: Absolute maxiumum video recording length is {processSettingsObj.maxRecordingLengthInSeconds} seconds. Set in {getConfigPath()}")
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
        threadAnalyzeVideoStream = threading.Thread(target=threadFuncAnalyzeVideoStream, args=(processSettingsObj,))
        threadAnalyzeVideoStream.start()
        print('Camera: Running...')
        
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
    
    print('Camera: Stopped.')
    processSettingsObj.setRunning(False)
    if (threadAnalyzeVideoStream is not None):  
        threadAnalyzeVideoStream.join()
    #print('=/ Main: End')
    logger.info('=/ Main: End/n')
    
if __name__ == '__main__':
    #test()
    
    if setup() == False:
        sys.exit(1)
        
    main()
