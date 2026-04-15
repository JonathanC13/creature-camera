const otpGenerator = require('otp-generator')

export default generateOTP = () => {
    return otpGenerator.generate(6, { specialChars: false })
}