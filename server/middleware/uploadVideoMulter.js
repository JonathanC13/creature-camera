const multer = require("multer");
const path = require("path");
const { videoFileFilter } = require('../functions/videoFileFilter')
const { BadRequestError, NotFoundError } = require('../errors')
const config = require('../config')
const { directoryExistsOrCreate } = require('../functions/fileSystem');

const uploadVideoMulter = async(req, res, next) => {
    const {
        base
    } = config
    const { uploadFolder } = config.folders
    const {
        id
    } = req.camera
    
    const dest = path.join(base, uploadFolder, id)
    // check if folder exists or create
    if (!(await directoryExistsOrCreate(dest))) {
        throw new NotFoundError('Upload directory not found.')
    }
    
    const storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, dest);
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        }
    });

    const upload = multer({ storage: storage, fileFilter: videoFileFilter }).single('file');    // That upload object has several methods (single, array, fields, none, etc.), and each method returns a middleware function that Express can use.

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