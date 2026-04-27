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
    nodemailer // send emails   // https://nodemailer.com/guides/using-gmail Method: App Password, config for .env
    bcryptjs
    npm install otp-generator
    readline-sync
    npm install @ffmpeg-installer/ffmpeg @ffprobe-installer/ffprobe
    fluent-ffmpeg

    * Setup in .env
        ACCESS_CONTROL_ALLOW_ORIGIN = "https://www.jonRPI.com"
        JWT_SECRET
        JWT_LIFETIME = '2h'

        JWT_REFRESH_SECRET
        JWT_REFRESH_LIFETIME = '7 days'
        COOKIE_EXPIRY_MS = 604800000
        PORT = 5000
        MONGO_URI
        NODE_MAILER_SERVICE = ''
        NODE_MAILER_USER = ''
        NODE_MAILER_PASS = ''

    * When setting up, after mongoDB database created and .env populated, need at least one admin account. For convenience and since project just personal, run: node ./setup/createAdminAcc and it will prompt you for information for the account.
        Admin account is for manageming cameras, users, and user-camera subscriptions.

Client libraries
    redux

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
        roles:
            * static
            _id
            roleName
            roleLevel
        * When updating, to ensure no duplicates either check myself or https://www.mongodb.com/docs/manual/reference/operator/update/addToSet/ 

todo:
    Server ** TO TEST with Postman
        1. middleware/authCameraMiddleware:  // setup model for Camera list with keys, verify key sent in header with keys in mongodb. ** OK
        2. controllers/uploadVideoSingle      // video bytes transferred to server (this PC), multer saves the video to a directory, mongoDB saves the file path for the video. ** OK
        3. notifications for uploaded video // ** OK
        4. user API // **OK
        5. add auth middleware before all user and camera routes // ** OK

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

        5. Server setup up mongoDB and camera Document // ** OK
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

Run client
- npm run dev

On Pi
- Have ethernet connect to internet
- Have wifi card connect to Camera's wifi network. LiveAD



TESTING:
1. createAdmin: pass
    1. uses function validateRoleCollection: pass
        - creates Roles properly if missing.
    2. Admin account successfully created

