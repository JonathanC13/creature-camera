const otpGenerator = require('otp-generator')

const generateOTP = () => {
    return otpGenerator.generate(6, { specialChars: false })
}

module.exports = generateOTP