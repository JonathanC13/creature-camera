import configparser
import subprocess
import os
import logging
import requests
import time
from dotenv import load_dotenv
from setup import getConfigSettings

def test():
    url = 'http://192.168.1.2:5000/' # Example URL
    response = requests.get(url)

    # Check the status code (200 means success)
    print(f"Response: {response}")

# wait to ensure the videoWriter for:
# 1. release may still be flushing internally
# 2. filesystem buffers may still be active
# 3. FFmpeg backend may still own the handle
# 4. next open may interfere
# Wait for stable file size
def wait_for_file_complete(path):
    last_size = -1

    while True:
        size = os.path.getsize(path)

        if size == last_size:
            return

        last_size = size
        time.sleep(0.5)

# For production systems recording many clips. More reliable for concurrent recording/upload systems
# Pure AVI works, but mp4 hash would mismatch after upload. wait_for_file_complete and then convertAviToMP4 = successful subsequent uploads.
def convertAviToMP4(directory, filename):
    name = filename.split(".")[0]
    avi_path = directory + '/' + filename
    mp4_path = directory + '/' + name + '.mp4'
    #print(avi_path)
    #print(mp4_path)
    # Convert AVI -> MP4 (H264)
    cmd = [
        "ffmpeg",
        "-y",                 # overwrite output
        "-i", avi_path,       # input
        "-c:v", "libx264",    # H264 codec
        "-preset", "fast",    # encoding speed
        "-pix_fmt", "yuv420p",# compatibility
        "-movflags", "+faststart",
        mp4_path
    ]

    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    #if result.returncode != 0:
    #    print("FFmpeg failed")
    #    print(result.stderr)
    #else:
    #    print("MP4 created:", mp4_path)
    #    print("Size:", os.path.getsize(mp4_path))
        
    return mp4_path

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
    
            
    path = config["FOLDERS"]["recorded_folder"] + f"/{recordFilename}"
    wait_for_file_complete(path)
    
    convertedFilename = convertAviToMP4(config["FOLDERS"]["recorded_folder"], recordFilename)
    

    # Open a file named 'example.txt' in read mode
    try:
        with open(path, 'rb') as openedFile:
            
            # POST request
            # (fieldname: (recordFilename, file_object, content_type, headers))
            file = {'file': (f"{convertedFilename}", openedFile, 'video/mp4')}
            data = {}
            response = requests.post(api_uploadVideoURL, files=file, headers=headers)
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
