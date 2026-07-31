import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace with your actual Firebase project config.
// Using placeholders for now as per the plan.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForNow",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "formcheckai-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "formcheckai-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "formcheckai-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
