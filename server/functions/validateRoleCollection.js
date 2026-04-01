const RoleModel = require('../models/Role')
const logger = require('../logging/logger')

/**
 * Ensure collection 'role' has the required roles to operate.
 * @returns {boolean} if required roles could be inserted with no error.
 */
const validateRoleCollection = async() => {
    const roles = [
        {
            "roleName": "admin",
            "roleLevel": 1
        },
        {
            "roleName": "user",
            "roleLevel": 2
        }
    ]

    try {
        // ordered: false skips duplicated unique keys (roleLevel)
        await RoleModel.insertMany(roles, { ordered: false });
    } catch (error) {
        // Check if error is a duplicate key error (code 11000)
        if (error.code !== 11000) {
            logger.info("Could not populate collection 'role' properly.")
            return false
        }
    }

    return true
}

module.exports = validateRoleCollection