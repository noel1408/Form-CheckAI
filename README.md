# FormCheck AI

FormCheck AI is a beginner-friendly exercise form checker focused on real-time posture feedback using a normal camera.

## Recommended v1 architecture

```text
Mobile app: Flutter
- Camera + pose detection
- Offline workout session storage
- Sync sessions to Firebase when online

Web app: HTML/JS first, React later if needed
- Firebase login
- Session history
- Progress dashboard

Firebase
- Authentication
- Cloud Firestore shared data
```

Firebase is recommended because the same user account and session history can be shared between mobile and web without building custom auth, APIs, or server hosting in v1.

## Current scaffold

```text
phase1_core/          Python local AI prototype
web/                  Simple Firebase web dashboard
firebase/             Firestore security rules
docs/                 Setup and build plan
requirements.txt      Python dependencies
```

## Start here: Phase 1 local AI

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python phase1_core\live_squat_check.py
```

The camera window shows pose skeleton, live feedback, and a score. Press `q` to quit.

## Firebase setup

See `docs/FIREBASE_SETUP.md`.

## Build order

1. Make squat detection reliable locally.
2. Add simple session result saving.
3. Create Firebase project and Firestore collections.
4. Build Flutter mobile screens: Home, Camera, Result.
5. Sync mobile sessions to Firebase.
6. Host the web dashboard and read synced sessions.

Avoid Random Forest, KNN, custom Flask auth, and complex web/mobile features until the core camera feedback is working well.
