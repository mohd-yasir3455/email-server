const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const TEMPLATE = path.join(__dirname, 'template.hbs');

const defaultTo = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || 'noreply@example.com';

async function build({ to, data = {} } = {}) {
  const templateSrc = fs.readFileSync(TEMPLATE, 'utf8');
  const tpl = Handlebars.compile(templateSrc);

  // populate data with defaults
  const ctx = Object.assign({
    name: process.env.ADMIN_NAME || 'Friend',
    appName: process.env.APP_NAME || 'My App',
    ctaUrl: process.env.CTA_URL || '#',
    supportEmail: process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || 'support@example.com',
    year: new Date().getFullYear(),
  }, data || {});

  const html = tpl(ctx);
  const subject = ctx.subject || `Welcome to ${ctx.appName}`;

  return { subject, html, replyTo: process.env.REPLY_TO, from: process.env.MAIL_FROM, defaultTo };
}

module.exports = { build, defaultTo };
