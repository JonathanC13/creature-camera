require('dotenv').config()
const express = require('express')
//require('express-async-errors');  // don't need with Express 5
// const multer = require("multer");
const config = require('./config')
const validateProjectDirectories = require('./functions/validateProjectDirectories')
// security
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const xss = require('./middleware/xss-clean')
const cookieParser = require('cookie-parser')

// check directories
if (validateProjectDirectories() === false) {
    console.log('Could not validate or create the required project files. App terminating...')
    process.exit(1)
}

// db
//const connectDB = require('./db/connect')

// uploads
// const upload = multer({ dest: config.uploadDir });

// routers
const uploadVideoSingleRouter = require("./routes/uploadVideoSingle")

// middleware
const verifyCameraMiddleware = require('./middleware/verifyCamera')

// app
const app = express()
const port = config.app.port
// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// middleware for cookies
app.use(cookieParser())

// extra security packages
app.use(helmet())
// app.use(cors(
//     {
//         origin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN, // Adjust this to your frontend's URL
//         credentials: true, // This allows cookies to be included in requests
//     }
// ))
app.use(xss()) // make sure this comes before any routes

app.set('trust proxy', 1 /* number of proxies between user and server */)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
})
app.use(limiter) // disable when testing.
// /extra security packages

// routes
// /api/v1/routes/:routineId/sessions/:sessionId/exercises/:exerciseId/comments/:commentId
app.get('/', (req, res) => {
    res.send('hello, world!')
})

app.use('/api/v1/uploadVideo', verifyCameraMiddleware, uploadVideoSingleRouter)

// /routes

const start = async() => {
    try {
        //await connectDB(process.env.MONGO_URI)

        app.listen(port, '0.0.0.0', async() => {
            console.log(`Listening on port ${port}...`)
        })

    } catch (err) {
        console.log(`Listen error: ${err}`)
    }
}

start()