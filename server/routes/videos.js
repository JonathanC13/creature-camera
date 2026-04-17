const express = require('express')
const { getSubVideos, getVideo } = require('../controllers/videos')
const isValidObjId = require('../middleware/isValidObjId')

const router = express.Router

// for management
router.route('/').get(getSubVideos)
router.route('/:id').get(isValidObjId, getVideoFromCamera)

module.exports = router