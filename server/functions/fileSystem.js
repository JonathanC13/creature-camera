// const fs = require('fs');
const { constants, access, stat, mkdir } = require('node:fs/promises')
const path = require("path");

async function fileExists(filePath) {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch (error) {
    // console.log(`File does not exist or is inaccessible at: ${filePath} . `, error.message);
    return false;
  }
}

async function directoryExists(directory) {
  try {
    const stats = await stat(directory);
    if (!stats.isDirectory()) {
      return false
    }
  } catch (err) {
    return false
  }
  
  return true
}

async function createDirectory(directory) {
  try {
    await mkdir(directory, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory: ${directory} . `, err.message);
    return false
  }

  return true
}

async function directoryExistsOrCreate(directory) {
  
  try {
    const stats = await stat(directory);
    // if not directory, try to create
    if (!stats.isDirectory() && !(await createDirectory(directory))) {
      console.error("Error creating directory: ", err.message);
      return false
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      // Directory does not exist, therefore create it
      if (!(await createDirectory(directory))) {
        console.error("Error creating directory: ", err.message);
        return false
      }
    } else {
      console.error("Error checking directory: ", err.message);
      return false
    }
  }
  
  return true
}

module.exports = { fileExists, directoryExists, directoryExistsOrCreate }