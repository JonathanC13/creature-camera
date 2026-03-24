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
const logger = require('./logging/logger')

// check directories
if (await validateProjectDirectories() === false) {
    logger.error('Could not validate or create the required project files. App terminating...')
    console.log('Could not validate or create the required project files. App terminating...')
    process.exit(1)
}

// db
const connectDB = require('./db/connect')

// routers
const authRouter = require('./routes/auth')
const uploadVideoSingleRouter = require("./routes/uploadVideoSingle")
const cameraRouter = require('./routes/cameras')
const userRouter = require('./routes/users')

// middleware
const authorizationMiddleware = require('./middleware/authorization')
const authCameraMiddleware = require('./middleware/authCamera')
const errorHandlerMiddleware = require('./middleware/errorHandler');

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

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/uploadVideo', authCameraMiddleware, uploadVideoSingleRouter)
app.use('/api/v1/camera', authorizationMiddleware, cameraRouter)
app.use('/api/v1/user/', authorizationMiddleware, userRouter)
// /routes

app.use(errorHandlerMiddleware) // catch errors

const start = async() => {
    try {
        await connectDB(config.app.mongoURI)

        app.listen(port, '0.0.0.0', async() => {
            logger.info(`Listening on port ${port}...`)
        })

    } catch (err) {
        logger.error(`Listen error: ${err}`)
    }
}

start()