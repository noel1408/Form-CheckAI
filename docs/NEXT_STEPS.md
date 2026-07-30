# Immediate next steps

## Step 1: Run the Python camera MVP

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python phase1_core\live_squat_check.py
```

If the camera does not open, try changing `cv2.VideoCapture(0)` to `cv2.VideoCapture(1)` in `phase1_core/live_squat_check.py`.

## Step 2: Test form rules

Try these cases:

- Standing normally
- Half squat
- Deep squat
- Leaning too far forward

Write down false alerts. Then tune `phase1_core/form_rules.py`.

## Step 3: Create Firebase project

Follow `docs/FIREBASE_SETUP.md`.

## Step 4: Test web dashboard

Replace config in `web/app.js`, then run:

```powershell
python -m http.server 8080 -d web
```

## Step 5: Build Flutter app

After Phase 1 works reliably, create the Flutter app and implement only Home, Camera, and Result screens first.
