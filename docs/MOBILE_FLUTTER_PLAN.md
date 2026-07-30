# Flutter mobile app plan

Do not build all 25 screens first. Start with a tiny working mobile app.

## Minimum screens

1. `HomeScreen`
   - Exercise cards: Squat, Push-up, Plank
   - Start button

2. `LiveCameraScreen`
   - Camera preview
   - Skeleton overlay
   - Current feedback text
   - Score badge

3. `SessionResultScreen`
   - Final score
   - Issues detected
   - Save locally
   - Sync status

## Suggested packages

```yaml
dependencies:
  firebase_core: latest
  firebase_auth: latest
  cloud_firestore: latest
  camera: latest
  sqflite: latest
  path: latest
  connectivity_plus: latest
  flutter_tts: latest
```

## Local-first session flow

1. User completes workout.
2. App writes session to local SQLite with `synced = 0`.
3. If internet is available, upload to Firestore.
4. After upload succeeds, mark local row as `synced = 1`.
5. Web dashboard reads from Firestore.

## Local SQLite session table

```sql
CREATE TABLE sessions (
  local_id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_id TEXT,
  user_id TEXT NOT NULL,
  exercise TEXT NOT NULL,
  score INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  issues TEXT NOT NULL,
  created_at TEXT NOT NULL,
  synced INTEGER NOT NULL DEFAULT 0
);
```
