const express = require('express')
const { getVideoFromCamera } = require('../controllers/videos')

const router = express.Router()

// for management
router.route('/').get(getVideoFromCamera)

module.exports = router