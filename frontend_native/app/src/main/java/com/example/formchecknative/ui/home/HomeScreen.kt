package com.example.formchecknative.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.formchecknative.theme.PrimaryCyan
import com.example.formchecknative.theme.TextPrimary
import com.example.formchecknative.theme.TextSecondary
import com.example.formchecknative.theme.glassmorphism

data class Exercise(val id: String, val name: String, val description: String)

val exercises = listOf(
    Exercise("pushup", "Push-ups", "Target your chest, shoulders, and triceps."),
    Exercise("squat", "Squats", "Build lower body strength and core stability.")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToCamera: (String) -> Unit,
    onNavigateToProfile: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Dashboard", color = PrimaryCyan, fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = onNavigateToProfile) {
                        Icon(Icons.Filled.Person, contentDescription = "Profile", tint = PrimaryCyan)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "Select an Exercise",
                    color = TextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }
            
            items(exercises) { exercise ->
                ExerciseCard(
                    exercise = exercise,
                    onClick = { onNavigateToCamera(exercise.id) }
                )
            }
        }
    }
}

@Composable
fun ExerciseCard(exercise: Exercise, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .glassmorphism()
            .clickable(onClick = onClick)
            .padding(24.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = exercise.name,
                color = PrimaryCyan,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = exercise.description,
                color = TextSecondary,
                fontSize = 14.sp
            )
        }
        
        Icon(
            imageVector = Icons.Filled.PlayArrow,
            contentDescription = "Start",
            tint = PrimaryCyan,
            modifier = Modifier.size(32.dp)
        )
    }
}
