const axios = require('axios');
require('dotenv').config();

async function sendMail({ to, subject, html, from, replyTo }) {
  try {
    console.log('================ EMAIL DEBUG ================');
    console.log('Sending to:', to);
    console.log('Subject:', subject);

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          email: from || process.env.MAIL_FROM,
          name: 'Yasir',
        },

        to: [{ email: to }],

        subject,

        htmlContent: html,

        replyTo: replyTo
          ? { email: replyTo }
          : undefined,
      },
      {
        headers: {
          accept: 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json',
        },
      }
    );

    console.log('EMAIL SENT SUCCESSFULLY');
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      'BREVO API ERROR:',
      error.response?.data || error.message
    );

    throw error;
  }
}

module.exports = { sendMail };