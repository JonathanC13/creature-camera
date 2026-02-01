import logging
import os
import CreateConfigSettings

# setup Folders and logger
def setup():
    currPath = os.getcwd()    
    
    # project's folders
    print("Folders: checking...")
    folders = {
            'imageOutputFolder' : 'imageOutput',
            'recordedFolder' : 'recorded',
            'loggingFolder' : 'logging',
            'configFolder' : 'config'
        }
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
    print("Folders: GOOD")
    
    logInfo = {
            'loggerName' : "my_camera_logger",
            'loggerFile' : "camera_application.log"
        }
    
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
        
    logger.info("Logger started.")
    
    
    configStatus = CreateConfigSettings.main(folders, logInfo)
    if (configStatus == False):
        return False
        
    return True