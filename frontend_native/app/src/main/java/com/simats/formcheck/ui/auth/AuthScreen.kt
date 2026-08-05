package com.simats.formcheck.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import com.simats.formcheck.theme.PrimaryCyan
import com.simats.formcheck.theme.TextPrimary
import com.simats.formcheck.theme.TextSecondary
import com.simats.formcheck.theme.ErrorRed
import com.simats.formcheck.theme.glassmorphism
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthScreen(
    onNavigateToHome: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val signInHelper = remember { GoogleSignInHelper(context) }
    
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var resetMessage by remember { mutableStateOf("") }
    var resetError by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .glassmorphism()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "FormCheck AI",
                color = PrimaryCyan,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold
            )
            
            Text(
                text = "Native Kotlin Edition",
                color = TextSecondary,
                fontSize = 14.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email", color = TextSecondary) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryCyan,
                    unfocusedBorderColor = TextSecondary,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                ),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password", color = TextSecondary) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryCyan,
                    unfocusedBorderColor = TextSecondary,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                ),
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(8.dp))

            if (isLoading) {
                CircularProgressIndicator(color = PrimaryCyan)
            } else {
                Button(
                    onClick = onNavigateToHome,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan)
                ) {
                    Text("Sign In", color = MaterialTheme.colorScheme.background, fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = {
                        scope.launch {
                            isLoading = true
                            if (signInHelper.signIn()) {
                                onNavigateToHome()
                            }
                            isLoading = false
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = PrimaryCyan),
                    border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(PrimaryCyan))
                ) {
                    Text("Sign In with Google", fontWeight = FontWeight.Bold)
                }
            }

            if (resetMessage.isNotEmpty()) {
                Text(
                    text = resetMessage,
                    color = if (resetError) ErrorRed else PrimaryCyan,
                    fontSize = 14.sp
                )
            }

            TextButton(onClick = { 
                if (email.isNotBlank()) {
                    resetMessage = "Sending reset link..."
                    resetError = false
                    com.google.firebase.auth.FirebaseAuth.getInstance().sendPasswordResetEmail(email)
                        .addOnCompleteListener { task ->
                            if (task.isSuccessful) {
                                resetMessage = "Check your email for reset instructions."
                                resetError = false
                            } else {
                                resetMessage = task.exception?.message ?: "Failed to send reset link."
                                resetError = true
                            }
                        }
                } else {
                    resetMessage = "Please enter your email in the field above first."
                    resetError = true
                }
            }) {
                Text("Forgot Password?", color = PrimaryCyan)
            }
        }
    }
}
