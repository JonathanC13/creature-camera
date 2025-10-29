 // config.js
const config = {
    app: {
        port: process.env.PORT || 5000, // Example: Port for the application, can be overridden by environment variable
    },
    uploadsDir: "uploads/"
};

module.exports = config;