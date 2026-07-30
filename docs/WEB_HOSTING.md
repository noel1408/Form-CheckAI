# Web hosting

The web dashboard is a static Firebase Hosting app located at `web/`.

## Firebase project

```text
Project ID: formcheck-ai1
Hosting URL: https://formcheck-ai1.web.app
```

The project root contains:

- `.firebaserc`
- `firebase.json`
- `firebase/firestore.rules`
- `web/index.html`
- `web/app.js`
- `web/styles.css`

## Firebase CLI

A local Firebase CLI is already installed in `tools/firebase-cli`, so you do not need `npm install -g firebase-tools`.

Check version:

```powershell
cmd /c "set PATH=D:\FormCheckAI\tools\node-v24.16.0-win-x64;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0&&tools\firebase-cli\node_modules\.bin\firebase.cmd --version"
```

## Login

```powershell
cmd /c "set PATH=D:\FormCheckAI\tools\node-v24.16.0-win-x64;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0&&tools\firebase-cli\node_modules\.bin\firebase.cmd login"
```

## Deploy

```powershell
cmd /c "set PATH=D:\FormCheckAI\tools\node-v24.16.0-win-x64;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0&&tools\firebase-cli\node_modules\.bin\firebase.cmd deploy"
```

## Local test

```powershell
.\.venv\Scripts\python.exe -m http.server 8080 -d web
```

Open `http://localhost:8080`.
