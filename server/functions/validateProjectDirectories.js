const fs = require('fs');
const path = require("path");

const validateProjectDirectories = function() {
    const directories = ['../uploads']

    for (let i = 0; i < directories.length; i ++) {
        const dirPath = path.join(__dirname, directories[i]);

        try {
            const stats = fs.lstatSync(dirPath);

            if (!stats.isDirectory()) {
                throw new Error("A non-directory file exists at that path.");
            }

            // console.log("Directory already exists:", dirPath); // good
        } catch (err) {
            if (err.code === "ENOENT") {
                // Directory does not exist, therefore create it
                try {
                    fs.mkdirSync(dirPath, { recursive: true });
                    console.log("Directory created:", dirPath);
                } catch (mkdirErr) {
                    console.error("Error creating directory:", mkdirErr.message);
                }
            } else {
                console.error("Error checking directory:", err.message);
            }

            return false
        }
    }

    return true
}

module.exports = validateProjectDirectories