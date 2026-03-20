const UserModel = require('../models/User')
const logger = require('../logging/logger')
const send = require('../functions/nodemailerHelper')

/**
 * Get all the users subscribed to the cameraId then send email with cameraName and new filename.
 * @param {String} cameraId 
 * @param {String} cameraName 
 * @param {String} filename 
 * @returns {undefined}
 */
const sendNotifications = async(cameraId, cameraName, filename) => {
    logger.info(`Sent notifications for ${filename}`)

    // get all users where subscription Array has cameraId
    const users = await UserModel.find({
        subscriptions: cameraId
    }).select('-password').exec()

    const notifiedUsers = new Array()
    for (let user of users) {
        if (user.needNotify()) {
            notifiedUsers.push(user._id)

            const body = `Camera ${cameraName} has uploaded ${filename}.` +
                (!user.settingNotifyAlways) ? '\n\nNote: Since setting [Notify Always] is off, you will not recieve additional notifications for newer uploads until next log in.' : ''
            // send email
            send(user.email, `New video from creature-camera`, body)
        }
    }

    if (!notifiedUsers.length !== 0) {
        await UserModel.updateMany({
                _id: { $in: notifiedUsers }
            },
            {
                $set: { lastNotifySent: Date.now() }
            }
        )
    }

    return
}

module.exports = { sendNotifications }