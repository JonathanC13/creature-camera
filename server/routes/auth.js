const express = require('express')
const { login, refreshToken, logout, updateUserInfo, updatePassword, forgotPassword, validateOTP } = require('../controllers/auth')

const router = express.Router()

// for individual user
router.route('/login').post(login)
router.route('/refreshToken').get(refreshToken)
router.route('/logout').post(logout)
router.route('/updateUserInfo/:id').patch(updateUserInfo)
router.route('/updatePassword/:id').patch(updatePassword)
router.route('/forgotPassword').post(forgotPassword)
router.route('/validateOTP/:id').post(validateOTP)

module.exports = router