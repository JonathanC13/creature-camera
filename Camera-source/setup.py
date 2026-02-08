from dotenv import load_dotenv
from dotenv.main import set_key
import os
import configparser
import logging

def verifyFolders(folders):
    currPath = os.getcwd()    
    
    # project's folders
    print("Folders: checking...")
    
    for k, folder_name in folders.items():
        folder_path = currPath + "/" + folder_name
        if os.path.isdir(folder_path):
            print(f"The folder '{folder_path}' exists... GOOD")
        else:
            print(f"The folder '{folder_path}' does not exist. Creating...")
            try:
                os.mkdir(folder_path)
                print(f"The folder '{folder_path}' created successfully... GOOD")
            except Exception as e:
                print(f"ERR: The folder '{folder_path}' could not be created. {e}")
                print("ERR: Could not initialize program. Quitting...")
                return False
            
        try:
            with open(folder_path + "/" + ".gitignore", 'w') as file:
                file.write("*\n")
                file.write("!.gitignore")
        except Exception as e:
            print(f"ERR: Could not create .gitignore in the folder '{folder_path}'. {e}")
            print("ERR: Could not initialize program. Quitting...")
            return False
            
    print("Folders: complete.")
    
    return True


def setLogger(logInfo, folders):
    currPath = os.getcwd()
    
    print("Logger: checking...")
    # logger
    loggerName = logInfo['loggerName']
    logger_file_path = os.path.join(currPath, folders['loggingFolder'], logInfo['loggerFile'])
    
    logger = logging.getLogger(loggerName)
    logger.setLevel(logging.DEBUG) # Set the desired logging level
    # Create a file handler
    file_handler = logging.FileHandler(logger_file_path)
    file_handler.setLevel(logging.DEBUG)
    # Create a formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    # Add the file handler to the logger
    if not logger.handlers: # Prevent adding multiple handlers if the logger is re-configured
        logger.addHandler(file_handler)
        
    return logInfo['loggerName'] in logging.Logger.manager.loggerDict


def verifyEnv(envKeys, logInfo):
    currPath = os.getcwd()
    
    print(f".env: checking...")
    envPath = currPath + "/" + ".env"
    
    loggerName = logInfo['loggerName']
    logger = logging.getLogger(loggerName)
    
    # check if .env file exists
    try:
        with open(envPath, 'x') as file:
            for key in envKeys:
                set_key(envPath, key, "")
           
        logger.info(f".env file created successfully... GOOD")
    except FileExistsError:
        logger.info(f".env file exists... GOOD")
    except Exception as e:
        logger.error(f"ERR: Error creating .env file occurred: {e}")
        print(f"Error creating .env file... see log file.")
        return False
        
    load_dotenv(override=True) # This loads the variables from .env
    
    for key in envKeys:
        val = os.getenv(key)
        if (val is None):
            # create key
            try:
                with open(envPath, 'a') as file:
                    set_key(envPath, key, "")
            except Exception as e:
                logger.error(f"ERR: Error writing to .env file occurred: {e}")
                print(f"Error writing to .env file... see log file.")
                return False
                
        val = os.getenv(key)
        if (val == ""):
            while (val == ""):
                # prompt user for value
                val = input(f".env: Value for {key} is empty. Enter value: ")
            
            set_key(envPath, key, val)
    
    print(f".env: complete.")
    return True

def validateConfigKeys(config_dict, configResources):
    for key in configResources:
        if key not in config_dict:
            config_dict[key] = configResources[key]
        else:
            validateConfigKeys(config_dict[key], configResources[key])
        

def checkConfigFileExists(configInfo, folders, logInfo):
    currPath = os.getcwd()
    config_file_path = os.path.join(currPath, folders['configFolder'], configInfo['configFileName'])
    
    print('Config file: checking...')
    
    config = configparser.ConfigParser()
        
    configSettings = {
            "comment" : "If application has erros related to this config file, either manually configure or delete this file then re-run.",
            "cameraName" : "this camera",
            "recordedPath" : currPath + "/recorded"
            #"api_uploadVideoURL" : "http://192.168.1.2:5000/api/v1/uploadVideo"
        }
    
    configResources = {
        'SETTINGS': configSettings,
        'FOLDERS': folders,
        'LOG_INFO': logInfo,
        'CONFIG_INFO': configInfo
        }
    
    config.read_dict(configResources)
    
    loggerName = logInfo['loggerName']
    logger = logging.getLogger(loggerName)
    
    try:
        with open(config_file_path, 'x') as configfile:
            config.write(configfile)
        logger.info(f"Config file: Configuration file '{config_file_path}' created successfully.")
    except FileExistsError:
        logger.info(f"Config file exists... GOOD... If application has config errors, either manually configure or delete {config_file_path} then re-run.")
        
        config.read('config.ini')
        # check keys
        config_dict = {}
        for section in config.sections():
            config_dict[section] = dict(config.items(section))
        
        validateConfigKeys(config_dict, configResources)
        
        configVal = configparser.ConfigParser()
        configVal.read_dict(configResources)

        try:
            with open(config_file_path, 'w') as configfileVal:
                configVal.write(configfileVal)
        except Exception as e:
            # Catch any other unexpected errors
            print(f"ERR: Config file: Error writing to config file: {e}")
            logger.error(f"ERR: Config file: Error writing to config file: {e}")
            return False
        
    except Exception as e:
        logger.error(f"ERR: Config file: Error creating configuration file '{config_file_path}': {e}")
        return False
    
    print('Config file: complete.')
    return True

# setup Folders and logger
def setup():
    
    folders = {
            'imageOutputFolder' : 'imageOutput',
            'recordedFolder' : 'recorded',
            'loggingFolder' : 'logging',
            'configFolder' : 'config'
        }
    if verifyFolders(folders) == False:
        print('Necessary folders could not be created... Quitting')
        return False
    
    logInfo = {
            'loggerName' : "my_camera_logger",
            'loggerFile' : "camera_application.log"
        }
    if setLogger(logInfo, folders) == False:
        print('Logger could not be created... Quitting')
        return False
    print("Logger: complete.")
    
    envKeys = ["RTSP_STREAM_URL", "CAMERA_JWT_KEY", "API_uploadVideoURL"]
    if verifyEnv(envKeys, logInfo) == False:
        return False
    
    configInfo = {
            'configFileName' : "config.ini"
        }
    if checkConfigFileExists(configInfo, folders, logInfo) == False:
        print('Config file could not be created... Quitting')
        return False
        
    return True