package com.simats.formcheck.data

import com.google.firebase.auth.FirebaseAuth
import com.simats.formcheck.data.api.FormCheckApi
import com.simats.formcheck.data.api.SessionPayload
import com.simats.formcheck.data.api.SessionResponse
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.channels.awaitClose
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class SessionRepository {

    private val api: FormCheckApi by lazy {
        val client = okhttp3.OkHttpClient.Builder()
            .addInterceptor { chain ->
                val request = chain.request().newBuilder()
                    .addHeader("Bypass-Tunnel-Reminder", "true")
                    .build()
                chain.proceed(request)
            }
            .build()

        Retrofit.Builder()
            // Use local IP address for physical device testing
            .baseUrl("http://192.168.1.9:8080/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(FormCheckApi::class.java)
    }

    suspend fun saveSession(exerciseId: String, assessment: ExerciseAssessment): String? {
        return try {
            val user = FirebaseAuth.getInstance().currentUser
            if (user == null) {
                return null
            }

            // Get token
            val tokenResult = user.getIdToken(false).await()
            val token = tokenResult.token
            
            if (token.isNullOrEmpty()) {
                return null
            }

            val payload = SessionPayload(
                exercise = exerciseId,
                score = assessment.score,
                feedback = assessment.feedback,
                issues = assessment.issues,
                reps = assessment.reps
            )

            val response = api.saveSession("Bearer $token", payload)
            if (response.isSuccessful) {
                response.body()?.id
            } else null
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun updateSession(sessionId: String, exerciseId: String, assessment: ExerciseAssessment): Boolean {
        return try {
            val user = FirebaseAuth.getInstance().currentUser ?: return false
            val token = user.getIdToken(false).await().token ?: return false

            val payload = SessionPayload(
                exercise = exerciseId,
                score = assessment.score,
                feedback = assessment.feedback,
                issues = assessment.issues,
                reps = assessment.reps
            )

            val response = api.updateSession("Bearer $token", sessionId, payload)
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

    fun getProfileFlow(): kotlinx.coroutines.flow.Flow<com.simats.formcheck.data.api.UserProfile?> = kotlinx.coroutines.flow.callbackFlow {
        val user = FirebaseAuth.getInstance().currentUser
        if (user == null) {
            trySend(null)
            close()
            return@callbackFlow
        }

        val db = com.google.firebase.firestore.FirebaseFirestore.getInstance()
        val listener = db.collection("users").document(user.uid)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    trySend(null)
                    return@addSnapshotListener
                }

                if (snapshot != null && snapshot.exists()) {
                    val name = snapshot.getString("name")
                    val fitnessGoal = snapshot.getString("fitnessGoal")
                    val weight = snapshot.getString("weight")
                    val progress = snapshot.getString("progress")
                    
                    trySend(
                        com.simats.formcheck.data.api.UserProfile(
                            name = name,
                            fitnessGoal = fitnessGoal,
                            weight = weight,
                            progress = progress
                        )
                    )
                } else {
                    trySend(null)
                }
            }

        awaitClose { listener.remove() }
    }

    fun getSessionsFlow(): kotlinx.coroutines.flow.Flow<List<SessionResponse>> = kotlinx.coroutines.flow.callbackFlow {
        val user = FirebaseAuth.getInstance().currentUser
        if (user == null) {
            trySend(emptyList())
            close()
            return@callbackFlow
        }

        val db = com.google.firebase.firestore.FirebaseFirestore.getInstance()
        val listener = db.collection("sessions")
            .whereEqualTo("userId", user.uid)
            .addSnapshotListener { snapshot, error ->
                if (error != null || snapshot == null) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }

                val sessions = snapshot.documents.mapNotNull { doc ->
                    val score = doc.getLong("score")?.toInt() ?: 0
                    val exercise = doc.getString("exercise") ?: ""
                    val feedback = doc.getString("feedback") ?: ""
                    val issues = doc.get("issues") as? List<String> ?: emptyList()
                    val createdAt = doc.getTimestamp("createdAt")?.seconds ?: 0L
                    
                    // Store createdAt temporarily in a Pair for sorting
                    Pair(SessionResponse(
                        id = doc.id,
                        exercise = exercise,
                        score = score,
                        feedback = feedback,
                        issues = issues
                    ), createdAt)
                }
                
                // Sort by createdAt descending
                val sortedSessions = sessions.sortedByDescending { it.second }.map { it.first }
                trySend(sortedSessions)
            }

        awaitClose { listener.remove() }
    }
}
