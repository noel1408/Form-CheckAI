# FormCheck AI build plan

## Phase 1: Local AI MVP

Goal: prove real-time form correction works before building the full app.

1. Install Python dependencies.
2. Open camera with OpenCV.
3. Detect body landmarks with MediaPipe Pose.
4. Calculate squat knee and torso angles.
5. Show skeleton overlay.
6. Give voice feedback.
7. Create simple score out of 100.

Run:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python phase1_core\live_squat_check.py
```

Press `q` to close the camera window.

## Phase 2: Firebase shared data

Goal: same user account and workout history on mobile + web.

Use:

- Firebase Authentication for login/signup.
- Cloud Firestore for shared user/session data.
- Local SQLite or Hive on mobile for offline session storage.

## Phase 3: Flutter mobile app

Start with only three screens:

1. Home screen
2. Live camera screen
3. Session result screen

Add Firebase login only after the camera MVP works.

Recommended Flutter packages:

```yaml
firebase_core
firebase_auth
cloud_firestore
camera
sqflite
connectivity_plus
flutter_tts
```

## Phase 4: Web dashboard

Start with a simple hosted dashboard:

1. Login
2. View session history
3. View average score

Later, upgrade to React only if the simple web version becomes hard to maintain.

## Correct build order

1. Python pose detection and angles
2. Real-time voice feedback
3. Simple scoring
4. Firebase setup
5. Flutter app
6. Web dashboard
