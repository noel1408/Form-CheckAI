const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function runTest() {
  const db = admin.firestore();
  const snapshot = await db.collection('users').get();
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
  process.exit(0);
}
runTest();
