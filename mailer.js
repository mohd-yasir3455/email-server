const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail({ from, to, subject, html, replyTo }) {
  try {
    console.log('================ EMAIL DEBUG ================');
    console.log('Sending to:', to);
    console.log('Subject:', subject);

    const response = await resend.emails.send({
      from: from || process.env.MAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
      reply_to: replyTo,
    });

    console.log('EMAIL SENT SUCCESSFULLY');
    console.log(response);

    return response;
  } catch (error) {
    console.error('RESEND SEND ERROR:', error);
    throw error;
  }
}

module.exports = { sendMail };