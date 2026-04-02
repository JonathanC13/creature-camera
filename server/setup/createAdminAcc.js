const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connectDB = require('../db/connect')
const validateRoleCollection = require('../functions/validateRoleCollection')
const RoleModel = require('../models/Role')
const UserModel = require('../models/User')

const createAdminAcc = async() => {
    await connectDB(config.app.mongoURI)

    if (!validateRoleCollection()) {
        console.log('Error: Roles could not be validated.')
        return
    }
    
    const adminRoleLevel = 1
    const adminRoleDoc = await RoleModel.findOne({RoleLevel: adminRoleLevel}).exec()

    const user = {
        name: "",
        email: "",
        password: "",
        role_id: adminRoleDoc._id,
        roleLevel: adminRoleDoc.roleLevel
    }

    const ask = ["name", "email", "password"]
    console.log("Enter admin account information:")
    for (let q of ask) {
        const ans = prompt(`Please enter the ${q}: `);
        user[q] = ans
    }

    try {
        const userDoc = await UserModel.create(user).exec()
        console.log('Account successfully created.')
    } catch (e) {
        console.log(`Could not create account: ${e}`)
    }
}

createAdminAcc()