const mongoose = require('mongoose')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Camera name required.'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email!'],
        trim: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide a valid email!'],
        unique: true
    },
    emailLowercase: {
        type: String,
        required: [true, 'Please provide an email!'],
        trim: true,
        lowercase: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide a valid email!'],
        unique: true
    },
    subscriptions: {
        type: [mongoose.Types.ObjectId],
    },
}, )

UserSchema.methods.getId = function() {
    return this._id.toString()
}

UserSchema.methods.getName = function() {
    return this.name
}

UserSchema.methods.getEmail = function() {
    return this.email
}

UserSchema.methods.getSubscriptions = function() {
    return this.subscriptions
}

UserSchema.methods.getCameraInfo = function() {
    return {
        id: this._id.toString(),
        name: this.name,
        email: this.email,
        subscriptions: this.subscriptions
    }
}

module.exports = mongoose.model('users', UserSchema)