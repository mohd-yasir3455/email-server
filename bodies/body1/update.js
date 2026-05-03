const Handlebars = require('handlebars');

const { getLatestDoc } = require('../../lib/firebaseClient');

const defaultTo = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || 'noreply@example.com';

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value._seconds === 'number') return new Date(value._seconds * 1000);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return 'Today';

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function esc(value) {
  return Handlebars.escapeExpression(value == null ? '' : String(value));
}

function pickPunchline(ctx) {
  if (ctx.punchline) return ctx.punchline;

  const lines = [
    'Payment update ho gaya. Calculator ne bhi softly clap kiya.',
    'Accountability level: papa checking passbook on Sunday morning.',
    'One paid entry down, peace of mind thoda sa up.',
    'This update said "main hoon na" and quietly balanced the scene.',
    'Paid entry saved. Budget spreadsheet is pretending not to smile.',
    'Tiny finance moment, full responsible-adult energy.',
    'Kharcha tracked, tension packed, chai intact.',
    'This payment update is giving "sorted hai boss" vibes.',
  ];
  const seed = `${ctx.id || ''}${ctx.title || ''}${ctx.countDeducted || ''}`;
  const index = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % lines.length;

  return lines[index];
}

async function build({ to, data = {} } = {}) {
  const latestEntry = await getLatestDoc('paid_entries', 'createdAt');
  const ctx = {
    ...(latestEntry || {}),
    ...(data || {}),
  };

  const title = ctx.title || 'A paid entry';
  const entryDate = formatDate(ctx.date || ctx.createdAt);
  const createdAt = formatDate(ctx.createdAt);
  const countDeducted = Number(ctx.countDeducted || 1);
  const adminEmail = ctx.adminEmail || process.env.ADMIN_EMAIL || defaultTo;
  const appName = process.env.APP_NAME || 'Thank You Tracker';
  const ctaUrl = ctx.ctaUrl || process.env.CTA_URL || '#';
  const punchline = pickPunchline(ctx);

  const subject = ctx.subject || `Paid entry updated: ${title}`;
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#fff5fb;font-family:Arial,Helvetica,sans-serif;color:#4b3144;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff5fb;margin:0;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #f5d5ee;box-shadow:0 18px 45px rgba(188,105,174,0.18);">
            <tr>
              <td style="background:linear-gradient(135deg,#e3ccff 0%,#ffc7e6 55%,#fff0f8 100%);padding:34px 30px 28px;text-align:center;">
                <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,0.62);color:#7e579e;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                  ${esc(appName)}
                </div>
                <h1 style="margin:18px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.15;color:#ffffff;text-shadow:0 2px 12px rgba(110,55,105,0.22);">
                  A paid entry got neatly updated
                </h1>
                <p style="margin:0;color:#fff7fd;font-size:16px;line-height:1.6;">
                  The tracker adjusted its tiny glasses and filed this one properly.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff8fd;border:1px solid #f6d9f1;border-radius:18px;">
                  <tr>
                    <td style="padding:26px;">
                      <p style="margin:0 0 10px;color:#a45b93;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                        Latest paid entry
                      </p>
                      <h2 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;color:#5d3455;font-size:28px;line-height:1.25;">
                        ${esc(title)}
                      </h2>
                      <p style="margin:0;color:#6f5368;font-size:16px;line-height:1.75;">
                        This paid-entry update has been recorded and matched with the newest Firebase data.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;">
                  <tr>
                    <td width="50%" style="padding:0 8px 0 0;">
                      <div style="background:#f7efff;border:1px solid #e7d5ff;border-radius:16px;padding:18px;text-align:center;">
                        <p style="margin:0 0 6px;color:#9469b7;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Entry date</p>
                        <p style="margin:0;color:#5d3c73;font-size:17px;font-weight:700;">${esc(entryDate)}</p>
                      </div>
                    </td>
                    <td width="50%" style="padding:0 0 0 8px;">
                      <div style="background:#fff0f8;border:1px solid #ffd2ec;border-radius:16px;padding:18px;text-align:center;">
                        <p style="margin:0 0 6px;color:#b45d96;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Count deducted</p>
                        <p style="margin:0;color:#733b65;font-size:17px;font-weight:700;">${esc(countDeducted)}</p>
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="margin-top:22px;padding:18px 20px;border-radius:18px;background:#fffafd;border:1px dashed #eab9dd;">
                  <p style="margin:0;color:#7b5a72;font-size:14px;line-height:1.7;">
                    The paid entry has been tucked into the records like a receipt in a very responsible diary.
                    Created on ${esc(createdAt)}.
                  </p>
                </div>

                <div style="margin-top:18px;padding:20px;border-radius:18px;background:#fdf0ff;border:1px solid #e9ccff;text-align:center;">
                  <p style="margin:0 0 8px;color:#9a63b8;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                    Tiny meme punchline
                  </p>
                  <p style="margin:0;color:#6d3f7d;font-size:17px;font-weight:700;line-height:1.55;">
                    ${esc(punchline)}
                  </p>
                </div>

                <div style="text-align:center;margin:28px 0 8px;">
                  <a href="${esc(ctaUrl)}" style="display:inline-block;background:#d96fb6;color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 26px;font-weight:700;font-size:15px;box-shadow:0 10px 24px rgba(217,111,182,0.28);">
                    Open the updated entry
                  </a>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 30px;background:#fbecf7;text-align:center;color:#9a6c8e;font-size:12px;line-height:1.6;">
                Sent to ${esc(to || adminEmail)} from ${esc(appName)}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  console.log('Built email content for update event:', {
    subject,
    source: 'paid_entries',
    entryId: ctx.id || null,
    defaultTo: to || adminEmail,
  });

  return {
    subject,
    html,
    replyTo: process.env.REPLY_TO,
    from: process.env.MAIL_FROM,
    defaultTo: to || adminEmail,
  };
}

module.exports = { build, defaultTo };
