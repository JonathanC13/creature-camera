import cv2
import threading
import numpy as np
import os.path
import logging
from setup import getConfigSettings

class CameraControl:
    def __init__(self, rtspStreamURL):
        currPath = os.getcwd()
        self.config = getConfigSettings()
        
        self.logger = logging.getLogger(self.config['LOG_INFO']['logger_name'])
        self.rtspStreamURL = rtspStreamURL
        self.capture = cv2.VideoCapture(rtspStreamURL)
        self.out = None
        self.quit = False
        self.record = False
        self.recordPath = ""
        
        self.ret = False
        self.frame = None
        
        self.maxReOpenRetry = 3
        self.maxFrameRetry = 3
        
        # record properties
        self.setRecordProperties()
        
        # mutex for shared resource
        #self.frameLock = threading.Lock()
        
    def getCaptureOpened(self):
        return self.capture.isOpened()
        
    def endStream(self):
        if (self.out is not None):	# end record if ongoing.
            self.out.release()
        self.capture.release() # Release the VideoCapture object
        cv2.destroyAllWindows() # Close all OpenCV windows
        
    def setRecord(self, record, path):
        self.record = record
        #print('\n')
        if (record == True and path != ""): 
            #print(f"CameraControl: **Trying to record to {path}")
            self.logger.info(f"CameraControl: setRecord: **Trying to record to {path}")
            self.recordPath = path
            self.out = cv2.VideoWriter(path, self.fourcc, self.fps, (self.width, self.height), True)    # For each video, need new VideoWriter
        else:
            #print("CameraControl: **Recording end.")
            self.logger.info("CameraControl: setRecord: **Recording end.")
            if (self.out is not None):
                # must release after each video complete.
                self.out.release()
                self.out = None
            
    def getRecord(self):
        return self.record
        
    def setRecordProperties(self):
        self.fourcc = cv2.VideoWriter_fourcc(*'XVID')  # format files so client browser can load into <source>
        self.fps = self.capture.get(cv2.CAP_PROP_FPS)
        self.width = int(self.capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self.out = None
        
    def writeFrame(self, frame=None):
        frame = self.frame if frame is None else frame
        if (frame is not None and self.out is not None):
            self.out.write(frame)
        elif (frame is None):
            self.logger.error("ERR: CameraControl: writeFrame: Frame is None.")
        elif (self.out is None):
            #print("CameraControl: Could not write for record.")
            self.logger.error("ERR: CameraControl: writeFrame: Out is None.")
        elif (self.record == False):
            #print("CameraControl: Record == False.")
            self.logger.info("CameraControl: writeFrame: Record == False.")
            
    def writeProcessedFrame(self, frame):
        self.writeFrame(frame)
        
    def getFrame(self):
        #self.frameLock.acquire(blocking=True)
        frame = self.frame
        #self.frameLock.release()
        return frame
    
    def readStream(self):
        self.ret, self.frame = self.capture.read()
        return self.ret, self.frame
    
    def saveCurrentFrameLocally(self, fullPath):
        ret = None
        frame = None
        
        #self.frameLock.acquire(blocking=True)
        ret = self.ret
        frame = self.frame
        #self.frameLock.release()
            
        if (ret == False):
            #print('no ret')
            self.logger.info('no ret')
            return
        
        try:
            cv2.imwrite(fullPath, frame)
            #print(f"CameraControl: Frame saved successfully as {fullPath}")
            self.logger.info(f"CameraControl: saveCurrentFrameLocally: Frame saved successfully as {fullPath}")
        except Exception as e:
            #print(f"CameraControl: Frame could not be saved. {e}")
            self.logger.error(f"ERR: CameraControl: Frame could not be saved. {e}")
    
    def retryOpenStream(self):
        retry = 1
        while (not self.capture.isOpened() and retry <= self.maxReOpenRetry):
            #print(f"CameraControl capture: Retrying to re-open stream... {retry}")
            self.logger.warning(f"WARN: CameraControl capture: Retrying to re-open stream... {retry}")
            self.capture.open()
            
            # record properties with new capture
            self.setRecordProperties()
        
            retry += 1
    
    def captureStream(self):
        #print("== CameraControl capture: running.")
        self.logger.info("== CameraControl: captureStream: running.")
        self.retryOpenStream()
            
        if (not self.capture.isOpened()):
            #print(f"CameraControl capture: Could not open video stream with URL {self.rtspStreamURL}")
            self.logger.critical(f"ERR: CameraControl: captureStream: Could not open video stream with URL {self.rtspStreamURL}")
            #print("==/ CameraControl capture: returned.")
            self.logger.info("==/ CameraControl: captureStream: returned.")
            return
        
        #print("Stream open")
        self.logger.info("CameraControl: captureStream: Stream open")
        frameRetry = 0
        while(not self.quit):
            #self.frameLock.acquire(blocking=True):
            self.ret, self.frame = self.capture.read()
            #frameLock.release()
            
            if (not self.ret):
                if (frameRetry >= self.maxFrameRetry):
                    #print(f"CameraControl capture: {self.maxFrameRetry} frame retries reached. Break.")
                    self.logger.warning(f"WARN: CameraControl capture: {self.maxFrameRetry} frame retries reached. Break.")
                    break
                frameRetry += 1
                self.retryOpenStream()
                continue
                
            frameRetry = 0
            
            if (self.record == True and self.out is not None):
                self.out.write(self.frame)
                
            if (self.record == False and self.out is not None):
                self.out.release()
            
        if (self.out is not None):
            self.out.release()
        self.capture.release() # Release the VideoCapture object
        cv2.destroyAllWindows() # Close all OpenCV windows
                
        #print("==/ CameraControl capture: returned.")
        self.logger.info("==/ CameraControl capture: returned.")
        return
    
    def startThread(self):
        thread = threading.Thread(target=self.captureStream, args=())
        thread.start()
        return thread
