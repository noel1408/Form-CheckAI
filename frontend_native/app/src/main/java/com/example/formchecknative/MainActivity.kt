package com.example.formchecknative

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.formchecknative.theme.FormCheckNativeTheme
import com.example.formchecknative.ui.auth.AuthScreen

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    enableEdgeToEdge()
    setContent {
      FormCheckNativeTheme {
        AuthScreen(
          onNavigateToHome = { /* TODO: Nav Graph */ }
        )
      }
    }
  }
}
