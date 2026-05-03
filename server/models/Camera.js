const mongoose = require('mongoose')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs');

const CameraSchema = new mongoose.Schema({
    cameraName: {
        type: String,
        required: [true, 'Camera name required.'],
        trim: true,
        unqiue: true
    },
    cameraToken: {
        type: String,
        required: [true, 'Camera token required.'],
        unique: true
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
        cameraName: this.cameraName,
        cameraToken: this.cameraToken
    }
}

module.exports = mongoose.model('cameras', CameraSchema)