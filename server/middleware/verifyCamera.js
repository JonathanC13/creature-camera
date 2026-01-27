// const UserModel = require('../models/User')  // todo setup model for Camera list with keys
const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')
// const CameraModel = require('../models/Camera')

// compare key sent in header with all the keys in mongodb camera keys
const verifyCamera = async(req, res, next) => {
    // const { cameraName } = req.body
    // console.log(req.headers) // good
    // note, since using multer. The req.body will be undefined if middleware runs before the multer upload since multer will populate the req.file and req.body with the data.

    // request has the token in the header:
    // authentication: Bearer token // note, the token is purposely not a json web token. Just allow pair of plain text to be configured.
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer')) {
        throw new UnauthenticatedError('Not authenticated!')  // later
    }

    // compare camera name and token to DB
    // {camera_name: xyz, token: 123}
    //const cameraToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYW1lcmFfbnVtYmVyIjoiMSIsImNhbWVyYV9uYW1lIjoiRmlyc3QgY2FtZXJhIn0.Af5bzfUQGgYVvR9yl42F3ovi47RuMbuJ4iJEj68nOm8"
    const token = authHeader.split(' ')[1]
    console.log(token)
    // when DB setup
    /*
    try {
        // validate that the user decoded from the token exists in the DB
        const response = await CameraModel.findOne({cameraToken}).select('-cameraToken')

        // if more than one row, throw error malformed camera token registration!
        
        if (!response) {
            //throw new UploadError('Camera is not registered.')
        }

        // attach the user to the route
        req.camera = {cameraId: response.cameraId, cameraName: response.cameraName, usersSubbed: response.usersSubbed}
    } catch (err) {
        //throw new UnauthenticatedError('Camera document Error! ' + err.message)
    }
    */
    req.camera = {cameraId: 1, usersSubbed: [2, 3]}

    next()
}

module.exports = verifyCamera