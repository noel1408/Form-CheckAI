package com.simats.formcheck.data

import com.google.firebase.auth.FirebaseAuth
import com.simats.formcheck.data.api.FormCheckApi
import com.simats.formcheck.data.api.SessionPayload
import com.simats.formcheck.data.api.SessionResponse
import kotlinx.coroutines.tasks.await
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class SessionRepository {

    private val api: FormCheckApi by lazy {
        Retrofit.Builder()
            .baseUrl("https://form-checkai.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(FormCheckApi::class.java)
    }

    suspend fun saveSession(exerciseId: String, assessment: ExerciseAssessment): Boolean {
        return try {
            val user = FirebaseAuth.getInstance().currentUser
            if (user == null) {
                return false
            }

            // Get token
            val tokenResult = user.getIdToken(false).await()
            val token = tokenResult.token
            
            if (token.isNullOrEmpty()) {
                return false
            }

            val payload = SessionPayload(
                exercise = exerciseId,
                score = assessment.score,
                feedback = assessment.feedback,
                issues = assessment.issues
            )

            val response = api.saveSession("Bearer $token", payload)
            response.isSuccessful
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    suspend fun getSessions(): List<SessionResponse> {
        return try {
            val user = FirebaseAuth.getInstance().currentUser ?: return emptyList()
            val token = user.getIdToken(false).await().token ?: return emptyList()
            
            val response = api.getSessions("Bearer $token")
            if (response.isSuccessful) {
                response.body() ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }
    suspend fun getProfile(): com.simats.formcheck.data.api.UserProfile? {
        return try {
            val user = FirebaseAuth.getInstance().currentUser ?: return null
            val token = user.getIdToken(false).await().token ?: return null
            
            val response = api.getProfile("Bearer $token")
            if (response.isSuccessful) {
                response.body()
            } else null
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun updateProfile(profile: com.simats.formcheck.data.api.UserProfile): Boolean {
        return try {
            val user = FirebaseAuth.getInstance().currentUser ?: return false
            val token = user.getIdToken(false).await().token ?: return false
            
            val response = api.updateProfile("Bearer $token", profile)
            response.isSuccessful
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
