# Simple Email Server

Minimal modular email server that reads Gmail creds from env and uses per-app body builders.

Files created:
- `app.js` — Express server with POST `/send`.
- `mailer.js` — Nodemailer Gmail transport (reads `GMAIL_USER` and `GMAIL_PASSWORD`).
- `lib/firebaseClient.js` — Firebase Admin SDK helper for Firestore reads.
- `bodies/<app>/index.js` — example body builder (`build({to,data})` returns `{subject,html}`).
- `.env.example` — example env variables.

Usage
1. Install deps:
```bash
npm install
```
2. Create `.env` from `.env.example` and set `GMAIL_USER` and `GMAIL_PASSWORD` (use an app password).
3. Start:
```bash
npm start
```
4. Send email:
```bash
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"app":"body1","to":"recipient@example.com","data":{"name":"Yasir","ctaUrl":"https://example.com/welcome"}}'
```

Notes
- Add new apps by creating `bodies/<app>/index.js` and optional `template.hbs`.
- For production on Render: set env vars in the dashboard and use the `start` script. Consider using a transactional provider (SendGrid/Mailgun/SES) for deliverability.

## Firebase

This server uses `firebase-admin`, so it needs server-side credentials. The public Firebase web config values like `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID` are not enough for Admin SDK access.

1. In Firebase Console, open Project settings > Service accounts.
2. Click Generate new private key and download the JSON file.
3. Configure one of these env options:

```bash
# Option A: JSON string
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'

# Option B: base64-encoded JSON
FIREBASE_SERVICE_ACCOUNT_BASE64=base64-encoded-json

# Option C: individual env vars (recommended on Render)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Option D: local file path
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey.json

# Option E: Google credentials path
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/serviceAccountKey.json
```

For Render production deployments, use `FIREBASE_SERVICE_ACCOUNT_JSON` or
`FIREBASE_SERVICE_ACCOUNT_BASE64`, or the split env vars
`FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` + `FIREBASE_PROJECT_ID`.
Do not use a local machine path such as `/home/yasir/firebase-sa.json`,
because that file does not exist inside Render.

Optional project metadata:

```bash
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-project-id.firebasestorage.app
```

Check the connection:

```bash
curl http://localhost:3000/firebase/status
```

Read Firestore:

```bash
curl http://localhost:3000/firebase/collections
curl http://localhost:3000/firebase/users
curl http://localhost:3000/firebase/users/user-document-id
```
