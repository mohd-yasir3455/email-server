const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,

  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error('Brevo verify failed:', err);
  } else {
    console.log('Brevo SMTP ready');
  }
});

async function sendMail({ from, to, subject, html, replyTo }) {
  try {
    console.log('================ EMAIL DEBUG ================');
    console.log('Sending to:', to);
    console.log('Subject:', subject);

    const info = await transporter.sendMail({
      from: from || process.env.MAIL_FROM,
      to,
      subject,
      html,
      ...(replyTo && { replyTo }),
    });

    console.log('EMAIL SENT SUCCESSFULLY');
    console.log(info);

    return info;
  } catch (error) {
    console.error('BREVO SEND ERROR:', error);
    throw error;
  }
}

module.exports = { sendMail };