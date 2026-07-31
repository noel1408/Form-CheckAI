package com.simats.formcheck

import androidx.compose.runtime.Composable
import androidx.navigation3.runtime.*
import androidx.navigation3.ui.*
import com.simats.formcheck.ui.auth.AuthScreen
import com.simats.formcheck.ui.home.HomeScreen
import com.simats.formcheck.ui.profile.ProfileScreen

@Composable
fun MainNavigation() {
  val backStack = rememberNavBackStack(Auth)

  NavDisplay(
    backStack = backStack,
    onBack = { backStack.removeLastOrNull() },
    entryProvider =
      entryProvider {
        entry<Auth> {
          AuthScreen(
            onNavigateToHome = {
              backStack.clear()
              backStack.add(Home)
            }
          )
        }
        
        entry<Home> {
          HomeScreen(
            onNavigateToCamera = { exerciseId -> backStack.add(Camera(exerciseId)) },
            onNavigateToProfile = { backStack.add(Profile) }
          )
        }
        
        entry<Profile> {
          ProfileScreen(
            onNavigateBack = { backStack.removeLastOrNull() },
            onLogout = {
              backStack.clear()
              backStack.add(Auth)
            }
          )
        }

        entry<Camera> {
          com.simats.formcheck.ui.camera.CameraScreen(
              exerciseId = it.exerciseId,
              onNavigateBack = { backStack.removeLastOrNull() }
          )
        }
      },
  )
}
