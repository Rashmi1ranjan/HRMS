const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Using dummy SMTP as default, ideally placed in .env
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: process.env.SMTP_PORT || 2525,
    auth: {
        user: process.env.SMTP_USER || "dummy_user",
        pass: process.env.SMTP_PASS || "dummy_pass"
    }
});

exports.sendAbsentNotification = async (email, name, date) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"HR Admin" <no-reply@hrms.com>',
            to: email,
            subject: 'Absent Notification',
            text: `Hello ${name},\n\nYou have been marked absent for ${date} as you did not check in today.\n\nRegards,\nHR Team`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Absent email sent to:", email, "MessageID:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
