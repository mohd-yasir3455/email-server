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

 const subject = `gentle reminder for your upcoming days 🩵`;

const html = `<!doctype html>
<html>
<body style="margin:0;background:#eef7ff;padding:20px;font-family:Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:24px;border:1px solid #d8ebff;overflow:hidden;">

  <tr>
    <td align="center" style="padding:32px;background:linear-gradient(135deg,#dff2ff,#d9e8ff,#eef7ff);">
      <div style="font-size:28px;font-weight:bold;color:#4d78c9;">
        tiny care package 🩵
      </div>

      <p style="margin:10px 0 0;color:#5f6f8f;font-size:14px;line-height:1.6;">
        just a soft little reminder from someone who cares about you a lot ✨
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:24px;">

      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dcecff;border-radius:18px;background:#f8fbff;">
        <tr>
          <td style="padding:22px;">

            <p style="margin:0;color:#7fa3d8;font-size:12px;font-weight:bold;">
              upcoming reminder 🌙
            </p>

            <h2 style="margin:8px 0;color:#35518d;font-size:26px;line-height:1.3;">
              hey sleepy human,
            </h2>

            <p style="margin:0;color:#5b6780;font-size:15px;line-height:1.8;">
              your upcoming days might be a little extra tiring soon, so this is your gentle reminder to take care of yourself properly 🩵
              <br><br>
              drink enough water, eat warm food, rest whenever you can and please don’t ignore cramps like the brave warrior you pretend to be 😤✨
            </p>

          </td>
        </tr>
      </table>

    </td>
  </tr>

  <tr>
    <td style="padding:0 24px 20px;">

      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px dashed #cfe4ff;border-radius:18px;background:#fbfdff;">
        <tr>

          <td style="padding:18px;">

            <p style="margin:0;color:#4f6da8;font-size:14px;line-height:1.7;">
              emergency comfort checklist 🧸
            </p>

            <div style="margin-top:10px;color:#68758f;font-size:14px;line-height:1.9;">
              ☁️ water bottle nearby<br>
              ☁️ snacks stocked up<br>
              ☁️ don’t skip meals<br>
              ☁️ rest when needed<br>
              ☁️ one emotionally supportive idiot always available 💙
            </div>

          </td>

        </tr>
      </table>

    </td>
  </tr>

  <tr>
    <td style="padding:0 24px 20px;">

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>

          <td width="50%" style="padding-right:6px;">

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#edf6ff;border:1px solid #d9eaff;border-radius:16px;">
              <tr>
                <td style="padding:18px;">

                  <p style="margin:0;color:#5e8fd1;font-size:12px;">
                    tiny note 💭
                  </p>

                  <p style="margin:8px 0 0;color:#546176;font-size:14px;line-height:1.7;">
                    even on difficult days, please remember you deserve softness, rest and care too.
                  </p>

                </td>
              </tr>
            </table>

          </td>

          <td width="50%" style="padding-left:6px;">

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6fbff;border:1px solid #dcecff;border-radius:16px;text-align:center;">
              <tr>
                <td style="padding:18px;">

                  <div style="font-size:26px;">
                    🩵 🌧️ ☕
                  </div>

                  <p style="margin:10px 0 0;color:#6d7991;font-size:13px;line-height:1.6;">
                    sending virtual warm hugs and chai energy
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
    <td align="center" style="padding:10px 24px 28px;">

      <a href="#"
        style="background:linear-gradient(135deg,#89c8ff,#7da8ff);color:white;text-decoration:none;padding:13px 28px;border-radius:999px;font-weight:bold;display:inline-block;">
        reminder to be kind to yourself ✨
      </a>

    </td>
  </tr>

  <tr>
    <td align="center" style="padding:0 24px 24px;color:#92a0b8;font-size:12px;line-height:1.7;">
      sent with softness, concern and slightly overprotective energy 💙
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
