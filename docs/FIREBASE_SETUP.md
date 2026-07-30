# Firebase setup for FormCheck AI

Firebase is used for shared mobile + web data.

## Current Firebase project

```text
Project ID: formcheck-ai1
Auth domain: formcheck-ai1.firebaseapp.com
Hosting URL: https://formcheck-ai1.web.app
```

## Enabled services needed

In Firebase Console, make sure these are enabled:

1. **Authentication → Sign-in method → Email/Password**
2. **Firestore Database**
3. **Firebase Hosting**

## Firestore collections

```text
users/{uid}
  name: string
  email: string
  fitnessGoal: string
  updatedAt: timestamp

sessions/{sessionId}
  userId: string
  exercise: "squat" | "pushup" | "plank"
  score: number
  durationSeconds: number
  issues: string[]
  createdAt: timestamp
```

## Security rules

Rules are stored in:

```text
firebase/firestore.rules
```

They allow users to read/write only their own user document and sessions.

## Deploy from this project

A local Firebase CLI is already installed. You do not need global `npm install -g firebase-tools`.

Login:

```powershell
cmd /c "set PATH=D:\FormCheckAI\tools\node-v24.16.0-win-x64;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0&&tools\firebase-cli\node_modules\.bin\firebase.cmd login"
```

Deploy:

```powershell
cmd /c "set PATH=D:\FormCheckAI\tools\node-v24.16.0-win-x64;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0&&tools\firebase-cli\node_modules\.bin\firebase.cmd deploy"
```

## Offline strategy

- Android saves sessions locally first.
- When Firebase login/sync is enabled in mobile, Android pushes sessions to Firestore.
- Web dashboard reads Firestore directly.
