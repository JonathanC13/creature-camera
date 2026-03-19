// const UserModel = require('../models/User')  // todo setup model for Camera list with keys
// const jwt = require('jsonwebtoken')
const { UnauthenticatedError, NotFoundError } = require('../errors')
const CameraModel = require('../models/Camera')

// compare key sent in header with all the keys in mongodb camera keys
const authCamera = async(req, res, next) => {
    // const { cameraName } = req.body
    // console.log(req.headers) // good
    // note: since using multer. The req.body will be undefined IF this middleware runs before the multer upload since multer will populate the req.file and req.body with the data. Therefore just validate header.

    // request has the token in the header:
    // authentication: Bearer token // note, the token is purposely not a json web token. Just allow pair of plain text to be configured.
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer')) {
        throw new UnauthenticatedError('Camera not authenticated!')
    }

    // compare camera name and token to DB
    // {token: 123}
    //const cameraToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYW1lcmFfbnVtYmVyIjoiMSIsImNhbWVyYV9uYW1lIjoiRmlyc3QgY2FtZXJhIn0.Af5bzfUQGgYVvR9yl42F3ovi47RuMbuJ4iJEj68nOm8"
    const cameraToken = authHeader.split(' ')[1]
    
    try {
        // validate that the cameraToken exists in the DB. Return all fields excluding cameraToken
        const response = await CameraModel.findOne({cameraToken}).select('-cameraToken')
        
        if (!response) {
            throw new NotFoundError('Camera is not registered!')
        }

        // attach the user to the route
        req.camera = response.getCameraInfo()
    } catch (err) {
        throw new UnauthenticatedError('Camera not authenticated! ' + err.message)
    }

    next()
}

module.exports = authCamera