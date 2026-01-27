const express = require('express')
const router = express.Router()
const { uploadVideoSingle } = require('../controllers/uploadVideoSingle')
const uploadVideoMulter = require('../middleware/uploadVideoMulter')

router.route('/').post(uploadVideoMulter, uploadVideoSingle)

module.exports = router