const nodemailer = require('nodemailer');
const config = require('../config')

const transporter = nodemailer.createTransport({
  service: config.nodeMailer.service, // or your SMTP host
  auth: {
    user: config.nodeMailer.user,
    pass: config.nodeMailer.pass // Use an App Password for security
  }
});

const send = async(recipient, subject, text) => {
    const mailOptions = {
        from: config.nodeMailer.user,
        to: recipient,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            config.logger.error(`nodemailer error: ${error}`);
            return
        }
        // console.log('Email sent: ' + info.response);
    });
}

module.exports = send