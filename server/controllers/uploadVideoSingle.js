const { StatusCodes } = require('http-status-codes')
const { checkFileExists } = require('../functions/fileSystem')
const { sendNotifications } = require('../notifications/sendNotifications')
const { UploadError } = require('../errors')
const createThumbnail = require('../functions/createThumbnail')
// const config = require('../config')
const logger = require('../logging/logger')
const config = require('../config')

/**
 * Check if file was uploaded, if true: call sendNotifications()
 * @param {*} req 
 * @param {*} res
 * @param {*} next
 * @returns 
 */
const uploadVideoSingle = async(req, res, next) => {
    // console.log('uploadVideoSingle========body=========')
    // console.log(req.body)
    // console.log(req.camera)

    const {
        id,
        name
    } = req.camera
    
    // if req.file populated, upload successful
    try {
        if (req.file) {
            const { 
                path: path,
                filename: filename
            } = req.file

            
            // create thumbnail folder
            const thumbnailDir = path.join(config.base, config.thumbnailFolder, id, filename.split('.')[0])
            if ((await directoryExistsOrCreate(thumbnailDir))) {
                // file created, create one time thumbnail
                createThumbnail(path, id, filename.split('.')[0])
            }
            // //else throw new NotFoundError('Thumbnail directory not found.')
            
            logger.info(`uploadVideoSingle: ${StatusCodes.CREATED} - Video uploaded successfully to ${path}`)
            // send response
            res.status(StatusCodes.CREATED).json({
                message: "Video uploaded successfully!",
            })

            // let run async
            sendNotifications(id, name, filename)
        } else {
            throw new Error()
        }
    } catch (e) {
        throw new UploadError(`uploadVideoSingle: Failed to save video for camera: ${name}`)
    }

    return
}

module.exports = { uploadVideoSingle }