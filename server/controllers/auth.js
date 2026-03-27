const UserModel = require('../models/User')
const { BadRequestError, UnauthenticatedError, NotFoundError, ForbiddenError, InternalServerError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const config = require('../config')
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

    const passwordCorrect = await response.validatePassword(userDocument.password)

    if (!passwordCorrect) {
        throw new UnauthenticatedError('Credentials incorrect.')
    }

    // token for Access Token, refreshToken for refresh token
    const token = userDocument.generateJWT()
    const refreshToken = userDocument.generateRefreshJWT()  // new refresh token to extend persistent log in.

    userDocument.OTP_retries = 0
    userDocument.expiration_timestamp_OTP = null

    // update user document to save the new Refresh token. In Mongoose, once you have the document it can be updated with save()
    try {
        userDocument.refreshToken = refreshToken
        const saveResponse = userDocument.save()
    } catch (error) {
        throw new InternalServerError('Login failed.')
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
        throw new InternalServerError('Logout failed.')
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
    if (userDocument.temp_password) {
        // once succesful change password, reset temp password info
        // two paths here: 1. first log in after created by admin, 2. updating password from OTP validated
        userDocument.temp_password = false
        userDocument.OTP_retries = 0
        userDocument.expiration_timestamp_OTP = null
    }

    try {
        await userDocument.save()
        res.status(StatusCodes.OK).json()
    } catch(e) {
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
    if (userDocument.OTP_retries >= config.OTP_max_retries) {
        throw new ForbiddenError('Max OTP sent, contact admin.')
    }

    const tempPassword = userDocument.generateOTP()
    try {
        await userDocument.save()
        res.status(StatusCodes.OK).json()
        const body = `This is your temporary password:\n${tempPassword}\nIt will expire in ${OTP_expire_minutes} minutes.`
        sendMail(`${projectName}, temporary password`, body)    // send async
    } catch(e) {
        throw new InternalServerError('Forgot password failed.')
    }

    return
}

const validateOTP = async(req, res, next) => {
    const {
        email,
        tempPassword
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
        if (!userDocument.validatePassword(tempPassword)) {
            throw new UnauthenticatedError('Incorrect credentials.')
        }
        
        const oneTimeToken = userDocument.generateJWT()
        res.status(StatusCodes.OK).json({user: {id: userDocument._id}, token: oneTimeToken})
    } else {
        throw new UnauthenticatedError('Incorrect credentials.')
    }
    
    return
}

module.exports = { login, refreshToken, logout, updateUserInfo, updatePassword, forgotPassword, validateOTP }