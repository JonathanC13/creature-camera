const express = require('express')
const { getSubVideos, getVideoFromCamera } = require('../controllers/videos')
const isValidObjId = require('../middleware/isValidObjId')

const router = express.Router()

// for management
router.route('/').get(getSubVideos)
router.route('/video').get(isValidObjId, getVideoFromCamera)

module.exports = router