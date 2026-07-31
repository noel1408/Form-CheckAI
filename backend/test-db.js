const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testConnection() {
  try {
    console.log('Testing Firestore connection...');
    const collections = await db.listCollections();
    console.log('Successfully connected to Firestore!');
    console.log('Available collections:');
    if (collections.length === 0) {
      console.log(' - (No collections found yet, database is empty)');
    } else {
      collections.forEach(collection => {
        console.log(` - ${collection.id}`);
      });
    }
  } catch (error) {
    console.error('Failed to connect to Firestore:', error);
  } finally {
    process.exit(0);
  }
}

testConnection();
