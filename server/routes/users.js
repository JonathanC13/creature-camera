const express = require('express')
const { getAllUsers, getUser, registerUser, deleteUser, updateSubbedCameras } = require('../controllers/users')
const isValidObjId = require('../middleware/isValidObjId')

const router = express.Router()

// for management
router.route('/').get(getAllUsers)
router.route('/:id').get(isValidObjId, getUser).patch(isValidObjId, updateSubbedCameras).delete(isValidObjId, deleteUser)
router.route('/register').post(registerUser)

module.exports = router