const UserModel = require('../models/User')
const jwt = require('jsonwebtoken')
const { BadRequestError, UnauthenticatedError, NotFoundError, ForbiddenError, InternalServerError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const config = require('../config')
const logger = require('../logging/logger')
const sendMail = require('../functions/nodemailerHelper')

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
        throw new UnauthenticatedError('Credentials incorrect.')
    }
    
    const passwordCorrect = await userDocument.validatePassword(password)
    
    if (!passwordCorrect) {
        throw new UnauthenticatedError('Credentials incorrect.')
    }

    const token = userDocument.generateJWT()
    // check if user logging in with OTP password
    // if not expired, gives the login a token for updatePassword. Since no refreshJWt, after update it redirects back to login page.
    if (userDocument.expiration_timestamp_OTP !== null) {
        if (new Date() >= userDocument.expiration_timestamp_OTP) {
            throw new UnauthenticatedError('OTP expired, use forgot password for new OTP.')
        }

        res.status(StatusCodes.OK).json({user: {id: userDocument._id, temp_password: userDocument.temp_password}, token: token})
    }
    // else if temp_password = true and expirateion = null means first time log in, client goes to update password and since refreshToken in cookies it continues to dashboard.

    // token for Access Token, refreshToken for refresh token
    // const token = userDocument.generateJWT()
    const refreshToken = userDocument.generateRefreshJWT()  // new refresh token to extend persistent log in.

    userDocument.OTP_retries = 0
    userDocument.expiration_timestamp_OTP = null
    userDocument.lastLoggedIn = Date.now()

    // update user document to save the new Refresh token. In Mongoose, once you have the document it can be updated with save()
    try {
        userDocument.refreshToken = refreshToken
        const saveResponse = await userDocument.save()
            
        // send refresh token in a httpOnly cookie
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: process.env.COOKIE_EXPIRY_MS, sameSite: 'None', secure: true}) // for prod: secure: true
        res.status(StatusCodes.OK).json({user: userDocument.getUserInfo(), token: token})
    } catch (error) {
        logger.error('login: ' + error.message)
        throw new InternalServerError('Login failed.')
    }
}

const getSelf = async(req, res, next) => {
    const {
        id
    } = req.params

    const response = await UserModel.findById(id).select('-password').exec()

    if (!response) {
        throw new NotFoundError(`User with id: ${id} does not exist`)
    }

    res.status(StatusCodes.OK).json({user: response.getUserInfo()})
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
    const userDocument = await UserModel.findOne({refreshToken: refreshToken}).exec()

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
        res.status(StatusCodes.NO_CONTENT).json()
    } catch (error) {
        logger.error('logout: ' + error.message)
        throw new InternalServerError('Logout failed.')
    }
}

const updateUserInfo = async(req, res, next) => {
    const {
        id
    } = req.params
    
    if (id !== req.user.id) {
        throw new ForbiddenError()
    }

    const restricted = new Set(['emailLowercase', 'password', 'role_id', 'roleLevel', 'roleName', 'subscriptions', 'lastNotifySent', 'lastLoggedIn', 'temp_password', 'expiration_timestamp_OTP', 'OTP_retries', 'refreshToken'])
    const updateInfo = new Object()
    for (let [k, v] of Object.entries(req.body)) {
        if (!restricted.has(k)) {
            updateInfo[k] = v

            if (k === 'email') {
                updateInfo['emailLowercase'] = v.toLowerCase()
            }
        }
    }

    const optObj = {
        returnDocument: 'after',
        runValidators: true
    }

    try {
        const response = await UserModel.findByIdAndUpdate(id, updateInfo, optObj).exec()
        if (!response) {
            throw new NotFoundError('User not found.')
        }
        
        res.status(StatusCodes.OK).json({user: response.getUserInfo()})
    } catch(e) {
        logger.error('updateUserInfo: ' + e.message)
        throw new InternalServerError('Update user failed.')
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
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
    if (userDocument.temp_password) {
        // once succesful change password, reset temp password info
        // two paths here: 1. first log in after created by admin, 2. updating password from OTP validated
        userDocument.temp_password = false
        userDocument.OTP_retries = 0
        userDocument.expiration_timestamp_OTP = null
    }

    try {
        await userDocument.save()
        res.status(StatusCodes.OK).json({temp_password: userDocument.temp_password})
    } catch(e) {
        logger.error('updatePassword: ' + e.message)
        throw new InternalServerError('Update password failed.')
    }
}

/**
 * One time password method.
 * 1. Validate email exists
 * 2. set one time password and expiration
 * 3. email OTP
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const forgotPassword = async(req, res, next) => {
    const {
        email
    } = req.body

    if (!email) {
        throw new BadRequestError('Must provide email.')
    }

    const userDocument = await UserModel.findOne({emailLowercase: email.toLowerCase()}).exec()
    if (!userDocument) {
        // to prevent brute force guessing, do not indicate existence.
        res.status(StatusCodes.OK).json()
        return
    }

    const cookies = req.cookies
    const refreshJWT = cookies.jwt
    if (refreshJWT) {
        res.clearCookie('jwt', { httpOnly: true, maxAge: process.env.COOKIE_EXPIRY_MS, sameSite: 'None', secure: true })
    }

    if (userDocument.OTP_retries >= config.OTP_max_retries) {
        throw new ForbiddenError('Max retries sent, contact admin.')
    }

    const tempPassword = userDocument.generateTempPassword()
    try {
        await userDocument.save()
        res.status(StatusCodes.OK).json({ user: { id:userDocument.getId(), email: email } })
        const body = `This is your temporary password:\n${tempPassword}\nIt will expire in ${config.OTP_expire_minutes} minutes.`
        sendMail(email, `${config.projectName}, temporary password`, body)    // send async
    } catch(e) {
        logger.error('forgotPassword: ' + e.message)
        throw new InternalServerError('Forgot password failed.')
    }
}

const validateOTP = async(req, res, next) => {
    const {
        email,
        password
    } = req.body
    
    const userDocument = await UserModel.findOne({emailLowercase: email.toLowerCase()}).exec()
    if (userDocument) {
        if (!userDocument.temp_password || userDocument.expiration_timestamp_OTP === null) {
            // if somehow requested this api with temp_password === false or no expiration
            throw new ForbiddenError()
        }
        if (new Date() >= userDocument.expiration_timestamp_OTP) {
            throw new UnauthenticatedError('OTP expired.')
        }
        if (!await userDocument.validatePassword(password)) {
            throw new UnauthenticatedError('Incorrect credentials.')
        }
        
        const oneTimeToken = userDocument.generateJWT()
        res.status(StatusCodes.OK).json({user: {id: userDocument.getId(), temp_password: userDocument.temp_password}, token: oneTimeToken})
    } else {
        throw new UnauthenticatedError('Incorrect credentials.')
    }
}

module.exports = { login, getSelf, refreshToken, logout, updateUserInfo, updatePassword, forgotPassword, validateOTP }