API:
1. Auth
    1. POST /auth/login
        1. Incorrect email:
            Prerequisites: N/A
            Route params: N/A
            Body: JSON { "email": "test1@.c", "password": "123456" }
            Expected results: 1. status code: 401. 2. response: JSON { message: Credentials incorrect. }. 3. No JWT cookie returned.
            Status: Pass

        2. Incorrect password:
            Prerequisites: N/A
            Route params: N/A
            Body: JSON { "email": "test1@.com", "password": "12345" }
            Expected results: 1. status code: 401. 2. response: JSON { message: Credentials incorrect. }. 3. No JWT cookie returned.
            Status: Pass

        3. Correct credentials
            Prerequisites: Have an account registered.
            Route params: N/A
            Body: JSON { "email": "test1@.com", "password": "123456" }
            Expected results: 1. status code: 200. 2. response: JSON { user: user's info, token: access token }. 3. User info and generated access token returned, generated JWT cookie stored on client.
            Status: Pass

    2. POST /auth/logout
        1. While logged in (has JWT cookie), logout will clear JWT
            Prerequisites: Logged in and has jwt cookie.
            Route params: N/A
            Body: N/A
            Expected results: 1. status code: 204. 2. response: JSON { }. 3. On client, JWT cookie cleared. Check by running /auth/refreshToken, since no JWT it will not return an access token
            Status: Pass

        2. While not logged in (no JWT cookie)
            Prerequisites: N/A
            Route params: N/A
            Body: N/A
            Expected results: 1. status code: 204. 2. response: JSON { }. 3. No JWT to clear.
            Status: Pass

    3. GET /auth/refreshToken
        1. Not logged in (no JWT)
            Prerequisites: N/A
            Route params: N/A
            Body: N/A
            Expected results: 1. status code: 401. 2. response: JSON { }. 3. No user to refresh access token.
            Status: Pass

        2. Valid login and then request new access Token
            Prerequisites: Logged in and has jwt cookie.
            Route params: N/A
            Body: N/A
            Expected results: 1. status code: 200. 2. response: JSON { user: user's info, token: access token}. 3. Returns new access token.
            Status: Pass

    4. PATCH /auth/updateUserInfo/:id
        1. update own user info. Ignores attempt at updating restricted fields: ['emailLowercase', 'password', 'role_id', 'roleLevel', 'subscriptions', 'lastNotifySent', 'lastLoggedIn', 'temp_password', 'expiration_timestamp_OTP', 'OTP_retries', 'refreshToken']
            Prerequisites: Logged in and has valid access token.
            Route params: id
            Body: 
                {
                    "name": "Bob",
                    "email": "bobert@mail.com",
                    "emailLowercase":"shouldNotChange@hotmail.com",
                    "password": "shouldNotChange",
                    "persistentLogin": true,
                    "role_id": "69d02172bae91a83dfd23dzz",
                    "roleLevel": 3,
                    "settingNotifyAlways": true,
                    "subscriptions": ["69d02172bae91a83dfd23dba","69d02172bae91a83dfd23dbb"],
                    "lastNotifySent": "2026-04-06T20:35:00.254+00:00",
                    "lastLoggedIn": "2026-04-06T20:41:00.254+00:00",
                    "temp_password": true,
                    "expiration_timestamp_OTP": "2026-04-06T20:56:00.254+00:00",
                    "OTP_retries": 1,
                    "refreshToken": 123
                }
            Expected results: 1. status code: 200. 2. response: JSON { user: update user info }. 3. Update non-restricted fields
            Status: Pass

    5. PATCH /auth/updatePassword/:id
        1. update account password, valid current password
            Prerequisites: Logged in and has valid access token.
            Route params: id
            Body: 
                {
                    "currentPassword": "123456",
                    "newPassword": "654321"
                }
            Expected results: 1. status code: 200. 2. response: JSON {  }. 3. password updated
            Status: Pass

        2. invalid current password
            Prerequisites: Logged in and has valid access token.
            Route params: id
            Body: 
                {
                    "currentPassword": "123450",
                    "newPassword": "654321"
                }
            Expected results: 1. status code: 200. 2. response: JSON {  }. 3. password not updated
            Status: Pass

    6. Test forgot password 
        1. Normal steps:
            1. POST /auth/forgotPassword with valid email
                Prerequisites: Has valid account
                Route params: N/A
                Body: 
                    { email: 'test@hotmail.com' }
                Expected results: 1. status code: 200. 2. response: JSON { user: {id, email} }. 3. JWT cookie cleared if present, email receives one time password.
                Status: Pass

            2. POST /validateOTP/:id
                1. incorrect temp password
                    Prerequisites: valid :id
                    Route params: id
                    Body: 
                        { email: 'test@hotmail.com', password: "000001" }
                    Expected results: 1. status code: 401. 2. response: JSON { message: Incorrect credentials. }. 3. not authenicated to be able proceed to update password.
                    Status: Pass

                2. Correct temp password
                    Prerequisites: valid :id
                    Route params: id
                    Body: 
                        { email: 'test@hotmail.com', password: "213432" }
                    Expected results: 1. status code: 200. 2. response: JSON { user: {id: userDocument.getId(), temp_password: userDocument.temp_password}, token: oneTimeToken}. 3. On success the client displays a field for new password. It will POST /updatePassword/:id authenticated with token, payload { currentPassword: temp, newPassword: pass}. After update, since there is no jwt cookie redirects to login.
                    Status: Pass

            3. update account password, with the valid temp password
                Prerequisites: Since has valid access token from validateOTP.
                Route params: id
                Body: 
                    {
                        "currentPassword": "213432",
                        "newPassword": "024680"
                    }
                Expected results: 1. status code: 200. 2. response: JSON {  }. 3. password updated and since temp_password used the following is set; userDocument.temp_password = false, userDocument.OTP_retries = 0, userDocument.expiration_timestamp_OTP = null
                Status: Pass

        2. Allow temp password to expire
            1. Get temp password
                Prerequisites: Has valid account
                Route params: N/A
                Body: 
                    { email: 'test@hotmail.com' }
                Expected results: 1. status code: 200. 2. response: JSON { user: {id, email} }. 3. JWT cookie cleared if present, email receives one time password.
                Status: Pass

            2. Wait until current time > expiration_timestamp_OTP then POST /validateOTP/:id with correct credentials.
                Prerequisites: valid :id
                Route params: id
                Body: 
                    { email: 'test@hotmail.com', password: "213432" }
                Expected results: 1. status code: 401. 2. response: JSON { message: OTP expired }. 3. One time password expired, must start process again at /forgotPassword for new temp password and new expiration time.
                Status: Pass


        3. Email not exist: POST /auth/forgotPassword
            Prerequisites: N/A
            Route params: N/A
            Body: 
                { email: 'test@test.c' }
            Expected results: 1. status code: 200. 2. response: JSON {  }. 3. Returns OK to prevent indication email exists or not.
            Status: Pass

        4. OTP retries max: POST /auth/forgotPassword 4 times.
            Prerequisites: Has valid account
            Route params: N/A
            Body: 
                { email: test@hotmail.com }
            Expected results: 1. status code: 403. 2. response: JSON { message: Max retries sent, contact admin. }. 3. On 4th request, it exceeds 3 max retries. Note: to reset retries to 0, admin must request /user/adminResetPassword/:id, given the temp password to user, then when user successfully uses the temp password and updates to new password it will reset.
            Status: Pass

2. user
    1. POST /user/register
        1. Not logged in
            Prerequisites: N/A
            Route params: N/A
            Body: 
                {  }
            Expected results: 1. status code: 401. 2. response: JSON {  }. 3. Not authenticated.
            Status: Pass

        2. Valid admin account to register a user
            Prerequisites: Logged in as Admin
            Route params: N/A
            Body: 
                {
                    "name": "bobo",
                    "email": "bob@mail.com",
                    "password": "123",
                    "role_id": "69d0213294650c3fb85f1e59",
                    "roleLevel": "2"
                }
            Expected results: 1. status code: 201. 2. response: JSON { response: created user, tempPlain: tempPassword }. 3. User is created and temp password emailed to submitted email.
            Status: TODO

        3. Valid admin account try to register a user with already existing email
            Prerequisites: Logged in as Admin
            Route params: N/A
            Body: 
                {
                    "name": "bobo",
                    "email": "bob@mail.com",
                    "password": "123",
                    "role_id": "69d0213294650c3fb85f1e59",
                    "roleLevel": "2"
                }
            Expected results: 1. status code: 409. 2. response: JSON { message: Duplicate value for Email! Please use a different one. }. 3. User not created due to duplicate.
            Status: Pass

        4. Logged in as normal user
            Prerequisites: Logged in as normal user
            Route params: N/A
            Body: 
                {
                    "name": "bobo2",
                    "email": "bob2@mail.com",
                    "password": "123",
                    "role_id": "69d0213294650c3fb85f1e59",
                    "roleLevel": "2"
                }
            Expected results: 1. status code: 403. 2. response: JSON { message: User does not have the appropriate role level. }. 3. No access due to role level.
            Status: Pass

    2. GET /user/
        1. Not logged in
            Prerequisites: N/A
            Route params: N/A
            Body: 
                {  }
            Expected results: 1. status code: 401. 2. response: JSON {  }. 3. Not authenticated.
            Status: Pass

        2. Valid admin account
            Prerequisites: Logged in as Admin
            Route params: N/A
            Body: 
                {  }
            Expected results: 1. status code: 200. 2. response: JSON { response: Array of users, count: count }. 3. All users
            Status: Pass

        3. Logged in as normal user
            Prerequisites: Logged in as normal user
            Route params: N/A
            Body: 
                {  }
            Expected results: 1. status code: 403. 2. response: JSON { message: User does not have the appropriate role level. }. 3. No access due to role level.
            Status: Pass

    3. GET /user/:id
        1. Not logged in
            Prerequisites: N/A
            Route params: valid id
            Body: 
                {  }
            Expected results: 1. status code: 401. 2. response: JSON {  }. 3. Not authenticated.
            Status: Pass

        2. Valid admin account with invalid user id
            Prerequisites: Logged in as Admin
            Route params: invalid id
            Body: 
                {  }
            Expected results: 1. status code: 404. 2. response: JSON { messsage: User with id: ${id} does not exist }. 3. Not found
            Status: Pass

        3. Valid admin account with valid user id
            Prerequisites: Logged in as Admin
            Route params: valid id
            Body: 
                {  }
            Expected results: 1. status code: 200. 2. response: JSON { response: user info }. 3. receives user info
            Status: Pass

    4. PATCH /user/:id
        1. Not logged in
            Prerequisites: N/A
            Route params: valid id
            Body: 
                {
                    "name": "boboChange",
                    "email": "bobChange@mail.com",
                    "password": "shouldNotChange",
                    "persistentLogin": "true",
                    "role": "69d02172bae91a83dfd23dba",
                    "roleLevel": 1,
                    "settingNotifyAlways": "false",
                    "subscriptions": ["69d02172bae91a83dfd23dba", "69d02172bae91a83dfd23dba"]
                }
            Expected results: 1. status code: 401. 2. response: JSON {  }. 3. Not authenticated.
            Status: Pass

        2. Valid admin account with invalid user id
            Prerequisites: Logged in as Admin
            Route params: invalid id
            Body: 
                {
                    "name": "boboChange",
                    "email": "bobChange@mail.com",
                    "password": "shouldNotChange",
                    "persistentLogin": "true",
                    "role": "69d02172bae91a83dfd23dba",
                    "roleLevel": 1,
                    "settingNotifyAlways": "false",
                    "subscriptions": ["69d02172bae91a83dfd23dba", "69d02172bae91a83dfd23dba"]
                }
            Expected results: 1. status code: 404. 2. response: JSON {  }. 3. Not found
            Status: Pass

        3. Valid admin account with valid user id
            Prerequisites: Logged in as Admin
            Route params: valid id
            Body: 
                {
                    "name": "boboChange",
                    "email": "bobChange@mail.com",
                    "password": "shouldNotChange",
                    "persistentLogin": "true",
                    "role": "69d02172bae91a83dfd23dba",
                    "roleLevel": 1,
                    "settingNotifyAlways": "false",
                    "subscriptions": ["69d02172bae91a83dfd23dba", "69d02172bae91a83dfd23dba"]
                }
            Expected results: 1. status code: 200. 2. response: JSON { response: updated user info }. 3. updates the user info
            Status: Pass
        
        4. Valid admin account with valid admin user id
            Prerequisites: Logged in as Admin
            Route params: valid admin id
            Body: 
                {
                    "name": "bobo",
                    "email": "bob@mail.com",
                    "password": "shouldNotChange",
                    "persistentLogin": "true",
                    "role": "need id",
                    "settingNotifyAlways": "false",
                    "subscriptions": ["need id", "need id"]
                }
            Expected results: 1. status code: 403. 2. response: JSON { message: Cannot modify another admin. }. 3. cannot update another admin
            Status: Pass

    5. DELETE /user/:id 
        1. Valid admin account with invalid user id
            Prerequisites: Logged in as Admin
            Route params: invalid id
            Body: 
                {  }
            Expected results: 1. status code: 200. 2. response: JSON {  }. 3. Nothing to delete.
            Status: Pass

        2. Valid admin account with valid user id
            Prerequisites: Logged in as Admin
            Route params: valid id
            Body: 
                {  }
            Expected results: 1. status code: 200. 2. response: JSON {  }. 3. Deletes the user regardless of role level.
            Status: Pass

    6. POST /adminResetPassword/:id
        1. Valid admin account with invalid user id
            Prerequisites: Logged in as Admin
            Route params: invalid id
            Body: 
                {  }
            Expected results: 1. status code: 404. 2. response: JSON { message: User does not exist. }. 3. User not found.
            Status: Pass

        2. Valid admin account with valid user id
            Prerequisites: Logged in as Admin
            Route params: valid id
            Body: 
                {  }
            Expected results: 1. status code: 200. 2. response: JSON { password: plain text }. 3. User emailed OTP and temp_password = true so that client will redirect user to set new password. Log in with temp password.
            Status: TODO

3. camera
    1. POST /camera/
        1. Logged in as Admin, create a camera
            Prerequisites: Logged in as an Admin. Optional to have a token that is on the RPI for the camera
            Route params: N/A
            Body: 
                {
                    "cameraName": "camera 1",
                    "cameraToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYW1lcmFfbnVtYmVyIjoiMSIsImNhbWVyYV9uYW1lIjoiRmlyc3QgY2FtZXJhIn0.Af5bzfUQGgYVvR9yl42F3ovi47RuMbuJ4iJEj68nOm8"
                }
            Expected results: 1. status code: 200. 2. response: JSON { response: camera information }. 3. camera document created.
            Status: Pass

    2. GET /camera/
        1. Logged in as Admin, get all the cameras
            Prerequisites: Logged in as an Admin.
            Route params: N/A
            Body: 
                {  }
            Expected results: 1. status code: 200. 2. response: JSON { response: Array of camera documents, count: count of cameras in Array }. 3. Return all cameras in Array
        Status: Pass

    3. GET /camera/:id
        1. Logged in as Admin, get specific camera
            Prerequisites: Logged in as an Admin.
            Route params: valid camera id
            Body: 
                {  }
            Expected results: 1. status code: 200. 2. response: JSON { response: camera document }. 3. Return desired camera document
        Status: Pass

        2. Logged in as Admin, invalid camera id
            Prerequisites: Logged in as an Admin.
            Route params: invalid camera id
            Body: 
                {  }
            Expected results: 1. status code: 404. 2. response: JSON { message: Camera with id: ${cameraId} does not exist }. 3. not found.
        Status: Pass

    4. PATCH /camera/:id
        1. Logged in as Admin, update specific camera
            Prerequisites: Logged in as an Admin.
            Route params: valid camera id
            Body: 
                {
                    "cameraName": "camera 1 change",
                    "cameraToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYW1lcmFfbnVtYmVyIjoiMSIsImNhbWVyYV9uYW1lIjoiRmlyc3QgY2FtZXJhIn0.Af5bzfUQGgYVvR9yl42F3ovi47RuMbuJ4iJEj68nOm8"
                }
            Expected results: 1. status code: 200. 2. response: JSON { response: updated camera document }. 3. Return upated camera document
        Status: Pass

        2. Logged in as Admin, invalid camera id
            Prerequisites: Logged in as an Admin.
            Route params: invalid camera id
            Body: 
                {
                    "cameraName": "camera 1 change",
                    "cameraToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYW1lcmFfbnVtYmVyIjoiMSIsImNhbWVyYV9uYW1lIjoiRmlyc3QgY2FtZXJhIn0.Af5bzfUQGgYVvR9yl42F3ovi47RuMbuJ4iJEj68nOm8"
                }
            Expected results: 1. status code: 404. 2. response: JSON { message: Camera with id: ${cameraId} does not exist }. 3. not found.
        Status: Pass

    5. DELETE /camera/:id
        1. Logged in as Admin, update specific camera
            Prerequisites: Logged in as an Admin.
            Route params: valid camera id
            Body: 
                {  }
            Expected results: 1. status code: 200. 2. response: JSON {  }. 3. Delete desired camera.
        Status: Pass

        2. Logged in as Admin, invalid camera id
            Prerequisites: Logged in as an Admin.
            Route params: invalid camera id
            Body: 
                {  }
            Expected results: 1. status code: 200. 2. response: JSON {  }. 3. Doesn't care not found, since desired result is deletion.
        Status: Pass

4. Upload video tests.
    1. Modify and run node ./test-video-upload-request/request.js
        Prerequisites: 
            1. Created a camera in collection cameras. Have the cameraToken
            2. Have video in ./test-video-upload-request/videos

        Expected results: 
            1. video file uploaded to: ./uploads/cameraId
            2. thumbnail created in ./public/cameraId
            3. notification sent to subscribed users with:
                1. settingNotifyAlways = true
                2. lastNotifySent = null
                2. lastNotifySent < lastLoggedIn
        Status: Pass

5. video
    1. GET /video
        Prerequisites: logged in
        Route params: N/A
        Body: 
            {  }
        Expected results: 1. status code: 200. 2. response: JSON { response: [{filename, created, thumbnail: url to public folder}, ...], count: number of cameras }. 3. 
        Status: Pass

    2. GET /video/src TODO
        Test from client request.
        Query parameters:
            ?
            id=
            filename=
        Prerequisites: logged in
        Route params: N/A
        Body: 
            {  }
        Expected results: 1. status code: 206. 2. response: readStream. 3. For <video><source></source></video>
        Status: 

Prerequisites: 
Route params: 
Body: 
    {  }
Expected results: 1. status code: . 2. response: JSON {  }. 3. 
Status: 



Client TODO:
1. auth reducer and apiSlice: should be OK
    - auth reducer saves the logged in user info and token so apiSlice doesn't need a getMe endpoint to keeping retrieving current profile.
    - Just remember to dispatch to reducer after api queries to save info.

2. User. Should only need ApiSlice and tag: User to invalidate when mutation sent. Should be OK

3. Camera. Should only need ApiSlice and tag: Camera to invalidate when mutation sent. Should be OK

4. BACK TO SERVER, 
    1. On upload of video, create thumbnail in /public/cameraId. Client gets thumbnail URL to public. app.js allow access with: app.use(express.static('public'));
        OK

    2. need API to get all videos from subscribed cameras. OK
    /video
        - GET /
            body: user's camera subscribed Array

            For every subscribed cameraid
                go to uploads/cameraid
                    create thumbnail if not exist in /public/cameraId
                    populate videos Array            

            return: [
                {id, cameraName, video: [{filename, created, thumbnail: url to public folder}, ...]}
            ]

            Test result: Pass

        - GET /src
            query: id, fileName
            directory of requested file at: /base/uploads/id/filename

            return video file stream

            *To test with React <video>

            const [error, setError] = useState(false);
            const [loading, setLoading] = useState(true);

            const source = `http://localhost:3000/video?id=${cameraId}&filename=${filename}

            return (
                <div>
                    {error && <p>Video not available</p>}
                    {loading && <p>Loading video...</p>}

                    <video//localhost:3000/video
                        controls
                        onError={() => setError(true)}
                        onLoadedData={() => setLoading(false)}
                    >
                        <!-- Highly recommended to include type -->
                        <source src=source type="video/avi">
                        <source src=source type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            )

5. React client

X. Videos apiSlice auto refetch all every x minutes since only GETS, no mutations will trigger a tag invalidation. TODO

