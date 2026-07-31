# Implementation Plan - Android Build Stabilization and Core AI Integration

Stabilize the native Android build system and implement the core CameraX + ML Kit Pose Detection functionality for squat form checking.

## User Review Required

> [!IMPORTANT]
> I am downgrading the Android Gradle Plugin (AGP), Gradle, and SDK versions to stable releases (8.5.0, 8.9, and API 35 respectively). The current versions (AGP 9.0.1, API 36) are unstable/futuristic and causing build failures in the current environment.

> [!WARNING]
> Camera and Internet permissions will be added to the manifest. The app will require Camera permission at runtime to function.

## Proposed Changes

### Build Stabilization

#### [MODIFY] [libs.versions.toml](file:///D:/FormCheckAI/frontend_native/gradle/libs.versions.toml)
- Downgrade `androidGradlePlugin` to `8.5.0`.
- Downgrade `kotlin` to `2.0.21`.
- Downgrade `mlkitPose` to `18.0.0` (stable).
- Downgrade `camerax` to `1.3.4`.

#### [MODIFY] [gradle-wrapper.properties](file:///D:/FormCheckAI/frontend_native/gradle/wrapper/gradle-wrapper.properties)
- Downgrade `distributionUrl` to Gradle `8.9`.

#### [MODIFY] [build.gradle.kts](file:///D:/FormCheckAI/frontend_native/app/build.gradle.kts)
- Set `compileSdk` and `targetSdk` to `35`.
- Remove `alias(libs.plugins.compose.compiler)` as it is now integrated into the Kotlin plugin for Kotlin 2.0+.

---

### Permissions & Manifest

#### [MODIFY] [AndroidManifest.xml](file:///D:/FormCheckAI/frontend_native/app/src/main/AndroidManifest.xml)
- Add `<uses-permission android:name="android.permission.CAMERA" />`.
- Add `<uses-permission android:name="android.permission.INTERNET" />`.
- Add `<uses-feature android:name="android.hardware.camera" />`.

---

### Core AI & Camera Infrastructure

#### [NEW] [PoseDetector.kt](file:///D:/FormCheckAI/frontend_native/app/src/main/java/com/simats/formcheck/data/PoseDetector.kt)
- Wrapper for ML Kit Pose Detection.
- Handles image processing and landmark extraction.

#### [NEW] [FormAnalyzer.kt](file:///D:/FormCheckAI/frontend_native/app/src/main/java/com/simats/formcheck/data/FormAnalyzer.kt)
- Logic for calculating joint angles and assessing squat form (ported from `phase1_core/form_rules.py`).

#### [NEW] [CameraPreview.kt](file:///D:/FormCheckAI/frontend_native/app/src/main/java/com/simats/formcheck/ui/camera/CameraPreview.kt)
- Composable wrapper for CameraX `PreviewView`.
- Sets up `ImageAnalysis` pipeline to feed frames to `PoseDetector`.

---

### UI Integration

#### [MODIFY] [CameraScreen.kt](file:///D:/FormCheckAI/frontend_native/app/src/main/java/com/simats/formcheck/ui/camera/CameraScreen.kt)
- Integrate `CameraPreview`.
- Add a custom `Canvas` overlay to draw pose landmarks (skeleton) and feedback text.
- Connect real-time feedback from `FormAnalyzer` to the score badge.

## Verification Plan

### Automated Tests
- Run `./gradlew :app:assembleDebug` to verify build success.
- Unit tests for `FormAnalyzer` angle calculations.

### Manual Verification
- Deploy to an Android device/emulator (with camera support).
- Verify Camera Preview is visible.
- Verify Pose Landmarks are drawn over the user.
- Verify Squat feedback (e.g., "Go lower") appears correctly during exercise.
