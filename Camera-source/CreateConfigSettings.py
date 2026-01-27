from dotenv import load_dotenv
import os
import configparser
import logging

class CreateConfigSettings:
    def __init__(self, folders, logInfo, configInfo):
        self.configError = False
        
        currPath = os.getcwd()
        config_file_path = os.path.join(currPath, folders['configFolder'], configInfo['configFileName'])
        config = configparser.ConfigParser()
        
        self.configSettings = {
                "comment" : "config file is re-created every time, please see main.py and CreateConfig.py for settings.",
                "cameraName" : "this camera",
                "recordedPath" : currPath + "/recorded",
                "api_uploadVideoURL" : "http://192.168.1.2:5000/api/v1/uploadVideo"
            }
        
        loggerName = logInfo['loggerName']
        self.logger = logging.getLogger(loggerName)
        
        self.envVals = ["RTSP_STREAM_URL", "CAMERA_JWT_KEY"]	
        self.checkEnvVals()
        #self.loadEnv()	# don't do this lol.
        
        config['SETTINGS'] = self.configSettings
        config['FOLDERS'] = folders
        config['LOG_INFO'] = logInfo
        config['CONFIG_INFO'] = configInfo
        
        try:
            with open(config_file_path, 'w') as configfile:
                config.write(configfile)
            self.logger.info(f"CreateConfig: Configuration file '{config_file_path}' created successfully.")
        except IOError as e:
            self.logger.critical(f"ERR: CreateConfig: Error creating configuration file '{config_file_path}': {e}")
            self.configError = True
            
    def getConfigError(self):
        return self.configError
    
    def checkEnvVals(self):
        # .env
        load_dotenv() # This loads the variables from .env
        
        logMsg = ''
        
        for key in self.envVals:
            val = os.getenv(key)
            if (val is None):
                logMsg += f"ERR: CreateConfig: env: {key} missing.\n"
                
        if (len(logMsg) > 0):
            self.logger.critical(logMsg)
            self.configError = True
            
        self.configSettings["configError"] = self.configError
        
    def loadEnv(self):
        # .env
        load_dotenv() # This loads the variables from .env
        
        logMsg = ''
        
        for key in self.envVals:
            val = os.getenv(key)
            if (val is None):
                logMsg += f"ERR: CreateConfig: env: {key} missing.\n"
            self.configSettings[key] = val
                
        if (len(logMsg) > 0):
            self.logger.critical(logMsg)
            self.configError = True
            
        self.configSettings["configError"] = self.configError

def main(folders, logInfo, configInfo):
    
    CreateConfigSettingsObj = CreateConfigSettings(folders, logInfo, configInfo)
    
    currPath = os.getcwd()
    config_file_path = os.path.join(currPath, folders['configFolder'], configInfo['configFileName'])
    
    loggerName = logInfo['loggerName']
    logger = logging.getLogger(loggerName)
    
    if os.path.exists(config_file_path):
        if os.path.isfile(config_file_path):
            logger.info(f"Config file exists. {config_file_path}")
        else:
            logger.critical(f"ERR: Config file does not exist. Quitting. {config_file_path}")
            return False
    else:
        logger.critical(f"ERR: Config file does not exist. Quitting. {config_file_path}")
        return False
        
    if CreateConfigSettingsObj.getConfigError() == True:
        logger.critical(f"ERR: There was an error within the config file. Quitting.")
        return False
    
    return True
    