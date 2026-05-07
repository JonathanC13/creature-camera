// const fs = require('fs')
const { readdir, stat } = require('node:fs/promises')
const { createReadStream } = require('node:fs')
const path = require('path')
const CameraModel = require('../models/Camera')
const { fileExists, directoryExists } = require('../functions/fileSystem')
const createThumbnail = require('../functions/createThumbnail')
const config = require('../config')
const { InternalServerError, NotFoundError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const { getVideoDurationInSeconds } = require('get-video-duration');

const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);


const {
    base
} = config
const { uploadFolder } = config.folders
const uploadPath = path.join(base, uploadFolder)

const getSubVideos = async(req, res, next) => {
    const { subscriptions } = req.user
    
    const cameraDocuments = await CameraModel.find({ 
        _id: { $in: subscriptions } 
    });

    const camerasArr = cameraDocuments.map((e) => ({id: e._id.toString(), cameraName: e.cameraName, videos: new Array()}))
    
    try {
        // go into the uploads folder and list the files
        for (let camera of camerasArr) {
            const folderName = camera.id
            const cameraUploads = path.join(uploadPath, folderName)
            if (await directoryExists(cameraUploads)) {
                const files = await readdir(cameraUploads);
                for (let file of files) {
                    const videoInfo = {}
                    const filePath = path.join(cameraUploads, file);
                    const stats = await stat(filePath);
                    
                    videoInfo['filename'] = file
                    videoInfo['birthtime'] = stats.birthtime
                    videoInfo['size'] = stats.size
                    
                    
                    videoInfo['length_s'] = await getVideoDurationInSeconds(filePath)
                    // await ffmpeg.ffprobe(filePath, (err, metadata) => {
                    //     if (err) {
                    //         videoInfo['length_s'] = 0
                    //         return;
                    //     }
                        
                    //     videoInfo['length_s'] = metadata.format.duration
                    // });

                    // get thumbnail
                    const name = file.split('.')[0]
                    let thumbnailPublic = path.join(config.thumbnailFolder, folderName, name + '-tb.png')
                    const thumbnailFilepath = path.join(base, 'public', thumbnailPublic)
                    
                    if (!await fileExists(thumbnailFilepath)) {
                        // Since writing only if not exists. No race condition from 'check-then-act'.
                        const [dir, filename] = await createThumbnail(filePath, folderName, name)
                        thumbnailPublic = path.join(dir, filename)
                    }
                    videoInfo['thumbnail'] = thumbnailPublic
                    camera.videos.push(videoInfo)
                }
            }
        }

        res.status(StatusCodes.OK).json({response:camerasArr, count:camerasArr.length})
    } catch (e) {
        console.log(e.message)
        throw new InternalServerError()
    }
}

const getVideoFromCamera = async(req, res, next) => {
    const { id, filename } = req.query;
    
    const videoPath = path.join(uploadPath, id, filename);
    console.log(videoPath)
    try {
        const stats = await stat(videoPath);
        const fileSize = stats.size;
        const range = req.headers.range;    //  React <video> tag automatically provides: Range: bytes=0-999999.
        console.log(range)
        if (range) {
            const [start, end] = range.replace(/bytes=/, "").split("-");
            const startNum = parseInt(start, 10);   // convert to Integer
            const endNum = end ? parseInt(end, 10) : fileSize - 1;

            res.writeHead(StatusCodes.PARTIAL_CONTENT, {
                'Content-Range': `bytes ${startNum}-${endNum}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': (endNum - startNum) + 1,
                'Content-Type': `video/${filename.split('.')[1]}`,
            });

            createReadStream(videoPath, { start: startNum, end: endNum }).pipe(res);
        } else {
            res.sendFile(videoPath, { root: __dirname });
        }
    } catch (e) {
        throw new NotFoundError('Video not found.')
    }
}

module.exports = { getSubVideos, getVideoFromCamera }