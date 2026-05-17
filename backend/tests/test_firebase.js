const admin = require('firebase-admin');
const path = require('path');

require('dotenv').config();

const absolutePath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
const serviceAccount = require(absolutePath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();
db.ref('feed').once('value')
  .then(snapshot => {
    console.log("Feed data:", snapshot.val());
    process.exit(0);
  })
  .catch(err => {
    console.error("Error reading feed:", err);
    process.exit(1);
  });
