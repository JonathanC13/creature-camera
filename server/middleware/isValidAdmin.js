const { ForbiddenError } = require("../errors")
const RoleModel = requre('../models/Role')

const isValidAdmin = async(req, res, next) => {
    const {
        role_id
    } = req.user

    const response = await RoleModel.findById(role_id).exec()

    if (!response || response.roleLevel !== 1) {
        throw new ForbiddenError('User does not have the appropriate role level.')
    }

    req.user.role = { response }

    next()
}

module.exports = isValidAdmin