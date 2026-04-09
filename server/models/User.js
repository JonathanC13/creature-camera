const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator')
const config = require('../config')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name required.'],
        trim: true,
        unique: true
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
        required: [true, 'Please provide an aaa email!'],
        trim: true,
        lowercase: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide a valid email!'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password!'],
        trim: true,
        minLength: [6, 'Please provide a password that is 6 or more characters!']
    },
    persistentLogin: {
        type: Boolean,
        default: false
    },
    role_id: {
        type: mongoose.Types.ObjectId,
        default: null,
        required: [true, 'Please provide a role id']
    },
    roleLevel: {
        type: Number,
        required: [true, 'Please provide a role level']
    },
    settingNotifyAlways: {
        type: Boolean,
        default: false
    },
    subscriptions: {
        type: [mongoose.Types.ObjectId],
    },
    lastNotifySent: {
        type: Date,
        default: null
    },
    lastLoggedIn: {
        type: Date,
        default: null
    },
    temp_password: {
        type: Boolean,
        default: false
    },
    expiration_timestamp_OTP: {
        type: Date,
        default: null
    },
    OTP_retries: {
        type: Number,
        default: 0
    },
    refreshToken: {
        type: String
    },
}, {timestamps: true})

// Document-level operations
// getters
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

UserSchema.methods.getUserInfo = function() {
    return {
        id: this._id.toString(),
        name: this.name,
        email: this.email,
        persistentLogin: this.persistentLogin,
        role_id: this.role_id,
        roleLevel: this.roleLevel,
        subscriptions: this.subscriptions,
        settingNotifyAlways: this.settingNotifyAlways,
        temp_password: this.temp_password
    }
}

// setters
UserSchema.methods.unsubscribe = function(cameraId) {
  this.subscribed.pull(cameraId);
  return this.save();
};

// functions
UserSchema.methods.generateJWT = function() {
    return jwt.sign({userId:this._id, name:this.name}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
}

UserSchema.methods.generateRefreshJWT = function() {
    return jwt.sign({userId:this._id, name:this.name}, process.env.JWT_REFRESH_SECRET, {expiresIn: process.env.JWT_REFRESH_LIFETIME})
}

UserSchema.methods.replacePassword = function(newPassword) {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(newPassword, salt);
}

UserSchema.methods.generateTempPassword = function() {
    const tempPassword = otpGenerator.generate(6, { specialChars: false });
    this.replacePassword(tempPassword)
    this.temp_password = true
    const date = new Date()
    this.expiration_timestamp_OTP = date.setMinutes(date.getMinutes() + config.OTP_expire_minutes)
    this.OTP_retries += 1

    return tempPassword
}

UserSchema.pre('save', function(next) {
    if (this.isNew) {
        // encrypt password
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
    }
    
    next()
})

UserSchema.methods.validatePassword = async function(password) {
    return await bcrypt.compare(password.toString(), this.password)
}

UserSchema.methods.needNotify = function() {
    return (this.settingNotifyAlways || this.lastNotifySent === null || (this.lastNotifySent !== null && this.lastLoggedIn !== null && this.lastNotifySent < this.lastLoggedIn)) ? true : false
}

module.exports = mongoose.model('users', UserSchema)