const express = require('express')
const router = express.Router()
const validateObjId = require('../middleware/validateObjId')
const { getAllCameras, getCamera, createCamera, updateCamera, deleteCamera } = require('../controllers/cameras')
const deleteCameraFromSubscribers = require('../middleware/deleteCameraFromSubscribers') // note: cameraDeleteQuery to delete camera._id from collection 'users' subscription Array

router.route('/').get(getAllCameras).post(createCamera)
router.route('/:id').get(validateObjId, getCamera).patch(validateObjId, updateCamera).delete(validateObjId, deleteCameraFromSubscribers, deleteCamera)

module.exports = router