const ffmpeg = require('fluent-ffmpeg');
const path = require('path')
const logger = require('../logging/logger')
const config = require('../config')

function createThumbnail(src, subFolder, filenamePrefix) {
    const filename = `${filenamePrefix}-tb.png`
    const dir = path.join(config.thumbnailFolder, subFolder)
    ffmpeg(src)
        .screenshots({
            count: 1,
            folder: path.join(config.base, 'public', dir),
            size: '640x360',
            filename: filename
        })
        .on('end', () => {
            return path.join(dir, filename)
        })
        .on('error', (err) => {
            logger.error('createThumbnail: An error occurred: ' + err.message)
        });

    return ''
}

module.exports = createThumbnail