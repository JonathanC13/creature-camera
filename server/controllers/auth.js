const UserModel = require('../models/User')
const { BadRequestError, UnauthenticatedError, NotFoundError, ForbiddenError } = require('../errors')
const { StatusCodes } = require('http-status-codes')

const login = async(req, res, next) => {
    const {
        email,
        password
    } = req.body

    if (email === '' || password === '') {
        throw new BadRequestError('Please provide email and password.')
    }

    const userDocument = await UserModel.findOne({emailLowercase: email.toLowerCase()}).exec()

    if (!userDocument) {
        throw new UnauthenticatedError()
    }

    const passwordCorrect = await response.validatePassword(userDocument.password)

    if (!passwordCorrect) {
        throw new UnauthenticatedError()
    }

    // token for Access Token, refreshToken for refresh token
    const token = userDocument.generateJWT()
    const refreshToken = userDocument.generateRefreshJWT()  // new refresh token to extend persistent log in.

    // update user document to save the new Refresh token. In Mongoose, once you have the document it can be updated with save()
    try {
        userDocument.refreshToken = refreshToken
        const saveResponse = userDocument.save()
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({'message': 'Server error!'})
        return
    }
    
    // send refresh token in a httpOnly cookie
    res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: process.env.COOKIE_EXPIRY_MS, sameSite: 'None', secure: true}) // for prod: secure: true
    res.status(StatusCodes.OK).json({user: userDocument.getUserInfo(), token: token})
}

/**
 * If the request has a valid refresh token, generate a new access token so they have a non-expired token for future requests.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const refreshToken = async(req, res, next) => {
    const cookies = req.cookies
    if (!cookies?.jwt) {
        throw new UnauthenticatedError()
    }

    const refreshToken = cookies.jwt
    const userDocument = await UserModel.find({refreshToken: refreshToken}).exec()

    if (!userDocument) {
        throw new ForbiddenError()
    }

    // verify refresh token is valid
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, 
        function(err, decoded) {
            if (err || userDocument.getId() !== decoded.userId) {
                throw new ForbiddenError()
            }
            return decoded
        }
    );

    const accessToken = userDocument.generateJWT()
    res.status(StatusCodes.OK).json({user: userDocument.getUserInfo(), token: accessToken})
}

/**
 * Log out function.
 * If there is a jwt cookie. instruct client to clear it.
 * If there is a jwt cookie that has an associated user, clear it from the user's document.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const logout = async(req, res, next) => {
    // in the client side, also delete the access token, it will be in the memory; like in a Redux store or React Context
    const cookies = req.cookies

    if (!cookies?.jwt) {
        // console.log('no jwt')
        res.status(StatusCodes.NO_CONTENT).json()   // successful and 204 = no content
        return
    }

    // there is a cookies.jwt
    const refreshJWT = cookies.jwt
    res.clearCookie('jwt', { httpOnly: true, maxAge: process.env.COOKIE_EXPIRY_MS, sameSite: 'None', secure: true }) // for prod: secure: true // Instructs client to clear the exact cookie, need to provide the same options as when it was created. // on clear: deprecated maxAge: 24 * 60 * 60 * 1000. Don't need to include
    
    const userDocument = await UserModel.findOne({refreshToken: refreshJWT}).exec()

    if (!userDocument) {
        // console.log('no user')
        // have cookie, but no associated user.
        res.status(StatusCodes.NO_CONTENT).json()   // successful and 204 = no content
        return
    }

    // remove refresh token from user document
    userDocument.refreshToken = ''
    try {
        const saveResponse = await userDocument.save()
        // console.log(saveResponse)
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({'message': 'Server error!'})
        return
    }

    res.status(StatusCodes.NO_CONTENT).json()
}

const updateUserInfo = async(req, res, next) => {
    const {
        id
    } = req.params

    if (id !== req.user.id) {
        throw new ForbiddenError()
    }

    const restricted = new Set(['emailLowercase', 'password', 'role', 'subscriptions', 'temp_password', 'expiration_timestamp_OTP', 'refreshToken'])
    const updateInfo = new Map()
    for (let [k, v] of req.body.entries()) {
        if (!restricted.has(k)) {
            updateInfo.set(k, v)

            if (k === 'email') {
                updateInfo.set('emailLowercase', v.toLowerCase())
            }
        }
    }

    const optObj = {
        returnDocument: true,
        runValidators: true
    }

    const response = await UserModel.findByIdAndUpdate(id, updateInfo, optObj).exec()
    if (!response) {
        throw new NotFoundError('User not found.')
    }

    res.status(StatusCodes.OK).json({user: response.info()})
}

const updatePassword = async(req, res, next) => {
    const {
        id
    } = req.params

    if (id !== req.user.id) {
        throw new ForbiddenError()
    }

    const {
        currentPassword,
        newPassword
    } = req.body
    const userDocument = await UserModel.findById(id).exec()
    if (!await userDocument.validatePassword(currentPassword)) {
        throw new UnauthenticatedError('Current password incorrect.')
    }

    userDocument.replacePassword(newPassword)

    try {
        await userDocument.save()
        res.status(StatusCodes.OK).json()
    } catch(e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json()
    }
}

module.exports = { login, refreshToken, logout, updateUserInfo, updatePassword, forgotPassword, validateOTP }