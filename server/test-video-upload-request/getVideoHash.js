const fs = require('fs');
const crypto = require('crypto');

const data = fs.readFileSync('D:\\Important\\VS code\\pyStuff\\full_stack_road_map\\Full-stack-projs\\creature-camera\\creature-camera\\server\\uploads\\69e123f5521067c3cf7a6083\\recorded_202658_13h31m52s.mp4');

console.log(
  crypto.createHash('md5')
    .update(data)
    .digest('hex')
);