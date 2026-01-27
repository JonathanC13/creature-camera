# crispy-camera

*server
express.js
dotenv
mongoose
express-async-errors
multer
json web token
xss-filters
http-status-codes

DB will hold:
    camera keys. Each camera that wants to send to the server has a manually added key to their .env file and the DB will hold the same key so it can validate.

todo:
    1. middleware/verifyCamera:  // todo setup model for Camera list with keys, verity key send in header with keys in mongodb
    2. controllers/uploadVideo      // video bytes transferred to server (this PC), saves the video to a directory, mongoDB saves the file path for the video.
    3. on RPI:
        1. setup camera properties in .env
            key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYW1lcmFfbnVtYmVyIjoiMSIsImNhbWVyYV9uYW1lIjoiRmlyc3QgY2FtZXJhIn0.Af5bzfUQGgYVvR9yl42F3ovi47RuMbuJ4iJEj68nOm8"
            camera_name: "First camera"
        2. set limit for max video record length.   ** to test HERE. Also, need to verify config file created and that all the normal operation works properly before upload to server
        3. setup send http POST with full video as payload. ** confirm RPI HTTP POST script and then test ** GOOD
            3.1. confirm log messages on rpi and server. **GOOD
            3.2. check uploads/ to see if file created. **GOOD
        4. integrate send video to server into main project. Thread to send after recording completed. ** To test
            - handle server response in req_uploadVideo
            - in threadFuncAnalyzeVideoStream, after recording finished create new thread for req_uploadVideo to send request to server.
            - Test.
        5. Server setup up mongoDB and camera Document
        6. Test full operation



    
    User level:
        1. one Admin account pre-made. Only account type that can create other accounts and set roles. Can add/remove camera keys.
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


    ** FOUND IT:
    Inbound rule: Node.js JavaScript Runtime -- For Private profile. Leave the one for public profile.
        Blocking TCP on all ports, all IP, all interfaces, and on private profile. Once disabled, RPI can send HTTP request to server. WOOHOOOOO. MANY HOURS!

    Of course, leave the rule for TCP inbound for port 5000 for private enabled for our testing. Also include the RPI IP in the remote IPs.

Run
- npm run dev

On Pi
- Have ethernet connect to internet
- Have wifi card connect to Camera's wifi network.