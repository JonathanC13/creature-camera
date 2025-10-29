const fs = require('fs').promises;

async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    // console.log(`File exists at: ${filePath}`);
    return true;
  } catch (error) {
    // console.log(`File does not exist or is inaccessible at: ${filePath}`);
    return false;
  }
}

module.exports = { checkFileExists }