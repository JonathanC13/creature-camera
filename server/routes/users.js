const express = require('express')
const { getAllUsers, getUser, registerUser, deleteUser, updateUser, adminResetPassword } = require('../controllers/users')
const isValidObjId = require('../middleware/isValidObjId')

const router = express.Router()

// for management
router.route('/').get(getAllUsers)
router.route('/:id').get(isValidObjId, getUser).patch(isValidObjId, updateUser).delete(isValidObjId, deleteUser)
router.route('/register').post(registerUser)
router.route('/adminResetPassword/:id').patch(isValidObjId, adminResetPassword)

module.exports = router