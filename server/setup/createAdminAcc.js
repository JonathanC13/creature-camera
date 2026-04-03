const path = require('path');
const readlineSync = require('readline-sync');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connectDB = require('../db/connect')
const validateRoleCollection = require('../functions/validateRoleCollection')
const RoleModel = require('../models/Role')
const UserModel = require('../models/User')
const config = require('../config')

const createAdminAcc = async() => {
    await connectDB(config.app.mongoURI)

    if (!(await validateRoleCollection())) {
        console.log('Error: Roles could not be validated.')
        return
    }
    
    const adminRoleLevel = 1
    const adminRoleDoc = await RoleModel.findOne({roleLevel: adminRoleLevel}).exec()

    if (!adminRoleDoc) {
        console.log('Error: Role not found.')
        return
    }

    const user = {
        name: "",
        email: "",
        emailLowercase: "",
        password: "",
        role_id: adminRoleDoc._id,
        roleLevel: adminRoleDoc.roleLevel
    }

    const ask = ["name", "email", "password"]
    console.log("Enter admin account information:")
    for (let q of ask) {
        user[q] = readlineSync.question(`Please enter the ${q}: `)
    }

    user["emailLowercase"] = user["email"].toLowerCase()

    try {
        const userDoc = await UserModel.create(user)
        console.log('Account successfully created.')
    } catch (e) {
        console.log(`Could not create account: ${e}`)
    }

    return
}

const run = async() => {
    await createAdminAcc()
    process.exit(0)
}

run()