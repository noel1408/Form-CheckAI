# Phase 1 core AI prototype

This folder contains the first MVP: local squat form checking with MediaPipe Pose, OpenCV, angle rules, and voice feedback.

## Run

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python phase1_core\live_squat_check.py
```

## Controls

- Press `q` to close the camera window.

## Notes

- Camera angle matters. For squats, place the camera side/front-side for better knee and torso angle detection.
- Thresholds in `form_rules.py` are starting values. Tune them with real test videos/users.
