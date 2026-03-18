const mongoose = require('mongoose')

const validateObjId = async(req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new BadRequestError('Requires valid camera id!')
    }

    next()
}

module.exports = validateObjId