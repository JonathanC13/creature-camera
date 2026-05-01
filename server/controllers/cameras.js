const CameraModel = require('../models/Camera')
const {NotFoundError, BadRequestError, InternalServerError} = require('../errors')   // error is a folder and will access error/index.js
const {StatusCodes} = require('http-status-codes')
const logger = require('../logging/logger')

/**
 * Responds with all cameras from collection 'camera-information'.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @returns {undefined}
 */
const getAllCameras = async(req, res, next) => {
    const response = await CameraModel.find({}).exec()

    res.status(StatusCodes.OK).json({response, count: response.length})
}

/**
 * Finds the camera with _id:id from 'camera-information' and returns it in the response.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @returns {undefined}
 */
const getCamera = async(req, res, next) => {
    const cameraId = req.params.id

    const response = await CameraModel.findById(cameraId).exec()

    if (!response) {
        throw new NotFoundError(`Camera with id: ${cameraId} does not exist`)
    }

    res.status(StatusCodes.OK).json({response})
}

/**
 * Creates a new camera document in collection 'camera-information' and responds with the document.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @returns {undefined}
 */
const createCamera = async(req, res, next) => {
    const {
        body: {name}   // find key 'body', then find key 'name' and assign value to variable 'name'
    } = req

    if (name === '') {
        throw new BadRequestError('Please provide a camera name!')
    }

    try {
        const response = await CameraModel.create({...req.body})
        res.status(StatusCodes.CREATED).json({response})
    } catch (e) {
        logger.error('createCamera: ' + e.message)
        const err = new Error()
        err.code = e?.code
        err.keyValue = e?.keyValue
        throw err
    }
}

/**
 * Updates the camera with _id:id in collection 'camera-information' and responds with the modified document.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @returns {undefined}
 */
const updateCamera = async(req, res, next) => {
    const {
        params: { id: cameraId }    // find key 'params', go inside to find key 'id' and then assign value to variable 'cameraId'
    } = req
    
    const optObj = {
        returnDocument: true,
        runValidators: true
    }

    try {
        const response = await CameraModel.findByIdAndUpdate(cameraId, req.body, optObj).exec()
        
        if (!response) {
            throw new NotFoundError(`Camera with id: ${cameraId} does not exist`)
        }

        res.status(StatusCodes.OK).json({response})
    } catch (e) {
        logger.error('updateCamera: ' + e.message)
        throw new InternalServerError('Update camera failed.')
    }
}

/**
 * Deletes the camera with _id:id in collection 'camera-information' and responds with success.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @returns {undefined}
 */
const deleteCamera = async(req, res, next) => {
    const {
        params: { id }
    } = req

    await CameraModel.deleteOne({_id: id})

    res.status(StatusCodes.OK).send()
}

module.exports = { getAllCameras, getCamera, createCamera, updateCamera, deleteCamera }