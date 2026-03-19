const { directoryExists } = require('./fileSystem')
const config = require('../config')

async function validateProjectDirectories() {
    const {
        base,
        folders
    } = config.projectDirectories

    for (let i = 0; i < directories.length; i ++) {
        const directory = path.join(base, folders[i]);

        if (!(await directoryExists(directory))) {
            return false
        }
    }

    return true
}

module.exports = validateProjectDirectories