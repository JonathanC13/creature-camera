# Creature Camera
Motion detection camera project, named Creature Camera since an application can be a wildlife camera.
<br>
Video: https://youtu.be/OjeRwaH1ytA

## System components
1. Wi-Fi camera connected to a RPi's Wi-Fi network
2. RPi to manage the active session where the frames are processed to detect motion, when detected the frames are recorded into a video, and when complete upload it to the server
3. MongoDB Atlas for the database-as-a-service
4. Server to handle the video uploads and webiste API
5. Website to provide a dashboard for two roles:
   <ol>
       <li>Admin
           <ul>
               <li>Manage users</li>
               <li>Manage cameras</li>
               <li>Assign users to cameras</li>
               <li>View videos from assigned cameras</li>
           </ul>
       </li>
       <li>User
           <ul>
               <li>View videos from assigned cameras</li>
           </ul>
       </li>
   </ol>
