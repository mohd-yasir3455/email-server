const path = require('path');

(async () => {
  try {
    const builder = require(path.join(__dirname, '..', 'bodies', 'body1', 'add.js'));
    const result = await builder.build({ to: 'test@example.com', data: { name: 'Preview User', title: 'Preview Title' } });
    console.log('SUBJECT:\n', result.subject);
    console.log('\nHTML:\n', result.html);
  } catch (err) {
    console.error('Error previewing builder:', err);
  }
})();
