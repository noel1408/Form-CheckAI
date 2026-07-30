# FormCheck AI Web Dashboard

Static Firebase Hosting dashboard for FormCheck AI.

## Scope

This is the hosted web app. It is separate from the Android Flutter mobile app in `frontend_mobile/`.

## Features

- Firebase Email/Password signup and login
- User document creation in Firestore
- Session history from Firestore
- Total session count
- Average score

## Firebase project

```text
Project ID: formcheck-ai1
Hosting URL: https://formcheck-ai1.web.app
```

## Local test

From the project root:

```powershell
.\.venv\Scripts\python.exe -m http.server 8080 -d web
```

Open:

```text
http://localhost:8080
```

## Deploy

This project uses the local Firebase CLI installed in `tools/firebase-cli`.

Login:

```powershell
cmd /c "set PATH=D:\FormCheckAI\tools\node-v24.16.0-win-x64;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0&&tools\firebase-cli\node_modules\.bin\firebase.cmd login"
```

Deploy Hosting + Firestore rules:

```powershell
cmd /c "set PATH=D:\FormCheckAI\tools\node-v24.16.0-win-x64;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0&&tools\firebase-cli\node_modules\.bin\firebase.cmd deploy"
```
