from dotenv import load_dotenv
from dotenv.main import set_key
import os
import configparser
import logging

projectSettings = {
        'folders':{
            'image_output_folder' : 'imageOutput',
            'recorded_folder' : 'recorded',
            'logging_folder' : 'logging',
            'config_folder' : 'config'
        },
        'log_info': {
            'logger_name' : "my_camera_logger",
            'logger_file' : "camera_application.log"
        },
        'env_keys': ["RTSP_STREAM_URL", "CAMERA_JWT_KEY", "API_uploadVideoURL"],
        'config_info': {
            'config_file_name' : "config.ini"
        }
        
    }

currPath = os.getcwd()

def getLoggingPath():
    folders = projectSettings['folders']
    logInfo = projectSettings['log_info']
    return os.path.join(currPath, folders['logging_folder'], logInfo['logger_file'])

def getEnvPath():
    return currPath + "/" + ".env"

def getConfigPath():
    folders = projectSettings['folders']
    configInfo = projectSettings['config_info']
    return os.path.join(currPath, folders['config_folder'], configInfo['config_file_name'])

def getConfigSettings():
    folders = projectSettings['folders']
    configInfo = projectSettings['config_info']
    config = configparser.ConfigParser()
    config_file_path = getConfigPath()
    config.read(config_file_path)
    
    return config

def verifyFolders():  
    folders = projectSettings['folders']
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


def setLogger():
    logInfo = projectSettings['log_info']
    folders = projectSettings['folders']
    
    print("Logger: checking...")
    # logger
    loggerName = logInfo['logger_name']
    logger_file_path = getLoggingPath()
    
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
        
    return logInfo['logger_name'] in logging.Logger.manager.loggerDict


def verifyEnv():
    envKeys = projectSettings['env_keys']
    logInfo = projectSettings['log_info']
    
    print(f".env: checking...")
    envPath = getEnvPath()
    
    loggerName = logInfo['logger_name']
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
    
    if not (isinstance(config_dict, dict) and isinstance(configResources, dict)):
        return
    
    for key in configResources:
        if key not in config_dict:
            print(key)
            config_dict[key] = configResources[key]
        else:
            validateConfigKeys(config_dict[key], configResources[key])
        

def checkConfigFileExists():
    configInfo = projectSettings['config_info']
    folders = projectSettings['folders']
    logInfo = projectSettings['log_info']
    config_file_path = getConfigPath()
    
    print('Config file: checking...')
    
    config = configparser.ConfigParser()
        
    configSettings = {
            "comment" : "If application has erros related to this config file, either manually configure or delete this file then re-run.",
            "camera_name" : "this camera",
            "recorded_path" : currPath + "/recorded",
            "max_recording_length_in_seconds" : "60"
            #"api_uploadVideoURL" : "http://192.168.1.2:5000/api/v1/uploadVideo"
        }
    
    configResources = {
        'SETTINGS': configSettings,
        'FOLDERS': folders,
        'LOG_INFO': logInfo,
        'CONFIG_INFO': configInfo
        }
    
    config.read_dict(configResources)
    
    loggerName = logInfo['logger_name']
    logger = logging.getLogger(loggerName)
    
    try:
        with open(config_file_path, 'x') as configfile:
            config.write(configfile)
        logger.info(f"Config file: Configuration file '{config_file_path}' created successfully.")
    except FileExistsError:
        logger.info(f"Config file exists... GOOD... If application has config errors, either manually configure or delete {config_file_path} then re-run.")
        
        config.read(config_file_path)
        # check keys
        config_dict = {}
        for section in config.sections():
            config_dict[section] = dict(config.items(section))
        
        validateConfigKeys(config_dict, configResources)
        
        configVal = configparser.ConfigParser()
        configVal.read_dict(config_dict)

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
    
    # test grab a value
    #config.read(config_file_path)
    #print(config['SETTINGS']['recordedpath'])
    
    print('Config file: complete.')
    return True


# setup Folders and logger
def setup():
    
    if verifyFolders() == False:
        print('Necessary folders could not be created... Quitting')
        return False
    
    if setLogger() == False:
        print('Logger could not be created... Quitting')
        return False
    print("Logger: complete.")

    if verifyEnv() == False:
        return False
    
    if checkConfigFileExists() == False:
        print('Config file could not be created... Quitting')
        return False
        
    print('\n\n')
    return True
