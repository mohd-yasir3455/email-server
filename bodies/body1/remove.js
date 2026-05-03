// Builder for 'remove entry' events — builds email using provided `data` (no Firebase)
async function build({ to, data = {} } = {}) {
  const ctx = Object.assign({
    name: data.name || 'User',
    title: data.title || 'Removed entry',
  }, data || {});

  const subject = `Entry removed: ${ctx.title}`;
  const html = `
    <p>Hello,</p>
    <p>The entry <strong>${ctx.title}</strong> was removed.</p>
    <pre>${JSON.stringify(ctx, null, 2)}</pre>
  `;

  return { subject, html, replyTo: process.env.REPLY_TO, from: process.env.MAIL_FROM, defaultTo: to };
}

module.exports = { build };
