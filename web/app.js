import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Firebase Config
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

// Update this in production
const BACKEND_URL = "http://localhost:8080/api";

// DOM Elements
const navbar = document.querySelector("#navbar");
const navDashboard = document.querySelector("#nav-dashboard");
const navProfile = document.querySelector("#nav-profile");

const views = {
  auth: document.querySelector("#auth-view"),
  dashboard: document.querySelector("#dashboard-view"),
  profile: document.querySelector("#profile-view"),
};

// Auth forms
const loginForm = document.querySelector("#login-form");
const signupForm = document.querySelector("#signup-form");
const forgotPwForm = document.querySelector("#forgot-pw-form");

// Messages
function showMessage(el, text, isError = true) {
  el.textContent = text;
  el.className = `message ${isError ? 'error' : 'success'}`;
}

function clearMessages() {
  document.querySelectorAll(".message").forEach(el => el.textContent = "");
}

// Navigation Logic
function switchView(viewName) {
  Object.values(views).forEach(v => v.classList.add("hidden"));
  views[viewName].classList.remove("hidden");
  
  if (viewName === 'auth') {
    navbar.classList.add("hidden");
  } else {
    navbar.classList.remove("hidden");
    navDashboard.classList.toggle("active", viewName === 'dashboard');
    navProfile.classList.toggle("active", viewName === 'profile');
  }
}

function switchAuthForm(formToShow) {
  clearMessages();
  loginForm.classList.add("hidden");
  signupForm.classList.add("hidden");
  forgotPwForm.classList.add("hidden");
  formToShow.classList.remove("hidden");
}

// Auth Event Listeners
document.querySelector("#show-signup").addEventListener("click", () => switchAuthForm(signupForm));
document.querySelector("#show-login").addEventListener("click", () => switchAuthForm(loginForm));
document.querySelector("#show-forgot-pw").addEventListener("click", () => switchAuthForm(forgotPwForm));
document.querySelector("#show-login-from-reset").addEventListener("click", () => switchAuthForm(loginForm));

// Login
document.querySelector("#login-btn").addEventListener("click", async () => {
  const email = document.querySelector("#login-email").value.trim();
  const password = document.querySelector("#login-password").value;
  const msgEl = document.querySelector("#login-message");
  clearMessages();

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    showMessage(msgEl, error.message);
  }
});

// Signup
document.querySelector("#signup-btn").addEventListener("click", async () => {
  const email = document.querySelector("#signup-email").value.trim();
  const password = document.querySelector("#signup-password").value;
  const msgEl = document.querySelector("#signup-message");
  clearMessages();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    // After successful signup, user is automatically logged in by Firebase.
    // The onAuthStateChanged listener handles routing and profile creation.
  } catch (error) {
    showMessage(msgEl, error.message);
  }
});

// Google Login
const handleGoogleLogin = async (msgEl) => {
  clearMessages();
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (error) {
    showMessage(msgEl, error.message);
  }
};

document.querySelector("#google-login-btn").addEventListener("click", () => {
  handleGoogleLogin(document.querySelector("#login-message"));
});

document.querySelector("#google-signup-btn").addEventListener("click", () => {
  handleGoogleLogin(document.querySelector("#signup-message"));
});

// Forgot Password
document.querySelector("#reset-btn").addEventListener("click", async () => {
  const email = document.querySelector("#reset-email").value.trim();
  const msgEl = document.querySelector("#reset-message");
  clearMessages();

  if (!email) {
    return showMessage(msgEl, "Please enter your email.");
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showMessage(msgEl, "Password reset link sent! Check your email.", false);
  } catch (error) {
    showMessage(msgEl, error.message);
  }
});

// Logout
document.querySelector("#logout-btn").addEventListener("click", () => {
  signOut(auth);
});

// Navbar Navigation
navDashboard.addEventListener("click", (e) => {
  e.preventDefault();
  switchView('dashboard');
  loadSessions();
});

navProfile.addEventListener("click", (e) => {
  e.preventDefault();
  switchView('profile');
  loadProfile();
});

// Data Fetching
async function loadSessions() {
  const sessionList = document.querySelector("#session-list");
  const spinner = document.querySelector("#sessions-loading");
  
  sessionList.innerHTML = "";
  sessionList.appendChild(spinner);
  spinner.classList.remove("hidden");

  try {
    const token = await auth.currentUser.getIdToken();
    const response = await fetch(`${BACKEND_URL}/sessions`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Failed to load sessions");
    
    let sessions = await response.json();
    spinner.classList.add("hidden");

    sessions = sessions.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt._seconds ? a.createdAt._seconds * 1000 : a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt._seconds ? b.createdAt._seconds * 1000 : b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    document.querySelector("#session-count").textContent = String(sessions.length);
    const average = sessions.length
      ? Math.round(sessions.reduce((sum, s) => sum + Number(s.score ?? 0), 0) / sessions.length)
      : 0;
    document.querySelector("#avg-score").textContent = String(average);

    if (!sessions.length) {
      sessionList.innerHTML = "<p style='color: var(--text-muted); text-align: center; padding: 20px;'>No sessions synced yet. Complete a workout in the app.</p>";
      return;
    }

    sessions.forEach((session, i) => {
      const createdAt = session.createdAt 
        ? new Date(session.createdAt._seconds ? session.createdAt._seconds * 1000 : session.createdAt).toLocaleString() 
        : "Unknown date";
      
      const exercise = String(session.exercise || "Exercise").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      const issues = Array.isArray(session.issues) && session.issues.length ? session.issues.join(", ") : "Perfect form";

      const item = document.createElement("li");
      item.style.animationDelay = `${i * 0.05}s`;
      item.innerHTML = `
        <div>
          <strong>${exercise}</strong>
          <p>${createdAt}</p>
          <small>${issues}</small>
        </div>
        <div class="score-badge">${session.score ?? "--"}/100</div>
      `;
      sessionList.appendChild(item);
    });
  } catch (error) {
    spinner.classList.add("hidden");
    console.error(error);
  }
}

async function loadProfile() {
  try {
    const token = await auth.currentUser.getIdToken();
    const response = await fetch(`${BACKEND_URL}/users/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) {
      const profile = await response.json();
      document.querySelector("#profile-name").value = profile.name || "";
      document.querySelector("#profile-email").value = profile.email || auth.currentUser.email;
      document.querySelector("#profile-goal").value = profile.fitnessGoal || "general_fitness";
    }
  } catch (error) {
    console.error("Error loading profile", error);
  }
}

document.querySelector("#save-profile-btn").addEventListener("click", async () => {
  const name = document.querySelector("#profile-name").value.trim();
  const fitnessGoal = document.querySelector("#profile-goal").value;
  const msgEl = document.querySelector("#profile-message");
  clearMessages();

  try {
    const token = await auth.currentUser.getIdToken();
    const response = await fetch(`${BACKEND_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, fitnessGoal })
    });

    if (!response.ok) throw new Error("Failed to save profile");
    
    showMessage(msgEl, "Profile updated successfully!", false);
  } catch (error) {
    showMessage(msgEl, error.message);
  }
});

// Auth State Observer
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    switchView('auth');
    switchAuthForm(loginForm);
  } else {
    // Check if on auth view, if so redirect to dashboard
    if (!views.auth.classList.contains("hidden")) {
      switchView('dashboard');
      loadSessions();
    }
    // Ensure profile is loaded at least once to create default doc
    loadProfile();
  }
});
