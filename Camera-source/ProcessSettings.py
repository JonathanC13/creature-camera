import time
import math
from datetime import datetime, timedelta

class ProcessSettings:
    def __init__(self):
        
        self.settings = {
            'Duration in minutes': {'q': 'Enter the duration, in minutes, the camera should be active: ', 'a': 0, 'cb': self.setDurationMin, 'get': self.getDurationMin},
            'Record minimum in seconds': {'q': 'Enter the duration, in seconds, the camera should record when there is motion (Note, when duration ends recording will also end.): ', 'a': 0, 'cb': self.setRecordTimeMinimumSeconds, 'get': self.getRecordTimeMinimumSeconds},
            'Extend multiple': {'q': 'Enter the number of times to extend recording if motion continues at minimum recording time (if decimal entered, it will round up): ', 'a': 0, 'cb': self.setRecordExtendMultiple, 'get': self.getRecordExtendMultiple},
            'Threshold change percent': {'q': 'Enter the percent, [0 to 100], of change between images that indicate motion: ', 'a': 0, 'cb': self.setThresholdPercent, 'get': self.getThresholdPercent}
        }
        
        self.changeOptions = {
            '1': {'text': 'Change duration', 'q': 'Enter the new duration, in minutes, the camera should be active (continues from previous duration): ', 'cb': self.setDurationMin},
            '2': {'text': 'Restart duration', 'q': '', 'cb': self.restartDuration},
            '3': {'text': 'Request remaining time', 'q': '', 'cb': self.getRemainingTime},
            '4': {'text': 'Change record duration', 'q': 'Enter the new duration, in seconds, the camera should record when there is motion: ', 'cb': self.setRecordTimeMinimumSeconds},
            '5': {'text': 'Change extend multiple', 'q': 'Enter the new extend multiple: ', 'cb': self.setRecordExtendMultiple},
            '6': {'text': 'Change threshold percent', 'q': 'Enter the new percent, [0 to 100], of change between images that indicate motion: ', 'cb': self.setThresholdPercent},
            '7': {'text': 'Show current settings', 'q': '', 'cb': self.getCurrentSettings}
        }
        
        self.recordExtendMultiple = 1
        
        self.startTime = time.time()
        self.running = False
        
    def setRecordExtendMultiple(self, i):
        if (i < 0):
            print('Please enter a value > 0')
            return False
        else:
            self.settings['Extend multiple']['a'] = math.ceil(i)
            return True
        
    def getRecordExtendMultiple(self):
        return self.settings['Extend multiple']['a']
        
    def setRunning(self, state):
        self.running = state
        return True
        
    def getRunning(self):
        return self.running
        
    def getCurrentSettings(self):
        print('=== Current settings ===')
        startDateTime = datetime.fromtimestamp(self.startTime).strftime("%Y-%m-%d %H:%M:%S")
        endDateTime = datetime.fromtimestamp(self.startTime + self.settings['durationMin']['a'] * 60).strftime("%Y-%m-%d %H:%M:%S")
        print(f'Start time: {startDateTime}')
        print(f'End time: {endDateTime}')
        for k, v in self.settings.items():
            print(f'{k}: {v["a"]}')
        print('===/ Current settings ===')
        return True
        
    def restartDuration(self):
        print('Start time reset to now.')
        self.startTime = time.time()
        return True
        
    def getRemainingTime(self):
        start = datetime.fromtimestamp(self.startTime)
        end = datetime.fromtimestamp(self.startTime + self.settings['Duration in minutes']['a'] * 60)
        curr = datetime.now()
        diff = (end - datetime.now()).total_seconds()
        print(f'Start time: {start.strftime("%Y-%m-%d %H:%M:%S")}')
        if (diff < 0):
            print('Already finished.')
        else:
            mins = diff // 60
            sec = diff % 60
            print(f'Remaining: {mins} minutes, {sec:.0f} seconds')
            
        print(f'End time: {end.strftime("%Y-%m-%d %H:%M:%S")}')
        return True
        
    def setDurationMin(self, durationMin):
        self.settings['Duration in minutes']['a'] = durationMin
        return True
        
    def getDurationMin(self):
        return self.settings['Duration in minutes']['a']
    
    def setRecordTimeMinimumSeconds(self, recordTimeMinimumSeconds):
        if (recordTimeMinimumSeconds > 60):
            recordTimeMinimumSeconds = 60
        self.settings['Record minimum in seconds']['a'] = recordTimeMinimumSeconds
        return True
        
    def getRecordTimeMinimumSeconds(self):
        return self.settings['Record minimum in seconds']['a']
    
    def setThresholdPercent(self, thresholdPercent):
        if (thresholdPercent < 0 or thresholdPercent > 100):
            print("Please enter a value from [0 to 100]")
            return False
        self.settings['Threshold change percent']['a'] = thresholdPercent
        return True
        
    def getThresholdPercent(self):
        return self.settings['Threshold change percent']['a']
        
    def setStartTime(self, startTime):
        self.startTime = startTime
        return True
        
    def getStartTime(self):
        return self.startTime
    
    def getCurrentSettings(self):
        settingsStr = ''
        for k, v in self.settings.items():
            val = v['get']()
            settingsStr += f"{k}: {val}\n"
            
        print(settingsStr)
        return True
