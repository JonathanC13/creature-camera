const RoleModel = require('../models/Role')
const {StatusCodes} = require('http-status-codes')
const logger = require('../logging/logger')

/**
 * Responds with all cameras from collection 'camera-information'.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @returns {undefined}
 */
const getAllRoles = async(req, res, next) => {
    const response = await RoleModel.find({}).exec()
    
    res.status(StatusCodes.OK).json({response: response.map((e) => e.getRoleInfo())})
}
module.exports = { getAllRoles }