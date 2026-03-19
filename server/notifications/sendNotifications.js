
/**
 * Get all the users subscribed to the cameraId then send email with cameraName and new filename.
 * @param {*} cameraId 
 * @param {*} cameraName 
 * @param {*} filename 
 * @returns 
 */
const sendNotifications = async(cameraId, cameraName, filename) => {
    console.log(`sent notifs for ${filename}`)
    /*
    iterate usersSubbed
        In the users Collection:
        find user that is the currentId AND (notifyAll === true OR notificationSent === false)
        if (!response) {
            // user will not be sent notification
            continue
        }
        emailSent = await send email to user
        if (emailSent)
            update document and set notificationSent = true
        else
            log(could not send notification to userId, email, filepath)
    */
    return
}

module.exports = { sendNotifications }