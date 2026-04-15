const express = require('express')
const { login, refreshToken, logout, updateUserInfo, updatePassword, forgotPassword, validateOTP } = require('../controllers/auth')
const isValidObjId = require('../middleware/isValidObjId')
const authorization = require('../middleware/authorization')

const router = express.Router()

// for individual user
router.route('/login').post(login)
router.route('/refreshToken').get(refreshToken)
router.route('/logout').post(logout)
router.route('/updateUserInfo/:id').patch(authorization, isValidObjId, updateUserInfo)
router.route('/updatePassword/:id').patch(authorization, isValidObjId, updatePassword)
router.route('/forgotPassword').post(forgotPassword)
router.route('/validateOTP').post(validateOTP)

module.exports = router