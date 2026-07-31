package com.simats.formcheck.ui.auth

import android.content.Context
import android.util.Log
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.tasks.await

class GoogleSignInHelper(private val context: Context) {
    private val credentialManager = CredentialManager.create(context)
    private val firebaseAuth = FirebaseAuth.getInstance()

    suspend fun signIn(): Boolean {
        try {
            // NOTE: You must replace this with your actual Web Client ID from Firebase Console
            val webClientId = "107212643000159054381-placeholder.apps.googleusercontent.com" 

            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(webClientId)
                .setAutoSelectEnabled(true)
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            val result = credentialManager.getCredential(context, request)
            val credential = result.credential

            if (credential is GoogleIdTokenCredential) {
                val firebaseCredential = GoogleAuthProvider.getCredential(credential.idToken, null)
                firebaseAuth.signInWithCredential(firebaseCredential).await()
                return true
            }
        } catch (e: Exception) {
            Log.e("GoogleSignIn", "Sign in failed", e)
        }
        return false
    }

    suspend fun signOut() {
        firebaseAuth.signOut()
        credentialManager.clearCredentialState(ClearCredentialStateRequest())
    }
}
