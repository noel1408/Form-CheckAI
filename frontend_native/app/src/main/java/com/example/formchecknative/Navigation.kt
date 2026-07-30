package com.example.formchecknative

import androidx.compose.runtime.Composable
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.formchecknative.ui.auth.AuthScreen
import com.example.formchecknative.ui.home.HomeScreen
import com.example.formchecknative.ui.profile.ProfileScreen

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
          // Stub for CameraScreen
          androidx.compose.material3.Text(
              "Camera Screen Placeholder: ${it.exerciseId}", 
              color = androidx.compose.ui.graphics.Color.White
          )
        }
      },
  )
}
