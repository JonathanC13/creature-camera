const { StatusCodes } = require('http-status-codes')
const { checkFileExists } = require('../functions/fileSystem')
const { sendNotifications } = require('../notifications/sendNotifications')
const { UploadError } = require('../errors')
// const config = require('../config')
const logger = require('../logging/logger')

const uploadVideoSingle = async(req, res) => {
    // console.log('uploadVideoSingle========body=========')
    // console.log(req.body)
    // console.log(req.camera)

    const {
        cameraId,
        cameraName
    } = req.camera
    
    // if req.file populated, upload successful
    if (req.file) {
        const { 
            path: path,
            filename: filename
        } = req.file
        
        logger.info(`uploadVideoSingle: ${StatusCodes.CREATED} - Video uploaded successfully to ${path}`)
        // send response
        res.status(StatusCodes.CREATED).json({
            message: "Video uploaded successfully!",
        })

        // let run async
        sendNotifications(cameraId, cameraName, filename)

    } else {
        throw new UploadError(`uploadVideoSingle: Failed to save video for camera: ${cameraName}`)
    }

    return
}

module.exports = { uploadVideoSingle }