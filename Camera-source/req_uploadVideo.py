import configparser
import os
import logging
import requests
from dotenv import load_dotenv
from setup import getConfigSettings

def test():
    url = 'http://192.168.1.22:5000/' # Example URL
    response = requests.get(url)

    # Check the status code (200 means success)
    print(f"Response: {response}")
    

def req_uploadVideo(recordFilename):
    if (recordFilename == ""):
        return
    
    load_dotenv()
    
    currPath = os.getcwd()
    config = getConfigSettings()
    
    load_dotenv(override=True)
    api_uploadVideoURL = os.getenv('API_uploadVideoURL')
    
    logger = logging.getLogger(config['LOG_INFO']['logger_name'])
    # Create a dictionary of headers
    # Header keys are typically strings, and values are also strings.
    token = os.getenv("CAMERA_JWT_KEY")
    headers = {
        'authorization': f'Bearer {token}'
    }

    # Open a file named 'example.txt' in read mode
    try:
        with open(config["FOLDERS"]["recorded_folder"] + f"/{recordFilename}", 'rb') as openedFile:
            
            # POST request
            # (fieldname: (recordFilename, file_object, content_type, headers))
            file = {'file': (f"{recordFilename}", openedFile, 'video/avi')}
            data = {"cameraName": config['SETTINGS']["camera_name"]}
            response = requests.post(api_uploadVideoURL, files=file, data=data, headers=headers)
            logger.info(f'req_uploadVideo: Upload sending to {api_uploadVideoURL}...')
        
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
                #print("WARN: req_uploadVideo: Could not parse response conent to JSON format.")
                logger.warning(f"req_uploadVideo: Could not parse response conent to JSON format.")      

    except FileNotFoundError:
        #print("ERR: req_uploadVideo: Record filename was not found.")
        logger.critical(f'ERR: req_uploadVideo: Record filename {recordFilename} was not found.')
