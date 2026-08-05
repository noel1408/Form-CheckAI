package com.simats.formcheck.data.api

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PUT

data class SessionPayload(
    val exercise: String,
    val score: Int,
    val feedback: String,
    val issues: List<String>
)

data class SessionResponse(
    val id: String,
    val exercise: String?,
    val score: Int,
    val feedback: String?,
    val issues: List<String>?
)

data class UserProfile(
    val name: String? = null,
    val fitnessGoal: String? = null,
    val weight: String? = null,
    val progress: String? = null
)

interface FormCheckApi {
    @POST("/api/sessions")
    suspend fun saveSession(
        @Header("Authorization") token: String,
        @Body payload: SessionPayload
    ): Response<Unit>

    @GET("/api/sessions")
    suspend fun getSessions(
        @Header("Authorization") token: String
    ): Response<List<SessionResponse>>

    @GET("/api/users/profile")
    suspend fun getProfile(
        @Header("Authorization") token: String
    ): Response<UserProfile>

    @PUT("/api/users/profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body profile: UserProfile
    ): Response<Unit>
}
