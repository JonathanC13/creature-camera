const fs = require('fs');
const path = require('path');
const FormData = require('form-data')
const fetch = require('node-fetch');    // node-fetch@2 for form-data compatibility

const testVideoPOST = async(token, filename) => {
    const videoPath = path.join(__dirname, '/videos', filename);

    //console.log('Exists:', fs.existsSync(videoPath));
    // const stats = fs.statSync(videoPath);
    // console.log('Size:', stats.size, 'bytes');
    const stream = fs.createReadStream(videoPath);
    // stream.on('open', () => console.log('Stream opened'));
    // stream.on('error', (err) => console.error('Stream error:', err));

    const formData = new FormData();
    formData.append('file', stream, filename); // 'file' should match multer field name.

    // console.log(formData._streams);

    const requestHeaders = {
        ...formData.getHeaders(), // adds the 'Content-Type' with the correct boundary
        'authorization': `Bearer ${token}`,
    };

    try {
        // console.log(requestHeaders)
        const response = await fetch('http://127.0.0.1:5000/api/v1/uploadVideo', 
            {
                method: 'POST',
                headers: requestHeaders,
                body: formData
            },
        )
        
        console.log(await response.json())
    } catch (e) {
        console.error('Error', e)
    }
}

testVideoPOST('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYW1lcmFfbnVtYmVyIjoiMSIsImNhbWVyYV9uYW1lIjoiRmlyc3QgY2FtZXJhIn0.Af5bzfUQGgYVvR9yl42F3ovi47RuMbuJ4iJEj68nOm8', 'recorded_2026221_15h56m49s.avi')