const mongoose = require('mongoose')
const { BadRequestError } = require('../errors')

const isValidObjId = async(req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new BadRequestError('Requires valid Object id!')
    }

    next()
}

module.exports = isValidObjId