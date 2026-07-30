package com.simats.formcheck

import androidx.navigation3.runtime.NavKey
import kotlinx.serialization.Serializable

@Serializable data object Auth : NavKey
@Serializable data object Home : NavKey
@Serializable data object Profile : NavKey
@Serializable data class Camera(val exerciseId: String) : NavKey
