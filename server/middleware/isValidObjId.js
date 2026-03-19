const mongoose = require('mongoose')

const isValidObjId = async(req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new BadRequestError('Requires valid camera id!')
    }

    next()
}

module.exports = isValidObjId