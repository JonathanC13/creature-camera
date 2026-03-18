const CameraModel = require('../models/Camera')
const { BadRequestError, NotFoundError } = require('../errors')
const {StatusCodes} = require('http-status-codes')

/**
 * Remove the camera _id from the subsribed users.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @returns {undefined}
 */
const deleteCameraFromSubscribers = async(req, res, next) => {
    const {
        params: { id }
    } = req

    // Bulk operation to unsubscribe users from the camera that is being deleted.
    // param 1: filter get documents where subscrided has id
    // param 2: update
    await User.updateMany(
        {
            subscribed: id
        },
        { $pull : { subscribed: id } }
    );

    next()
}

module.exports = deleteCameraFromSubscribers