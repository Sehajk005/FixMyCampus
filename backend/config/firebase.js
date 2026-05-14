const admin = require('firebase-admin');

let db = null;

try {
  const path = require('path');

  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64) {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const resolvedPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    serviceAccount = require(resolvedPath);
    console.log('🔥 Firebase admin service account loaded from path: ' + resolvedPath);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const resolvedPath = path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
    serviceAccount = require(resolvedPath);
    console.log('🔥 Firebase admin service account loaded from GOOGLE_APPLICATION_CREDENTIALS: ' + resolvedPath);
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    db = admin.database();
    console.log('🔥 Firebase admin initialized');
  } else {
    console.warn('⚠️  Firebase admin not initialized: no service account credentials provided');
  }
} catch (error) {
  console.error('❌ Firebase init error:', error);
}

module.exports = { admin, db };
