const path = require("path");

const config = {
    app: {
        port: process.env.PORT || 5000, // Example: Port for the application, can be overridden by environment variable
        mongoURI: process.env.MONGO_URI
    },
    projectDirectories: {
        base: path.__dirname(),
        folders: [
            'uploads'
        ]
    },
    uploadsFolder: 'uploads/'
};

module.exports = config;