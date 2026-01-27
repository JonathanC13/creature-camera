const multer = require("multer");
const { videoFileFilter } = require('../functions/videoFileFilter')
const { BadRequestError } = require('../errors')
const config = require('../config')

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, config.uploadsDir);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

const upload = multer({ storage: storage, fileFilter: videoFileFilter }).single('file');    // That upload object has several methods (single, array, fields, none, etc.), and each method returns a middleware function that Express can use.

const uploadVideoMulter = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred (e.g., file too large)
            throw new BadRequestError(err.message)
        } else if (err) {
            // An unknown error occurred (e.g., invalid file type)
            throw new BadRequestError(err.message)
        }
        // Everything went fine
        next()
    });
}

module.exports = uploadVideoMulter