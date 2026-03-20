const mongoose = require('mongoose')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs');

const CameraSchema = new mongoose.Schema({
    cameraName: {
        type: String,
        required: [true, 'Camera name required.'],
        trim: true,
    },
    cameraToken: {
        type: String,
        required: [true, 'Camera token required.'],
    }
}, {timestamps: true})

// Document-level operations
// getters
CameraSchema.methods.getId = function() {
    return this._id.toString()
}

CameraSchema.methods.getName = function() {
    return this.cameraName
}

CameraSchema.methods.getCameraInfo = function() {
    return {
        id: this._id.toString(),
        name: this.cameraName
    }
}

module.exports = mongoose.model('camera-information', CameraSchema)