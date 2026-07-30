# Shared data model

## Firestore

### `users/{uid}`

```json
{
  "name": "Aarav",
  "email": "aarav@example.com",
  "fitnessGoal": "muscle_gain",
  "createdAt": "serverTimestamp"
}
```

### `sessions/{sessionId}`

```json
{
  "userId": "firebase-auth-uid",
  "exercise": "squat",
  "score": 82,
  "durationSeconds": 60,
  "issues": ["Go lower", "Keep your chest up"],
  "createdAt": "serverTimestamp"
}
```

## Why this works

- Mobile writes sessions to Firestore after local save.
- Web queries `sessions` where `userId == currentUser.uid`.
- Security rules ensure users can only read/write their own data.
