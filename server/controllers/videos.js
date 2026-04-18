const fs = require('fs')
const path = require('path')
const CameraModel = require('../models/Camera')
const { fileExists, directoryExists } = require('../functions/fileSystem')
const createThumbnail = require('../functions/createThumbnail')
const config = require('../config')
const { InternalServerError, NotFoundError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const { STATUS_CODES } = require('http')


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
                    if (!(await fileExists(thumbnailFilepath))) {
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

const getVideoFromCamera = async(req, res, next) => {
    const { id, fileName } = req.query;

    const videoPath = path.join(config.base, config.folders.uploadFolder, id, fileName);
    try {
        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;    //  React <video> tag automatically provides: Range: bytes=0-999999.

        if (range) {
            const [start, end] = range.replace(/bytes=/, "").split("-");
            const startNum = parseInt(start, 10);   // convert to Integer
            const endNum = end ? parseInt(end, 10) : fileSize - 1;

            res.writeHead(StatusCodes.PARTIAL_CONTENT, {
                'Content-Range': `bytes ${startNum}-${endNum}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': (endNum - startNum) + 1,
                'Content-Type': `video/${fileName.split('.')[1]}`,
            });

            fs.createReadStream(videoPath, { start: startNum, end: endNum }).pipe(res);
        } else {
            res.sendFile(videoPath, { root: __dirname });
        }
    } catch (e) {
        throw new NotFoundError('Video not found.')
    }
}

module.exports = { getSubVideos, getVideoFromCamera }