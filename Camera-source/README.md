# Creature Camera RPi
OpenCV to process the images and videos from the connected Wi-Fi camera.

# Function
<ul>
  <li>Connect the Wi-Fi camera to the RPi Wi-Fi network</li>
  <li>Manage the camera's active session for video processing to detect motion, save frames to record video, and upload to the server</li>
</ul>

# .env variables to set
RTSP_STREAM_URL='rtsp://192.72.1.1:554/liveRTSP/av4/track0'  # RTSP from your camera
<br>
CAMERA_JWT_KEY=''  # Manually set key, needs to match a registered camera token from the server's DB to be authorized to upload
<br>
API_uploadVideoURL='http://192.168.1.6:5000/uploadVideo'

# To run
> python main.py
