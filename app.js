require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const { sendMail } = require('./mailer');
const firebase = require('./lib/firebaseClient');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Firebase helpers (require service account env or ADC).
app.get('/firebase/status', async (req, res) => {
  try {
    const initialized = await firebase.init();

    if (!initialized) {
      return res.status(400).json({
        configured: false,
        message: 'Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_BASE64, or GOOGLE_APPLICATION_CREDENTIALS.',
      });
    }

    return res.json({
      configured: true,
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || null,
    });
  } catch (err) {
    console.error('Firebase status error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ configured: false, error: err.message });
  }
});

app.get('/firebase/collections', async (req, res) => {
  try {
    const collections = await firebase.getCollections();
    return res.json({ success: true, collections });
  } catch (err) {
    const status = err.code === 'FIREBASE_NOT_CONFIGURED' ? 400 : 500;
    return res.status(status).json({ success: false, error: err.message });
  }
});

app.get('/firebase/:collection', async (req, res) => {
  try {
    const docs = await firebase.getCollectionDocs(req.params.collection, req.query.limit);
    return res.json({ success: true, docs });
  } catch (err) {
    const status = err.code === 'FIREBASE_NOT_CONFIGURED' ? 400 : 500;
    return res.status(status).json({ success: false, error: err.message });
  }
});

app.get('/firebase/:collection/:docId', async (req, res) => {
  try {
    const doc = await firebase.getDoc(req.params.collection, req.params.docId);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    return res.json({ success: true, doc });
  } catch (err) {
    const status = err.code === 'FIREBASE_NOT_CONFIGURED' ? 400 : 500;
    return res.status(status).json({ success: false, error: err.message });
  }
});

/**
 * POST /send
 * body: { app: 'body1', to: 'user@example.com', data: {...} }
 * - `app` selects a builder module under `./bodies/<app>/index.js`.
 * - `to` overrides default recipient (optional).
 */
app.post('/send', async (req, res) => {
  try {
    const { app: appName, to: overrideTo, data = {} } = req.body || {};

    const chosen = appName || process.env.DEFAULT_APP || 'body1';

    // dynamic load the builder module; support event-specific builders
    // look for event in several places: top-level, query, or inside data
    const event = (req.body.event || req.query.event || (data && data.event) || 'index').toString();
    const eventPath = path.join(__dirname, 'bodies', chosen, `${event}.js`);
    const indexPath = path.join(__dirname, 'bodies', chosen, 'index.js');

    let builderPath;
    if (fs.existsSync(eventPath)) builderPath = eventPath;
    else if (fs.existsSync(indexPath)) builderPath = indexPath;
    else return res.status(404).json({ success: false, message: `Builder '${chosen}' not found` });
    console.log('Using builder:', builderPath);

    const builder = require(builderPath);
    if (typeof builder.build !== 'function') {
      return res.status(500).json({ success: false, message: 'Invalid builder (no build function)' });
    }

    const buildInput = { to: overrideTo, data };
    const { subject, html, replyTo, from, defaultTo: builtDefaultTo } = await builder.build(buildInput);

    if (!subject || !html) return res.status(500).json({ success: false, message: 'Builder did not return subject/html' });

    const info = await sendMail({ from, to: overrideTo || builtDefaultTo || builder.defaultTo || process.env.ADMIN_EMAIL, subject, html, replyTo });

    return res.json({ success: true, messageId: info.messageId, accepted: info.accepted, response: info.response });
  } catch (err) {
    console.error('Send error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: 'Send failed', error: err && err.message ? err.message : String(err) });
  }
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
