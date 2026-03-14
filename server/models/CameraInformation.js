const mongoose = require('mongoose')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs');

const CameraInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Camera name required.'],
        trim: true,
    },
    cameraToken: {
        type: String,
        required: [true, 'Camera token required.'],
    },
    subscribers: {
        type: [mongoose.Types.ObjectId],
    }
}, )

CameraInfoSchema.methods.getId = function() {
    return this._id.toString()
}

CameraInfoSchema.methods.getName = function() {
    return this.name
}

CameraInfoSchema.methods.getSubscribers = function() {
    return this.subscribers
}

CameraInfoSchema.methods.getCameraInfo = function() {
    return {
        id: this._id.toString(),
        name: this.name,
        subscribers: subscribers
    }
}

module.exports = mongoose.model('camera-information', CameraInfoSchema)