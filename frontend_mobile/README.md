# FormCheck AI Mobile

Android-only Flutter mobile app scaffold for FormCheck AI.

## Scope

This app targets Android only for v1.

Removed Flutter targets:

- iOS
- Flutter web
- Windows
- macOS
- Linux

The hosted website is separate and lives in the root `web/` directory. It uses Firebase Hosting + Firebase Web SDK.

## Current screens

- Home screen
- Live camera screen
- Session result screen

## Current behavior

- Opens Android camera preview.
- Shows a temporary skeleton guide overlay.
- Simulates live form feedback and score.
- Saves session locally with SQLite.
- Includes Firebase sync service placeholder for later Firebase config/login.

## Run on Android

From the project root:

```powershell
cmd /c "set JAVA_HOME=C:\Progra~1\Microsoft\jdk-17.0.19.10-hotspot&&set ANDROID_SDK_ROOT=D:\FormCheckAI\tools\android-sdk&&set PATH=D:\FormCheckAI\tools\flutter\bin;C:\Progra~1\Git\cmd;C:\Progra~1\Microsoft\jdk-17.0.19.10-hotspot\bin;D:\FormCheckAI\tools\android-sdk\cmdline-tools\latest\bin;D:\FormCheckAI\tools\android-sdk\platform-tools;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem&&tools\flutter\bin\flutter.bat run -d android"
```

If using a physical phone, enable Developer Options and USB debugging.

## Next mobile step

Replace the temporary demo feedback logic in `lib/features/live_camera/live_camera_screen.dart` with real on-device pose detection.
