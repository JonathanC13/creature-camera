# crispy-camera

Server 
    express.js
    dotenv
    mongoose
    express-async-errors
    multer
    json web token
    xss-filters
    http-status-codes
    pino    // logging

    * Setup in .env
        MONGO_URI

RPI
    .env
        1. camera token

DB will hold:
    camera keys. Each camera that wants to send to the server has a manually added key to their .env file and the DB will hold the same key so it can validate.

    Collections:
        user:
            1. user.subscriptions is Array of camera-information._id
        camera-information
            1. When need to get all users subscribed to a camera, use filter
                // Finds documents where the 'tags' array contains "electronics"
                const docs = await MyModel.find({ tags: "electronics" });
        * When updating, to ensure no duplicates either check myself or https://www.mongodb.com/docs/manual/reference/operator/update/addToSet/ 

todo:
    Server ** TODO
        1. middleware/verifyCameraMiddleware:  // todo setup model for Camera list with keys, verify key sent in header with keys in mongodb. 
        2. controllers/uploadVideo      // video bytes transferred to server (this PC), saves the video to a directory, mongoDB saves the file path for the video.
        3. user API
        4. add auth middleware before all user and camera routes

    RPI
        1.0. Test folder creation if missing. Also, create .gitignore if missing.   ** GOOD
        1.1. Setup logger if does not exist.    ** GOOD

        1.2. setup camera properties in .env ** GOOD
            - on start up:
                - check if file exists, if not create
                - if key's don't exist or value is "", then not prompt user.
                * Note: CAMERA_JWT_KEY can be anything, just needs to be added before use. The admin on the client side must be provided this key to add to the mongoDB if they want it on their network.
                key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYW1lcmFfbnVtYmVyIjoiMSIsImNhbWVyYV9uYW1lIjoiRmlyc3QgY2FtZXJhIn0.Af5bzfUQGgYVvR9yl42F3ovi47RuMbuJ4iJEj68nOm8"

            - TEST:
                - if .env file exists: continue.    ** GOOD
                - if .env file does not exist, create and prompt user for values    ** GOOD

        1.3. Config file creation ** TO TEST
            - on start up:
                - creates a config file with information like logger info, recordPath, etc.

            - TEST:
                - if config/config.ini exists: continue.    ** GOOD
                - if config/config.ini does not exist, it creates new.  ** GOOD

        2. set limit for max video record length. ** GOOD
            - Tests
                Test 1: ** GOOD
                1. setup low max recording time like 5 seconds in config.ini. 
                2. In startup where user enters settings, set recording length to 3s. Extensions to 2.
                Expected result:
                    Since max is 5s. The recording will extend but end at 5s instead of 6s since hits maximum

                Test 2: ** GOOD
                1. setup low max recording time like 5 seconds in config.ini. 
                2. In startup where user enters settings, set recording length to 7s.
                Expected result:
                    Hard cap at 5s per video length.

        3. setup send http POST with full video as payload. ** confirm RPI HTTP POST script and then test ** GOOD
            3.1. confirm log messages on rpi and server. ** GOOD
            3.2. check uploads/ to see if file created. ** GOOD
            3.3. Create a thread that sends after each individual recording completed ** GOOD

        4. for camera recording, draw green box on detected rectangle where motion is detected. 
            ** new motion detection Done, mine was idiotic: Was just calculating frame difference with grayscale subtraction.
                * https://medium.com/@itberrios6/introduction-to-motion-detection-part-1-e031b0bb9bb2
                    ** Reduction in image size then create mask improves disjointed objects better than original dimensions.
                        1. Reduce the width and height by the same factor
                        2. Since image is reduced, reduce the threshold area that the box needs to surpass for a considerable change.
                        3. For the accurate box drawn, be sure to scale the box top left and bot right
                            x1 * factor
                            y1 * factor
                            x2 * factor
                            y2 * factor
                    1. get frame difference with the grayscaled reduced images. Use cv subtract, this calculates the difference at each pixel
                    2. need to medianBlur first to:
                        1. Removing Noise and Speckles: Cameras, especially in low-light conditions, produce image noise (static). Frame-differencing can mistake this noise for motion. Blurring smooths out the image, removing these tiny, high-frequency, non-moving speckles, thus reducing false detections.
                        2. Reducing Sensitivity to Small Changes: By averaging pixel values with their neighbors, blurring ensures that only significant movements (larger, cohesive blobs) trigger detection, rather than minor fluctuations in light or camera sensor noise.
                        3. Improved Edge Detection: Blurring helps in defining the boundaries of moving objects, allowing for better thresholding and mask creation.
                        4. Preventing False Positives from Fine Details: High-resolution cameras might detect fine, static details as moving due to minute environmental shifts. A light, premeditated blur helps ensure that only actual movement of objects (like vehicles or people) is captured, rather than minute, insignificant, or background texture changes. 
                    3. equalizeHist doesn't work if the camera quality is not great since the noise from the camera will be equalized give the noise higher values
                    4. apdaptiveThreshold. Best for changing lighting conditions in different areas on the image.
                    5. medianBlur again
                    6. morp open to reduce noise again
                    7. moprh close to close gaps within objects and may connect disjointed masks of the same object. Although if a larger object has > 1 moving parts but are far enough away then it will obviously be disjointed in the mask and boxes.

                        steps:
                            1. Resize input frame to model-expected size (e.g., 640x640) using bilinear/bicubic interpolation.
                            2. Run inference.
                            3. Scale bounding box coordinates back up.
                                https://medium.com/@christopherhu1992/object-detection-resizing-bounding-box-after-prediction-fe44f03781a8 
                                https://datascience.stackexchange.com/questions/77719/understanding-scale-boxes-in-yolo-algorithm-of-cnn

        - remove camera name from RPI since doesnt matter, change camera key to camera token. MongoDB has camera name and only configured here.
        5. Server setup up mongoDB and camera Document
        6. Test full operation



    
    User level:
        1. one Admin account pre-made. Only account type that can create other accounts and set roles. Can add/remove camera keys.
            * Note, the RPI with connected camera has a key that needs to be configured by someone before use. Then the adds that same key into the mongoDB with a category so users can subscribe to.
        2. subscriber, gets account from admin, can change password and view categories' videos and sub to categories for email notifications.

