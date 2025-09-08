const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const saFromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS || '../serviceAccount.json';
const saPath = path.resolve(__dirname, saFromEnv);
const dbUrl = process.env.FIREBASE_DB_URL;

console.log('GOOGLE_APPLICATION_CREDENTIALS =', saFromEnv);
console.log('Resolved SA path            =', saPath);
console.log('Exists?                     =', fs.existsSync(saPath));
console.log('FIREBASE_DB_URL             =', dbUrl);

if (!fs.existsSync(saPath)) {
  console.error('❌ Service account file not found. תקני את הנתיב ב-apps/api/.env.local');
  process.exit(1);
}

const serviceAccount = require(saPath);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: dbUrl,
  });
}

const token = process.env.IDTOKEN;
if (!token) {
  console.error('❌ Missing IDTOKEN env. הריצי עם: IDTOKEN="...jwt..." node apps/api/debug-firebase.js');
  process.exit(1);
}

(async () => {
  try {
    const decoded = await admin.auth().verifyIdToken(token, true);
    console.log('✅ verifyIdToken OK for uid:', decoded.uid, 'project:', decoded.aud);
    const cookie = await admin.auth().createSessionCookie(token, { expiresIn: 14*24*60*60*1000 });
    console.log('✅ createSessionCookie OK (length:', cookie.length, ')');
    process.exit(0);
  } catch (e) {
    console.error('🔥 Firebase Admin error:', e.message || e);
    process.exit(2);
  }
})();
