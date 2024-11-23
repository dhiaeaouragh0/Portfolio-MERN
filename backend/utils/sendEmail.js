const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use another email service provider like SendGrid, etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send emails
const sendEmail = async (email, subject, message, isHtml = false) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,  // Sender address
        to: email,                     // Recipient address
        subject: subject,              // Subject of the email
        [isHtml ? 'html' : 'text']: message, // If HTML email, use 'html'; otherwise, use 'text'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
