const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const testVideoPOST = (token, filename) => {
    const videoPath = path.join(__dirname, '/videos', filename);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(videoPath)); // 'file' should match multer field name

    const requestHeaders = {
        'authorization': `Bearer ${token}`,
        ...formData.getHeaders(), // This adds the 'Content-Type' with the correct boundary
    };

    fetch('http://192.168.1.2:5000/api/v1/uploadVideo', 
        {
            method: 'POST',
            headers: requestHeaders,
            body: formData
        },
    )
    .then((response) => {response.json()})
    .then((data) => {console.log(data)})
    .catch((error) => {console.error('Error', error)})
}

testVideoPOST('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYW1lcmFfbnVtYmVyIjoiMSIsImNhbWVyYV9uYW1lIjoiRmlyc3QgY2FtZXJhIn0.Af5bzfUQGgYVvR9yl42F3ovi47RuMbuJ4iJEj68nOm8', 'recorded_2026221_15h56m35s.avi')