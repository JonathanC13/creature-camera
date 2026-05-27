# Creature Camera Server
NodeJS, ExpressJS

# Function
<ul>
<li>Handles video upload from RPi</li>
<li>Website API</li>
</ul>

# .env variables to set
ACCESS_CONTROL_ALLOW_ORIGIN = "http://localhost:5173"
<br>
JWT_SECRET = 
<br>
JWT_LIFETIME = '2h'
<br>
JWT_REFRESH_SECRET = # If have persistent login for option 'stayed logged in'. If client cookies has the Refresh token, it will auto log in.
<br>
JWT_REFRESH_LIFETIME = '7 days'
<br>
COOKIE_EXPIRY_MS = 604800000
<br>
PORT = 5000
<br>
MONGO_URI = # URI for your MongoDB
<br>
<br>
# For sending emails
<br>
NODE_MAILER_SERVICE = ''
<br>
NODE_MAILER_USER = ''
<br>
NODE_MAILER_PASS = ''

# To run
> npm run dev
