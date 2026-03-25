const CustomAPIError = require('./custom-api')
const UploadError = require('./upload-error')
const BadRequestError = require('./bad-request')
const UnauthenticatedError = require('./unauthenticated')
const NotFoundError = require('./not-found')
const ForbiddenError = require('./forbidden')

module.exports = { CustomAPIError, UploadError, BadRequestError, UnauthenticatedError, NotFoundError, ForbiddenError }