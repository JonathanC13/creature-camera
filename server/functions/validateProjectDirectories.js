const { directoryExistsOrCreate } = require('./fileSystem')
const config = require('../config')
const path = require('path');

async function validateProjectDirectories() {
    const {
        projectDirectories
    } = config

    for (let directory of projectDirectories) {
        if (!(await directoryExistsOrCreate(directory))) {
            return false
        }
    }

    return true
}

module.exports = validateProjectDirectories
