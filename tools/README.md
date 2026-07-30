# Local tools

This project uses local/non-admin tooling where possible.

## Installed and verified

- Python 3.11 virtual environment: `.venv`
- AI dependencies: OpenCV, MediaPipe, NumPy, pyttsx3
- Git: `C:\Program Files\Git\cmd\git.exe`
- JDK 17: `C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot`
- Flutter SDK: `tools/flutter`
- Android SDK: `tools/android-sdk`
- Portable Node.js: `tools/node-v24.16.0-win-x64`
- Firebase CLI: `tools/firebase-cli`

## Run the Python AI prototype

```powershell
.\.venv\Scripts\python.exe phase1_core\live_squat_check.py
```

## Flutter commands

Use this command prefix so Flutter can find Git, Java, and the local Android SDK:

```powershell
cmd /c "set JAVA_HOME=C:\Progra~1\Microsoft\jdk-17.0.19.10-hotspot&&set ANDROID_SDK_ROOT=D:\FormCheckAI\tools\android-sdk&&set PATH=D:\FormCheckAI\tools\flutter\bin;C:\Progra~1\Git\cmd;C:\Progra~1\Microsoft\jdk-17.0.19.10-hotspot\bin;D:\FormCheckAI\tools\android-sdk\cmdline-tools\latest\bin;D:\FormCheckAI\tools\android-sdk\platform-tools;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem&&tools\flutter\bin\flutter.bat doctor"
```

Create a Flutter app later:

```powershell
cmd /c "set JAVA_HOME=C:\Progra~1\Microsoft\jdk-17.0.19.10-hotspot&&set ANDROID_SDK_ROOT=D:\FormCheckAI\tools\android-sdk&&set PATH=D:\FormCheckAI\tools\flutter\bin;C:\Progra~1\Git\cmd;C:\Progra~1\Microsoft\jdk-17.0.19.10-hotspot\bin;D:\FormCheckAI\tools\android-sdk\cmdline-tools\latest\bin;D:\FormCheckAI\tools\android-sdk\platform-tools;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem&&tools\flutter\bin\flutter.bat create frontend_mobile"
```

## Firebase CLI commands

Use this command prefix so Firebase can find portable Node:

```powershell
cmd /c "set PATH=D:\FormCheckAI\tools\node-v24.16.0-win-x64;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0&&tools\firebase-cli\node_modules\.bin\firebase.cmd --version"
```

Login:

```powershell
cmd /c "set PATH=D:\FormCheckAI\tools\node-v24.16.0-win-x64;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0&&tools\firebase-cli\node_modules\.bin\firebase.cmd login"
```

Deploy hosting and Firestore rules after Firebase project setup:

```powershell
cmd /c "set PATH=D:\FormCheckAI\tools\node-v24.16.0-win-x64;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0&&tools\firebase-cli\node_modules\.bin\firebase.cmd deploy"
```

## Current Flutter doctor status

Android and web development are ready. The only remaining doctor warning is Visual Studio for Windows desktop apps, which is not required for this project unless you later decide to build a Windows desktop app.
