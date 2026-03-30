const UserModel = require('../models/User')
const {NotFoundError, BadRequestError, InternalServerError} = require('../errors')   // error is a folder and will access error/index.js
const {StatusCodes} = require('http-status-codes')

// since management registers a user, they create a password and sends it plainly to the user. UserModel has "temp_password", if true goes to update password page.
// It just validated the collection has a document with the email and temp_pass therefore not authenticated so cannot go to any pages. 
// Since temp_password = true it goes to the reset password page, it is waiting for new password to pass into /updatePassword/:id. After successful change, log in.

const getAllUsers = async(req, res, next) => {
    const response = await UserModel.find({})

    res.status(StatusCodes.OK).json({response, count: response.length})
}

const getUser = async(req, res, next) => {

    const {
        id
    } = req.params

    const response = await UserModel.findById(id)

    if (!response) {
        throw new NotFoundError(`User with id: ${id} does not exist`)
    }

    res.status(StatusCodes.OK).json({response})
}

const registerUser = async(req, res, next) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        throw new BadRequestError('Please provide the required fields!')
    }

    req.body[emailLowercase] = email.toLowerCase()

    const response = await UserModel.create({...req.body}).exec()
    
    res.status(StatusCodes.CREATED).json({response})
}

const deleteUser = async(req, res, next) => {
    const {
        id
    } = req.params

    await UserModel.findByIdAndDelete(id)

    res.status(StatusCodes.OK).send()
}

const updateUser = async(req, res, next) => {
    const {
        id
    } = req.params

    const {
        subscriptions
    } = req.body

    if (subscriptions instanceof Array === false) {
        throw new BadRequestError('Subscriptions must be an Array.')
    }

    req.body.subscriptions = Array.from(new Set(subscriptions))

    const restricted = new Set(['emailLowercase', 'password', 'temp_password', 'expiration_timestamp_OTP', 'refreshToken'])
    const updateInfo = new Object()
    for (let [k, v] of Object.entries(req.body)) {
        if (!restricted.has(k)) {
            if (k === 'email') {
                updateInfo['emailLowercase'] = v.toLowerCase()
            } else {
                updateInfo[k] = v
            }
        }
    }

    const optObj = {
        returnDocument: 'after',
        runValidators: true
    }

    const response = await UserModel.findByIdAndUpdate(id, updateInfo, optObj).exec()
    if (!response) {
        throw new NotFoundError('User not found.')
    }

    res.status(StatusCodes.OK).json({user: response.info()})
}

const adminSetPassword = async(req, res, next) => {
    const {
        id
    } = req.params

    const {
        password
    } = req.body
    
    if (!password) {
        throw new BadRequestError('Missing password.')
    }

    const userDocument = await UserModel.findById(id).exec()
    if (!userDocument) {
        throw new NotFoundError('User does not exist.')
    }
    
    userDocument.replacePassword(password)
    // set field that causes client to force user to update password on first log in.
    userDocument.temp_password = true

    try {
        await userDocument.save()
        res.status(StatusCodes.OK).json()
    } catch(e) {
        throw new InternalServerError('adminSetPassword failed.')
    }

    return
}

module.exports = { getAllUsers, getUser, registerUser, deleteUser, updateUser, adminSetPassword }