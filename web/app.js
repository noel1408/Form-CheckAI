import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Placeholder for Render backend URL (will need to be set properly in production)
const BACKEND_URL = "http://localhost:8080/api";

const firebaseConfig = {
  apiKey: "AIzaSyBSSDbA9I5u0CIFgLIbqJwArmF4imdCjuU",
  authDomain: "formcheck-ai1.firebaseapp.com",
  projectId: "formcheck-ai1",
  storageBucket: "formcheck-ai1.firebasestorage.app",
  messagingSenderId: "121384975529",
  appId: "1:121384975529:web:e459964aae70c73f5e7db8",
  measurementId: "G-NT53XCKRHM",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authCard = document.querySelector("#auth-card");
const dashboard = document.querySelector("#dashboard");
const authMessage = document.querySelector("#auth-message");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const sessionCount = document.querySelector("#session-count");
const avgScore = document.querySelector("#avg-score");
const sessionList = document.querySelector("#session-list");

function getCredentials() {
  return {
    email: emailInput.value.trim(),
    password: passwordInput.value,
  };
}

function showError(error) {
  authMessage.textContent = error.message ?? "Something went wrong";
}

function formatExerciseName(value) {
  if (!value) return "Exercise";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function ensureUserDocument(user) {
  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      name: user.email?.split("@")[0] ?? "FormCheck User",
      fitnessGoal: "general_fitness",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

async function loadSessions(userId) {
  sessionList.innerHTML = "";

  const token = await auth.currentUser.getIdToken();
  const response = await fetch(`${BACKEND_URL}/sessions`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    console.error("Failed to load sessions from backend");
    return;
  }

  let sessions = await response.json();
  sessions = sessions.sort((a, b) => {
    // Handling Firestore timestamps returned as objects from backend
    const aTime = a.createdAt ? new Date(a.createdAt._seconds ? a.createdAt._seconds * 1000 : a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt._seconds ? b.createdAt._seconds * 1000 : b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  sessionCount.textContent = String(sessions.length);
  const average = sessions.length
    ? Math.round(
        sessions.reduce((sum, session) => sum + Number(session.score ?? 0), 0) /
          sessions.length,
      )
    : 0;
  avgScore.textContent = String(average);

  if (!sessions.length) {
    sessionList.innerHTML =
      "<li>No sessions synced yet. Complete a workout in the Android app after Firebase sync is enabled.</li>";
    return;
  }

  for (const session of sessions) {
    const createdAt = session.createdAt 
        ? new Date(session.createdAt._seconds ? session.createdAt._seconds * 1000 : session.createdAt).toLocaleString() 
        : "Unknown date";

    const issues =
      Array.isArray(session.issues) && session.issues.length
        ? session.issues.join(", ")
        : "No major issues";

    const item = document.createElement("li");
    item.innerHTML = `
      <div>
        <strong>${formatExerciseName(session.exercise)}</strong>
        <p>${createdAt}</p>
        <small>${issues}</small>
      </div>
      <strong>${session.score ?? "--"}/100</strong>
    `;
    sessionList.appendChild(item);
  }
}

document.querySelector("#login-btn").addEventListener("click", async () => {
  authMessage.textContent = "";
  const { email, password } = getCredentials();
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    showError(error);
  }
});

document.querySelector("#signup-btn").addEventListener("click", async () => {
  authMessage.textContent = "";
  const { email, password } = getCredentials();
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await ensureUserDocument(credential.user);
  } catch (error) {
    showError(error);
  }
});

document.querySelector("#logout-btn").addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authCard.classList.remove("hidden");
    dashboard.classList.add("hidden");
    return;
  }

  authCard.classList.add("hidden");
  dashboard.classList.remove("hidden");
  await ensureUserDocument(user);
  await loadSessions(user.uid);
});
