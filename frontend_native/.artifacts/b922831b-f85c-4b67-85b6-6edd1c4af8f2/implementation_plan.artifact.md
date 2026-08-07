# Fix Dependency Resolution Error for androidx.lifecycle:lifecycle-viewmodel-navigation3

The project is currently attempting to use version `2.8.7` for `androidx.lifecycle:lifecycle-viewmodel-navigation3`, which does not exist. This artifact was introduced in later versions of the Lifecycle library to support Jetpack Navigation 3.

## Proposed Changes

### Build Configuration

#### [MODIFY] [libs.versions.toml](file:///D:/FormCheckAI/frontend_native/gradle/libs.versions.toml)
- Update `androidxLifecycle` version from `2.8.7` to `2.11.0`.
- This will update all lifecycle-related dependencies (`runtime-ktx`, `runtime-compose`, `viewmodel-compose`, and `viewmodel-navigation3`) to a version that includes the required navigation3 support.

## Verification Plan

### Automated Tests
- Run `./gradlew :app:assembleDebug` to verify that all dependencies are resolved and the project builds successfully.

### Manual Verification
- Sync the project in Android Studio to ensure the IDE recognizes the new dependency versions.
