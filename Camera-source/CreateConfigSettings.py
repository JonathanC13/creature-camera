from dotenv import load_dotenv
import os
import configparser
import logging

# Create/validate .env and config file
class CreateConfigSettings:
    def __init__(self, folders, logInfo, configInfo):
        self.folers = folders
        self.configInfo = configInfo
        
        self.currPath = os.getcwd()
        self.envPath = self.currPath + "/" + ".env"
        self.config_file_path = os.path.join(self.currPath, self.folders['configFolder'], self.configInfo['configFileName'])
        
        self.configError = False
        
        loggerName = logInfo['loggerName']
        self.logger = logging.getLogger(loggerName)
        
        self.envKeys = ["RTSP_STREAM_URL", "CAMERA_JWT_KEY", "API_uploadVideoURL"]	
        envFileStatus = self.checkEnvFile()
        #self.loadEnv()	# don't do this lol.
        if envFileStatus == False:
            return
        
        if checkConfigFile == False:
            return
            
    def getConfigError(self):
        return self.configError
    
    def checkEnvFile(self):
        print(f"Checking .env file...")
        # check if .env file exists
        
        try:
            with open(self.envPath, 'x') as file:
                for key in self.envKeys:
                    set_key(self.envPath, key, "")
               
            self.logger.info(f".env file created successfully... GOOD")
        except FileExistsError:
            self.logger.info(f".env file exists... GOOD")
        except Exception as e:
            self.logger.info(f"ERR: Error creating .env file occurred: {e}")
            print(f"Error checking .env file... see log file.")
            self.configError = True
            return False
            
        load_dotenv(override=True) # This loads the variables from .env
        
        logMsg = ''
        
        for key in self.envKeys:
            val = os.getenv(key)
            if (val is None):
                #logMsg += f"ERR: CreateConfig: env: {key} missing.\n"
                # create key
                try:
                    with open(self.envPath, 'a') as file:
                        set_key(self.envPath, key, "")
                except Exception as e:
                    self.logger.info(f"ERR: Error writing to .env file occurred: {e}")
                    print(f"Error writing to .env file... see log file.")
                    self.configError = True
                    return False
                    
            val = os.getenv(key)
            if (val == ""):
                while (val == ""):
                    # prompt user for value
                    val = input(f"Value for .env key is empty. Enter value:")
                
                set_key(self.envPath, key, val)
                       
        #if (len(logMsg) > 0):
        #    self.logger.critical(logMsg)
        #    self.configError = True
        
        print(f"Finished checking .env file...")
        return True
        
    def checkConfigFile(self):
        config = configparser.ConfigParser()
        
        configSettings = {
                "comment" : "If application has erros related to this config file, either manually configure or delete this file then re-run.",
                "cameraName" : "this camera",
                "recordedPath" : currPath + "/recorded"
                #"api_uploadVideoURL" : "http://192.168.1.2:5000/api/v1/uploadVideo"
            }
        
        config['SETTINGS'] = self.configSettings
        config['FOLDERS'] = self.folders
        config['LOG_INFO'] = self.logInfo
        config['CONFIG_INFO'] = self.configInfo
        
        try:
            with open(self.config_file_path, 'x') as configfile:
                config.write(configfile)
            self.logger.info(f"CreateConfig: Configuration file '{self.config_file_path}' created successfully.")
        except FileExistsError:
            self.logger.info(f".env file exists... GOOD... If application has config errors, either manually configure or delete {self.config_file_path} then re-run.")
            # Assume keys GOOD.
        except Exception as e:
            self.logger.info(f"ERR: CreateConfig: Error creating configuration file '{config_file_path}': {e}")
            self.configError = True
            return False
        
        retrun True
        
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

# run CreateConfigSettings and finally validate file existence.
def main(folders, logInfo):
    configInfo = {
            'configFileName' : "config.ini"
        }
    
    CreateConfigSettingsObj = CreateConfigSettings(folders, logInfo, configInfo)
    
    loggerName = logInfo['loggerName']
    logger = logging.getLogger(loggerName)
    
    if os.path.isfile(CreateConfigSettingsObj.envPath):
        logger.info(f".env file exists. {CreateConfigSettingsObj.envPath}")
    else:
        logger.critical(f"ERR: .env file does not exist. Quitting. {CreateConfigSettingsObj.envPath}")
        return False
    
    if os.path.isfile(CreateConfigSettingsObj.config_file_path):
        logger.info(f"Config file exists. {CreateConfigSettingsObj.config_file_path}")
    else:
        logger.critical(f"ERR: Config file does not exist. Quitting. {config_file_path}")
        return False
        
    if CreateConfigSettingsObj.getConfigError() == True:
        logger.critical(f"ERR: There was an error within the config file. Quitting.")
        return False
    
    return True
    