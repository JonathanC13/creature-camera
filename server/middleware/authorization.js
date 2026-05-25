const UserModel = require('../models/User')
const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const authorization = async(req, res, next) => {
    
    // request has the token in the header:
    // authentication: Bearer token
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer')) {
        throw new UnauthenticatedError()
    }

    const token = authHeader.split(' ')[1]
    const payload = jwt.verify(token, process.env.JWT_SECRET, 
        function(err, decoded) {
            if (err) {
            /*
                err = {
                name: 'TokenExpiredError',
                message: 'jwt expired',
                expiredAt: 1408621000
                }
            */
                throw new UnauthenticatedError('token')
            }
            return decoded
        }
    );

    try {
        // validate that the user decoded from the token exists in the DB
        
        const response = await UserModel.findById(payload.userId).select('-password').exec()
        
        if (!response) {
            throw new UnauthenticatedError()
        }

        // attach the user to the route
        req.user = response.getUserInfo()
    } catch (err) {
        throw new UnauthenticatedError(err)
    }

    next()
}

module.exports = authorization