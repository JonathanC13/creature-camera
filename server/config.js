 // config.js
const config = {
    app: {
        port: process.env.PORT || 5000, // Example: Port for the application, can be overridden by environment variable
        mongoURI: process.env.MONGO_URI
    },
    uploadsDir: "uploads/"
};

module.exports = config;