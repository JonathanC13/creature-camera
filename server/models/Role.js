const mongoose = require('mongoose')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs');

const RoleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: [true, 'Role name required.'],
        trim: true,
    },
    roleLevel: {
        type: Number,
        required: [true, 'Role level required.'],
    }
}, {timestamps: true})

// Document-level operations
// getters
RoleSchema.methods.getId = function() {
    return this._id.toString()
}

module.exports = mongoose.model('role', RoleSchema)