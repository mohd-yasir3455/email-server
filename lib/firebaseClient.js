const admin = require('firebase-admin');

let app;
let db;

function parseServiceAccount(rawJson) {
  try {
    const parsed = JSON.parse(rawJson);

    if (parsed.private_key && parsed.private_key.includes('\\n')) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }

    return parsed;
  } catch (err) {
    throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_JSON: ${err.message}`);
  }
}

function buildCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return admin.credential.cert(parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    return admin.credential.cert(parseServiceAccount(decoded));
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault();
  }

  return null;
}

async function init() {
  if (db) return { app, db };

  if (admin.apps.length) {
    app = admin.app();
    db = admin.firestore();
    return { app, db };
  }

  const credential = buildCredential();
  if (!credential) {
    return null;
  }

  app = admin.initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  });
  db = admin.firestore();

  return { app, db };
}

async function requireDb() {
  const initialized = await init();

  if (!initialized) {
    const error = new Error(
      'Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_BASE64, or GOOGLE_APPLICATION_CREDENTIALS.'
    );
    error.code = 'FIREBASE_NOT_CONFIGURED';
    throw error;
  }

  return initialized.db;
}

async function getDoc(collectionName, docId) {
  const firestore = await requireDb();
  const snap = await firestore.collection(collectionName).doc(docId).get();

  if (!snap.exists) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

async function getCollections() {
  const firestore = await requireDb();
  const collections = await firestore.listCollections();

  return collections.map((collection) => collection.id);
}

async function getCollectionDocs(collectionName, limit = 25) {
  const firestore = await requireDb();
  const cappedLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const snap = await firestore.collection(collectionName).limit(cappedLimit).get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getLatestDoc(collectionName, orderBy = 'createdAt') {
  const firestore = await requireDb();
  const snap = await firestore.collection(collectionName).orderBy(orderBy, 'desc').limit(1).get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  };
}

module.exports = { init, getDoc, getCollections, getCollectionDocs, getLatestDoc };
