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

function formatShortDate(value) {
  const date = toDate(value);
  if (!date) return 'Today';

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
  }).format(date);
}

function esc(value) {
  return Handlebars.escapeExpression(value == null ? '' : String(value));
}

function excerpt(value, length = 74) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}...`;
}

function buildJarHearts(count) {
  const filled = Math.min(Math.max(Number(count) || 1, 1), 5);
  return Array.from({ length: 5 }, (_, index) => (index < filled ? '💖' : '🤍')).join(' ');
}

function pickPunchline(ctx) {
  if (ctx.punchline) return ctx.punchline;

  const lines = [
    'Gratitude level: mummy-approved, chai-ready, full marks.',
    'This entry said "bas five minute" and then became the whole happy moment.',
    'Soft feelings have entered the chat, and honestly, valid.',
    'Not to be dramatic, but this deserves its own tiny Bollywood interval.',
    'Today ka wholesome update: dil garden garden, tracker updated.',
    'This thank-you has main-character energy, but in a very polite way.',
    'Entry added. Emotional damage repaired by approximately one cute point.',
    'Somewhere, a group chat would reply: "arre wah, cute!"',
  ];
  const seed = `${ctx.id || ''}${ctx.title || ''}${ctx.description || ''}`;
  const index = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % lines.length;

  return lines[index];
}

async function build({ to, data = {} } = {}) {
  const latestEntry = await getLatestDoc('thankyou_entries', 'createdAt');
  const ctx = {
    ...(latestEntry || {}),
    ...(data || {}),
  };

  const title = ctx.title || 'A new thank-you note';
  const description = ctx.description || 'A fresh gratitude moment was added to the tracker.';
  const entryDate = formatDate(ctx.date || ctx.createdAt);
  const shortEntryDate = formatShortDate(ctx.date || ctx.createdAt);
  const createdAt = formatDate(ctx.createdAt);
  const countAdded = Number(ctx.countAdded || 1);
  const adminEmail = ctx.adminEmail || process.env.ADMIN_EMAIL || defaultTo;
  const appName = process.env.APP_NAME || 'Thank You Tracker';
  const ctaUrl = ctx.ctaUrl || process.env.CTA_URL || '#';
  const isSpecial = Boolean(ctx.isSpecial);
  const punchline = pickPunchline(ctx);
  const recentMoment = excerpt(description);
  const jarHearts = buildJarHearts(countAdded);
  const countLabel = countAdded === 1 ? '1 thank-you' : `${countAdded} thank-yous`;

  const subject = ctx.subject || `A tiny thank-you just arrived: ${title}`;
  const html = `<!doctype html>
<html>
<body style="margin:0;background:#f7f4fb;padding:20px;font-family:Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:22px;border:1px solid #eadfff;overflow:hidden;">
  <tr>
    <td align="center" style="padding:30px;background:linear-gradient(135deg,#e6dcff,#dff2ff,#ffe6f2);">
      <div style="font-size:26px;color:#6a5acd;font-weight:bold;">
        ${esc(appName).toLowerCase()} 💌
      </div>
      <p style="margin:8px 0 0;color:#6d6d6d;font-size:14px;line-height:1.5;">
        counting all the little thanks from the best human ever - you 💜
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eddfff;border-radius:16px;">
        <tr>
          <td style="padding:20px;">
            <p style="margin:0;color:#9b8bd6;font-size:12px;">latest thank-you ✨</p>
	            <h2 style="margin:6px 0;color:#4b3f72;font-size:24px;line-height:1.25;">${esc(title)}</h2>
	            <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">
	              ${esc(description)} 💭
	            </p>
	            <div style="margin-top:12px;">
	              <span style="display:inline-block;margin:0 6px 6px 0;padding:7px 10px;border-radius:999px;background:#f3efff;color:#5c4c8a;font-size:12px;font-weight:bold;">
	                date: ${esc(shortEntryDate)}
	              </span>
	              <span style="display:inline-block;margin:0 6px 6px 0;padding:7px 10px;border-radius:999px;background:#fff0f6;color:#733b65;font-size:12px;font-weight:bold;">
	                total: ${esc(countAdded)} 💖
	              </span>
	            </div>
	          </td>
	        </tr>
	      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:0 20px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px dashed #e6cfff;border-radius:16px;">
        <tr>
          <td style="padding:15px;color:#6d5c85;font-size:14px;line-height:1.6;">
            ${isSpecial ? 'this one got the special tag, so it is sitting in the front row today...' : 'tucked in with love and care...'}<br>
            because every thank-you from you feels rare 💙<br>
            <span style="font-size:12px;color:#9a8daf;">saved on ${esc(createdAt)}</span>
          </td>

          <td width="80" align="center" style="font-size:30px;">
            🧸
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:0 20px 20px;">
      <p style="margin:0 0 10px;color:#7c6acb;font-weight:bold;">recent moment 💭</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e6ff;border-radius:14px;">
        <tr>
          <td style="padding:15px;">
            <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">
              "${esc(recentMoment)}"
            </p>
            <p style="font-size:12px;color:#999;margin:5px 0 0;">
              - ${esc(entryDate)}
            </p>
          </td>

          <td width="40" align="center">
            💖
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:0 20px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" style="padding-right:5px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff0f6;border:1px solid #ffd2ec;border-radius:14px;">
              <tr>
                <td style="padding:15px;">
                  <p style="font-size:12px;color:#b45d96;margin:0;">tiny punchline ✨</p>
                  <p style="margin:5px 0 0;color:#733b65;font-size:14px;line-height:1.55;">
                    ${esc(punchline)}
                  </p>
                </td>
              </tr>
            </table>
          </td>

          <td width="50%" style="padding-left:5px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3efff;border:1px solid #e1d9ff;border-radius:14px;text-align:center;">
              <tr>
                <td style="padding:15px;">
                  <p style="margin:0;color:#9a63b8;">🫙</p>
                  <p style="font-size:20px;margin:5px 0;">${esc(jarHearts)}</p>
                  <p style="font-size:12px;color:#777;margin:0;line-height:1.5;">
                    ${esc(countLabel)}... and many more to come
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:0 20px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px dashed #ffcce5;border-radius:14px;">
        <tr>
          <td style="padding:15px;text-align:center;">
            <p style="margin:0;color:#a66;font-size:14px;line-height:1.5;">save little moments that deserve a thank-you 💗</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td align="center" style="padding:20px;">
      <a href="${esc(ctaUrl)}" style="background:linear-gradient(135deg,#b8a8ff,#8fd3ff);color:#fff;padding:12px 26px;border-radius:25px;text-decoration:none;font-weight:bold;display:inline-block;">
        visit your little world ✨
      </a>
    </td>
  </tr>

  <tr>
    <td align="center" style="padding:15px;color:#999;font-size:12px;line-height:1.5;">
      this is just for ${esc(to || adminEmail)}. made with love, for all the thank-yous 💜
    </td>
  </tr>
</table>

</td>
</tr>
</table>

</body>
</html>`;
  return {
    subject,
    html,
    replyTo: process.env.REPLY_TO,
    from: process.env.MAIL_FROM,
    defaultTo: to || adminEmail,
  };
}

module.exports = { build, defaultTo };
