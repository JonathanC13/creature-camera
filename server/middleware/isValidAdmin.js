const { ForbiddenError } = require("../errors")
const RoleModel = requre('../models/Role')

const isValidAdmin = async(req, res, next) => {
    const {
        roleName
    } = req.user

    const response = await RoleModel.findOne({roleName: roleName}).exec()

    if (!response || response.roleLevel !== 1) {
        throw new ForbiddenError('User does not have the appropriate role level.')
    }

    req.user.roleLevel = response.roleLevel

    next()
}

module.exports = isValidAdmin