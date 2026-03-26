const UserModel = require('../models/User')
const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const authorization = async(req, res, next) => {
    // request has the token in the header:
    // authentication: Bearer token
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer')) {
        throw new UnauthenticatedError('Not authenticated!')
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

                throw new UnauthenticatedError('Access token expired!')
            }
            return decoded
        }
    );

    try {
        // validate that the user decoded from the token exists in the DB
        const response = await UserModel.findById(payload.userId).select('-password').exec()
        
        if (!response) {
            throw new Error('User does not exist.')
        }

        // attach the user to the route
        req.user = response.getInfo()
    } catch (err) {
        throw new UnauthenticatedError('Not authenticated! ' + err.message)
    }

    next()
}

module.exports = authorization