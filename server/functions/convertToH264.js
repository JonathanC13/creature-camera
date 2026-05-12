const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

const convertToH264 = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264")   // H.264 codec
      .audioCodec("aac")       // browser-friendly audio
      .outputOptions([
        "-preset fast",
        "-crf 23",
        "-movflags +faststart" // important for web playback
      ])
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
};

module.exports = convertToH264