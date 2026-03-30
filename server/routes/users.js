const express = require('express')
const { getAllUsers, getUser, registerUser, deleteUser, updateUser, adminSetPassword } = require('../controllers/users')
const isValidObjId = require('../middleware/isValidObjId')

const router = express.Router()

// for management
router.route('/').get(getAllUsers)
router.route('/:id').get(isValidObjId, getUser).patch(isValidObjId, updateUser).delete(isValidObjId, deleteUser)
router.route('/register').post(registerUser)
router.route('/adminSetPassword/:id').patch(isValidObjId, adminSetPassword)

module.exports = router