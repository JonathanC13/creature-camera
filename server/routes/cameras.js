const express = require('express')
const router = express.Router()
const isValidObjId = require('../middleware/isValidObjId')
const { getAllCameras, getCamera, createCamera, updateCamera, deleteCamera } = require('../controllers/cameras')
const deleteCameraFromSubscribers = require('../middleware/deleteCameraFromSubscribers') // note: cameraDeleteQuery to delete camera._id from collection 'users' subscription Array

router.route('/').get(getAllCameras).post(createCamera)
router.route('/:id').get(isValidObjId, getCamera).patch(isValidObjId, updateCamera).delete(isValidObjId, deleteCameraFromSubscribers, deleteCamera)

module.exports = router