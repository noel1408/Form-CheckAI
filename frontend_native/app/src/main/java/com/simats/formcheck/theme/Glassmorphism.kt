package com.simats.formcheck.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

fun Modifier.glassmorphism() = composed {
    this
        .clip(RoundedCornerShape(16.dp))
        .background(BackgroundCard)
        .border(
            width = 1.dp,
            color = SurfaceBorder,
            shape = RoundedCornerShape(16.dp)
        )
}