for Dev:
    1. Firewall inbound rule: allowed rpi to send TCP for the HTTP to specific port on PC that hosts the express server **did not work, probably incorrect settings since disabling private firewall allowed the RPI to send the HTTP request successfully.
        - Express server for RPI

    I don't know. Even the most lax rules for Inbound for the RPI IP does not allow request to hit server. **currently stuck here

    HTTP request maybe being sent over IPv4: ** did not work.
        1. check PC IP and RPI IP and see if same or different.
            IP is the same. Allow IP in firewall inbound. Since my provider is dynamic IP, it will change periodically. Therefore, disable rule when not testing.

    1. Test with Windows Firewall in Logging Mode

    Windows Firewall can log blocked traffic, which might give you more insight into what’s happening. If the firewall is blocking the request but not showing up in Event Viewer, logging might provide more detailed info.

    Steps to Enable Firewall Logging:

        1. Open PowerShell as Administrator.

        2. Run the following command to enable firewall logging for dropped packets:
            New-NetFirewallRule -DisplayName "Log Dropped Packets" -Direction Inbound -Action Block -Profile Private -Enabled True -Protocol Any

        3. You’ll need to enable logging on the Windows firewall:
            - Open the Local Security Policy: Press Windows + R, type secpol.msc, and hit Enter.
            - In the left pane, expand Advanced Audit Policy Configuration > Logon/Logoff > Logon.
            - Ensure that Audit logon events is enabled. Check your Firewall log location.

        4. After enabling logging, restart the Windows Firewall service:
            Restart-Service -Name MpsSvc
        5. Test the Request again from the Raspberry Pi and check the firewall logs at:

            C:\Windows\System32\LogFiles\Firewall\pfirewall.log

            This log will show details on what traffic is being dropped or allowed. Look for any dropped packets related to port 3000 or your Express server.


    ** FOUND IT: ** If application doesn't work, check the rule again because a same duplicate rule may have been created and is enabled.
    Disable Inbound rule: Node.js JavaScript Runtime -- For Private profile. Leave the one for public profile.
        Rule settings: Blocking TCP on all ports, all IP, all interfaces, and on private profile. Once disabled, RPI can send HTTP request to server. WOOHOOOOO. MANY HOURS!

    Of course, leave the rule for TCP inbound for port 5000 for private enabled for our testing. Also include the RPI IP in the remote IPs.

    ping ipv4 ip:port

Run server
- npm run dev

On Pi
- Have ethernet connect to internet
- Have wifi card connect to Camera's wifi network. LiveAD