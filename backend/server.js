const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (Assuming we pass credentials via env var in production)
// Locally, you'd provide a serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS
// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized with local serviceAccountKey.json');
  } catch (error) {
    console.log('No FIREBASE_SERVICE_ACCOUNT env var or serviceAccountKey.json found. Falling back to default credentials.');
    admin.initializeApp();
  }
}

const db = admin.firestore();

// Middleware to verify Firebase Auth Token
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).send('Unauthorized: Invalid token');
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('FormCheck AI Backend API is running');
});

// Get user's sessions
app.get('/api/sessions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('sessions')
                             .where('userId', '==', userId)
                             .orderBy('createdAt', 'desc')
                             .get();
    
    const sessions = [];
    snapshot.forEach(doc => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Add a new session
app.post('/api/sessions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const sessionData = {
      ...req.body,
      userId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('sessions').add(sessionData);
    res.status(201).json({ id: docRef.id, ...sessionData });
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get User Profile
app.get('/api/users/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const docRef = db.collection('users').doc(userId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // If no profile exists yet, create a default one
      const defaultProfile = {
        name: req.user.name || req.user.email?.split('@')[0] || 'User',
        email: req.user.email,
        fitnessGoal: 'general_fitness',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await docRef.set(defaultProfile);
      return res.json(defaultProfile);
    }
    
    res.json(docSnap.data());
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Update User Profile
app.put('/api/users/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, fitnessGoal, weight, progress } = req.body;
    
    const docRef = db.collection('users').doc(userId);
    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    if (name) updates.name = name;
    if (fitnessGoal) updates.fitnessGoal = fitnessGoal;
    if (weight) updates.weight = weight;
    if (progress !== undefined) updates.progress = progress;
    
    await docRef.set(updates, { merge: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
