const { StatusCodes } = require('http-status-codes')
const path = require('path')
const { sendNotifications } = require('../notifications/sendNotifications')
const { UploadError } = require('../errors')
const { directoryExistsOrCreate } = require('../functions/fileSystem')
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
                path: filePath,
                filename: filename
            } = req.file

            // create thumbnail folder
            const thumbnailDir = path.join(config.base, 'public', config.thumbnailFolder, id)
            if ((await directoryExistsOrCreate(thumbnailDir))) {
                // file created, create one time thumbnail
                await createThumbnail(filePath, id, filename.split('.')[0]) // must await so that multer finishes uploaded the video before attempting to access the file.
            }
            // //else throw new NotFoundError('Thumbnail directory not found.')
            
            logger.info(`uploadVideoSingle: ${StatusCodes.CREATED} - Video uploaded successfully to ${filePath}`)
            // send response
            res.status(StatusCodes.CREATED).json({
                message: "Video uploaded successfully!",
            })

            // let run async
            sendNotifications(id, name, filename)
        } else {
            throw new Error('No file.')
        }
    } catch (e) {
        logger.error('uploadVideoSingle: '+ e.message)
        throw new UploadError(`uploadVideoSingle: Failed to save video for camera: ${name}`)
    }

    return
}

module.exports = { uploadVideoSingle }