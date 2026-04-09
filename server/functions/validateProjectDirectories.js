const { directoryExists } = require('./fileSystem')
const config = require('../config')
const path = require('path');

async function validateProjectDirectories() {
    const {
        base,
        folders
    } = config.projectDirectories

    for (let i = 0; i < folders.length; i ++) {
        const directory = path.join(base, folders[i]);

        if (!(await directoryExists(directory))) {
            return false
        }
    }

    return true
}

module.exports = validateProjectDirectories
