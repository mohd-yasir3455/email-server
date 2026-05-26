const nodemailer = require('nodemailer');
require('dotenv').config();

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

if (!GMAIL_USER || !GMAIL_PASSWORD) {
  console.warn(
    'Warning: GMAIL_USER or GMAIL_PASSWORD not set — mailer may fail on send'
  );
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,

  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,

  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

transporter.verify((err, success) => {
  if (err) {
    console.error('Mailer verify failed:', err);
  } else {
    console.log('Mailer ready —', GMAIL_USER);
  }
});

async function sendMail({ from, to, subject, html, replyTo }) {
  const mailOptions = {
    from: from || process.env.MAIL_FROM || GMAIL_USER,
    to,
    subject,
    html,
    ...(replyTo && { replyTo }),
  };

  try {
    console.log('================ EMAIL DEBUG ================');
    console.log('Sending to:', to);
    console.log('Subject:', subject);

    const preview =
      typeof html === 'string'
        ? html.replace(/\s+/g, ' ').slice(0, 300)
        : '[non-string html]';

    console.log('HTML preview:', preview);

    console.log('Before sendMail');

    const info = await transporter.sendMail(mailOptions);

    console.log('After sendMail');
    console.log('Message sent:', info.messageId);

    return info;
  } catch (error) {
    console.error('SEND MAIL ERROR:', error);

    throw error;
  }
}

module.exports = { sendMail };