const CustomAPIError = require('./custom-api')
const UploadError = require('./upload-error')
const BadRequestError = require('./bad-request')
const UnauthenticatedError = require('./unauthenticated')

module.exports = { CustomAPIError, UploadError, BadRequestError, UnauthenticatedError }