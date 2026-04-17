const fs = require('fs')
const path = require('path')
const CameraModel = require('../models/Camera')
const { fileExists, directoryExists } = require('../functions/fileSystem')
const createThumbnail = require('../functions/createThumbnail')
const config = require('../config')
const { InternalServerError } = require('../errors')
const { StatusCodes } = require('http-status-codes')


const {
    base
} = config
const { uploadFolder } = config.folders.uploadFolder
const uploadPath = path.join(base, uploadFolder)

const getSubVideos = async(req, res, next) => {
    const { subscriptions } = req.user
    
    const cameraDocuments = await CameraModel.find({ 
        _id: { $in: subscriptions } 
    });

    const camerasArr = map((e) => ({id: e._id.toString(), cameraName: e.cameraName, videos: new Array()}))
    
    try {
        // go into the uploads folder and list the files
        for (let camera of res) {
            const folderName = camera.id
            const cameraUploads = path.join(uploadPath, folderName)
            if (await directoryExists(cameraUploads)) {
                const videoInfo = new Map()
                const files = fs.readdirSync(cameraUploads);
                files.forEach(file => {
                    const filePath = path.join(cameraUploads, file);
                    const stats = fs.statSync(filePath);

                    videoInfo.set('filename', file)
                    videoInfo.set('created', stats.birthtime)

                    // get thumbnail
                    const name = file.split('.')[0]
                    let thumbnailPublic = path.join(config.thumbnailFolder, folderName, name + '-tb.png')
                    const thumbnailFilepath = path.join(config.base, 'public', thumbnailPublic)
                    if (!await fileExists(thumbnailFilepath)) {
                        thumbnailPublic = createThumbnail(filePath, folderName, name)
                    }
                    videoInfo.set('thumbnail', thumbnailPublic)
                });

                camera.videos.push(videoInfo)
            }
        }

        res.status(StatusCodes.OK).json({response:camerasArr, count:camerasArr.length})
    } catch (e) {
        throw new InternalServerError()
    }
}

const getVideo = async(req, res, next) => { // HERE
    res.status(200).json()
}

module.exports = { getSubVideos, getVideo }