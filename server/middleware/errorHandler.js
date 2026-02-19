const { StatusCodes } = require('http-status-codes');
const logger = require('../logging/logger')

const errorHandlerMiddleware = (err, req, res, next) => {
  const customError = {
        message: err.message || 'Something went wrong, try again later.',
        status: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  }

  logger.error(customError)
  
  return res.status(customError.status).json({'message': customError.message})
};

module.exports = errorHandlerMiddleware;