const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    // Configure your email service
    // Example for Gmail:
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        // pass: process.env.EMAIL_PASSWORD
        pass: "qzqzqzqz"
    }
});

const sendEmail = async ({ to, subject, html }) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = { sendEmail };