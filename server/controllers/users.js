const UserModel = require('../models/User')
const generateOTP = require('../functions/generateOTP')
const {NotFoundError, BadRequestError, InternalServerError, ForbiddenError} = require('../errors')   // error is a folder and will access error/index.js
const {StatusCodes} = require('http-status-codes')
const config = require('../config')
const sendMail = require('../functions/nodemailerHelper')
const logger = require('../logging/logger')

// since management registers a user, they create a password and sends it plainly to the user. UserModel has "temp_password", if true goes to update password page.
// It just validated the collection has a document with the email and temp_pass therefore not authenticated so cannot go to any pages. 
// Since temp_password = true it goes to the reset password page, it is waiting for new password to pass into /updatePassword/:id. After successful change, log in.

const getAllUsers = async(req, res, next) => {
    let response = await UserModel.find({}).select('-password').exec()
    response = response.map((e) => e.getUserInfo())
    res.status(StatusCodes.OK).json({response, count: response.length})
}

const getUser = async(req, res, next) => {

    const {
        id
    } = req.params

    const response = await UserModel.findById(id).select('-password').exec()

    if (!response) {
        throw new NotFoundError(`User with id: ${id} does not exist`)
    }

    res.status(StatusCodes.OK).json({response: response.getUserInfo()})
}

const registerUser = async(req, res, next) => {
    const { name, email } = req.body

    if (!name || !email) {
        throw new BadRequestError('Please provide the required fields!')
    }

    const tempPassword = generateOTP();
    req.body["password"] = tempPassword
    req.body["emailLowercase"] = email.toLowerCase()
    req.body["createdBy"] = req.user.id   // creator is the admin authorized
    req.body["temp_password"] = true   // client will redirect user to update password

    try {
        const response = await UserModel.create({...req.body})
    
        res.status(StatusCodes.CREATED).json({response: response.getUserInfo()})

        const body = `This is your temporary password:\n${tempPassword}\n.`
        sendMail(email, `${config.projectName}, registered`, body)    // send async
    } catch (e) {
        logger.error('registerUser: ' + e.message)
        throw new InternalServerError('register user failed.')
    }
}

/**
 * If admin, only can delete users and self, not other admins
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const deleteUser = async(req, res, next) => {
    const {
        id
    } = req.params

    const {
        id: adminId
    } = req.user.id

    const userDocument = await UserModel.findById(id).exec()
    if (userDocument.roleLevel === 1 && adminId !== userDocument.getId()) {
        // if admin account and not self, cannot delete.
        throw new ForbiddenError("Cannot delete another admin.")
    }

    await UserModel.findByIdAndDelete(id).exec()

    res.status(StatusCodes.OK).send()
}

const updateUser = async(req, res, next) => {
    const {
        id
    } = req.params

    const {
        id: adminId
    } = req.user.id

    const {
        subscriptions
    } = req.body

    if (subscriptions) {
        if (subscriptions instanceof Array === false) {
            throw new BadRequestError('Subscriptions must be an Array.')
        }
        req.body.subscriptions = Array.from(new Set(subscriptions)) // remove duplicates
    }

    const userDocument = await UserModel.findById(id).exec()
    if (!userDocument) {
        throw new NotFoundError()
    }
    if (userDocument.roleLevel === 1 && adminId !== userDocument.getId()) {
        // if admin account and not self, cannot modify.
        throw new ForbiddenError("Cannot modify another admin.")
    }

    const restricted = new Set(['emailLowercase', 'password', 'lastNotifySent', 'lastLoggedIn', 'temp_password', 'expiration_timestamp_OTP', 'OTP_retries', 'refreshToken'])
    
    for (let [k, v] of Object.entries(req.body)) {
        if (!restricted.has(k)) {
            if (k === 'email') {
                userDocument.email = v
                userDocument.emailLowercase = v.toLowerCase()
            } else {
                userDocument.set(k, v)
            }
        }
    }
    
    try {
        const response = await userDocument.save()
        res.status(StatusCodes.OK).json({response: response.getUserInfo()})
    } catch (e) {
        logger.error('updateUser: ' + e.message)
        throw new InternalServerError('update user failed.')
    }
}

const adminResetPassword = async(req, res, next) => {
    const {
        id
    } = req.params

    const userDocument = await UserModel.findById(id).exec()
    if (!userDocument) {
        throw new NotFoundError('User does not exist.')
    }
    
    const tempPassword = generateOTP()
    userDocument.replacePassword(tempPassword)
    // set field that causes client to force user to update password on first log in. Since activated by admin, no time limit.
    userDocument.temp_password = true
    const email = userDocument.email

    try {
        await userDocument.save()
        res.status(StatusCodes.OK).json()

        const body = `This is your temporary password:\n${tempPassword}\n.`
        sendMail(email, `${config.projectName}, admin reset password`, body)    // send async
    } catch(e) {
        logger.error('adminResetPassword: ' + e.message)
        throw new InternalServerError('Admin reset password failed.')
    }

    return
}

module.exports = { getAllUsers, getUser, registerUser, deleteUser, updateUser, adminResetPassword }