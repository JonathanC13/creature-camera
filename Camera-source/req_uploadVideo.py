import configparser
import os
import logging
import requests
from dotenv import load_dotenv

def req_uploadVideo(recordFilename):
    if (filename == ""):
        return
    
    load_dotenv()
    
    currPath = os.getcwd()
    config = configparser.ConfigParser()
    config_file_path=os.path.join(currPath, "config", "config.ini")
    config.read(config_file_path)
    
    logger = logging.getLogger(config['LOG_INFO']['loggerName'])
    
    url = config["SETTINGS"]["api_uploadVideoURL"]
    # Create a dictionary of headers
    # Header keys are typically strings, and values are also strings.
    token = os.getenv("CAMERA_JWT_KEY")
    headers = {
        'authorization': f'Bearer {token}'
    }

    # Open a file named 'example.txt' in read mode
    try:
        with open(config["FOLDERS"]["recordedFolder"] + f"/{recordFilename}", 'rb') as openedFile:
            
            # POST request
            # (fieldname: (filename, file_object, content_type, headers))
            file = {'file': (f"{recordFilename}", openedFile, 'video/avi')}
            data = {"cameraName": configSettingsObj["cameraName"]}
            response = requests.post(url, files=file, data=data, headers=headers)
        
            #print(response.status_code, response.text)
            # status_code: The HTTP status code (e.g., 200 for success, 404 for not found).
            # text: The response content as a string.
            # json(): Parses the response content as JSON (if applicable).
            # headers: A dictionary of response headers.
            if (response.status_code == 201):
                logger.info(f"req_uploadVideo: Upload successful.")
            else:
                logger.error(f"req_uploadVideo: Upload unsuccessful. Server error.")
                
            try:
                responseJSON = response.json()
                msg = responseJSON['message']
                logger.info(f"req_uploadVideo: Response content: {msg}.")
                
            except requests.exceptions.RequestException as e:
                print("WARN: req_uploadVideo: Could not parse response conent to JSON format.")
                logger.warning(f"req_uploadVideo: Could not parse response conent to JSON format.")      

    except FileNotFoundError:
        print("ERR: req_uploadVideo: Record filename was not found.")
        logger.critical('ERR: req_uploadVideo: Record filename was not found.')
