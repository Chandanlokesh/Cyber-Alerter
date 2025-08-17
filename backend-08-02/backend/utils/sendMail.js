// utils/sendMail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use SMTP settings
  auth: {
    user: "cyberalerter.v1@gmail.com",     // e.g. yourname@gmail.com
    // pass: "v1CA#2025",     // app password if 2FA
    pass : "gxkpzzwhjxxbaaxi"
  },
});


exports.sendNotificationEmail = async (to, subject, html, attachments = []) => {
  try {
    await transporter.sendMail({
      from: `"Cyber Alerter" <cyberalerter.v1@gmail.com>`,
      to,
      subject,
      html,
      attachments
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Email error to ${to}:`, err.message);
  }
};
