const path = require('path');

const videoFileFilter = (req, file, cb) => {
  const filetypes = /.mp4|.avi|.mkv/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

  if (extname) {
    // To accept the file pass `true`, like so:
    return cb(null, true);
  } else {

    cb(new Error('File type not accepted!'), false)
  }

  // You can always pass an error if something goes wrong:
  //cb(new Error('I don\'t have a clue!'))
};

module.exports = { videoFileFilter }