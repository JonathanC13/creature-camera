const UserModel = require('../models/User')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const { StatusCodes } = require('http-status-codes')

const login = async(req, res, next) => {
    const {
        email,
        password
    } = req.body

    if (email === '' || password === '') {
        throw new BadRequestError('Please provide email and password.')
    }

    const response = await UserModel.findOne({emailLowercase: email.toLowerCase()}).exec()

    if (!response) {
        throw new UnauthenticatedError('Not authenticated.')
    }

    const passwordCorrect = await response.validatePassword(response.password)

    if (!passwordCorrect) {
        throw new UnauthenticatedError('Not authenticated.')
    }

    // token for Access Token, refreshToken for refresh token
    const token = response.generateJWT()
    const refreshToken = response.generateRefreshJWT()  // new refresh token to extend persistent log in.

    // update user document to save the new Refresh token. In Mongoose, once you have the document it can be updated with save()
    try {
        response.refreshToken = refreshToken
        const saveResponse = response.save()
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({'message': 'Server error!'})
        return
    }
    
    // send refresh token in a httpOnly cookie
    res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: process.env.COOKIE_EXPIRY_MS, sameSite: 'None', secure: true}) // for prod: secure: true
    const info = response.getUserInfo()
    res.status(StatusCodes.OK).json({user: {info}, token: token})
}

const refreshToken = async(req, res, next) => {

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

module.exports = { login, refreshToken, logout, updateUserInfo, updatePassword, forgotPassword, validateOTP }