const path = require("path");
const logger = require('./logging/logger')

const config = {
    projectName: 'Create camera',
    logger: logger,
    app: {
        port: process.env.PORT || 5000, // Example: Port for the application, can be overridden by environment variable
        mongoURI: process.env.MONGO_URI
    },
    projectDirectories: {
        base: path.__dirname,
        folders: [
            'uploads'
        ]
    },
    uploadsFolder: 'uploads/',
    nodeMailer: {
        service: process.env.NODE_MAILER_SERVICE,
        user: process.env.NODE_MAILER_USER,
        pass: process.env.NODE_MAILER_PASS
    },
    OTP_max_retries: 3,
    OTP_expire_minutes: 15
};

module.exports = config;