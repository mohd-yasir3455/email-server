const nodemailer = require('nodemailer');
require('dotenv').config();

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

if (!GMAIL_USER || !GMAIL_PASSWORD) {
  console.warn('Warning: GMAIL_USER or GMAIL_PASSWORD not set — mailer may fail on send');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },
});

transporter.verify((err) => {
  if (err) console.error('Mailer verify failed:', err && err.message ? err.message : err);
  else console.log('Mailer ready —', GMAIL_USER);
});

async function sendMail({ from, to, subject, html, replyTo }) {
  const mailOptions = {
    from: from || process.env.MAIL_FROM || GMAIL_USER,
    to,
    subject,
    html,
    ...(replyTo && { replyTo }),
  };

  // Debug output: log subject and a truncated html preview to help debugging builders
  try {
    console.log('Sending email:', { to, subject });
    const preview = typeof html === 'string' ? html.replace(/\s+/g, ' ').slice(0, 400) : '[non-string html]';
    console.log('HTML preview:', preview + (preview.length === 400 ? '…' : ''));
  } catch (e) {
    console.warn('Failed to log mail preview', e && e.message ? e.message : e);
  }

  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
