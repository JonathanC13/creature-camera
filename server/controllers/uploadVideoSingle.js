const { StatusCodes } = require('http-status-codes')
const { checkFileExists } = require('../functions/fileSystem')
const { sendNotifications } = require('../notifications/sendNotifications')
const { UploadError } = require('../errors')
const config = require('../config')

const uploadVideoSingle = async(req, res) => {
    // req.body has the text inputs
    console.log('uploadVideoSingle========body=========')
    console.log(req.body)
    console.log(req.camera)

    const {
        cameraId: cameraId = -1,
        cameraName: cameraName = '',
        usersSubbed: usersSubbed = []
    } = req.camera
    
    if (req.file) {
        const { 
            path: path,
            filename: filename
         } = req.file
        
        // multer middleware uploaded the video, check if it exists
        const fileExists = await checkFileExists(path)
        if (fileExists) {
            // send response
            res.status(StatusCodes.CREATED).json({
                message: "Video uploaded successfully!",
            })

            // let run
            sendNotifications(cameraId, cameraName, usersSubbed, filename)
        } else {
            throw new UploadError("Failed to save video. File does not exist.")
        }

        
    } else {
        throw new UploadError("Failed to save video: req.file")
    }
}

module.exports = { uploadVideoSingle }