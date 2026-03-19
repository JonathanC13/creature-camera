const fs = require('fs').promises;
const path = require("path");

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    console.log(`File does not exist or is inaccessible at: ${filePath} . `, error);
    return false;
  }
}

async function createDirectory(directory) {
  try {
    await fs.mkdirSync(directory, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory: ${directory} . `, err.message);
    return false
  }

  return true
}

async function directoryExists(directory) {
  try {
    const stats = fs.statSync(path);
    if (!stats.isDirectory() && !(await createDirectory(directory))) {
      // Directory does not exist, therefore create it
      return false
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      // Directory does not exist, therefore create it
      if (!(await createDirectory(directory))) {
        return false
      }
    } else {
      console.error("Error checking directory: ", err.message);
      return false
    }
  }

  return true
}

module.exports = { fileExists, directoryExists }