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
        unique: true
    }
}, {timestamps: true})

// Document-level operations
// getters
RoleSchema.methods.getId = function() {
    return this._id.toString()
}

RoleSchema.methods.getRoleInfo = function() {
    return  {
        id: this._id.toString(),
        roleName: this.roleName,
        roldeLevel: this.roleLevel
    }
}

module.exports = mongoose.model('roles', RoleSchema)