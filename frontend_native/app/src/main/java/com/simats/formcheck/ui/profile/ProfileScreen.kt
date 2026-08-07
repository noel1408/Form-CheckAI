package com.simats.formcheck.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.simats.formcheck.data.SessionRepository
import com.simats.formcheck.theme.ErrorRed
import com.simats.formcheck.theme.PrimaryCyan
import com.simats.formcheck.theme.TextPrimary
import com.simats.formcheck.theme.TextSecondary
import com.simats.formcheck.theme.glassmorphism
import com.simats.formcheck.theme.glassmorphism
import com.simats.formcheck.data.api.UserProfile
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.widget.Toast
import androidx.compose.ui.platform.LocalContext

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onNavigateBack: () -> Unit,
    onLogout: () -> Unit
) {
    val user = FirebaseAuth.getInstance().currentUser
    val repository = remember { SessionRepository() }
    var totalSessions by remember { mutableStateOf(0) }
    var avgScore by remember { mutableStateOf(0) }
    var userProfile by remember { mutableStateOf<UserProfile?>(null) }
    var isEditing by remember { mutableStateOf(false) }
    
    val context = LocalContext.current
    val videoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            Toast.makeText(context, "Workout video attached!", Toast.LENGTH_SHORT).show()
        }
    }
    
    val coroutineScope = androidx.compose.runtime.rememberCoroutineScope()

    LaunchedEffect(Unit) {
        launch {
            repository.getSessionsFlow().collect { sessions ->
                totalSessions = sessions.size / 5
                avgScore = if (sessions.isNotEmpty()) {
                    sessions.sumOf { it.score } / sessions.size
                } else {
                    0
                }
            }
        }
        launch {
            repository.getProfileFlow().collect { profile ->
                userProfile = profile
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile", color = PrimaryCyan, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = PrimaryCyan)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Profile Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .glassmorphism()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = userProfile?.name ?: user?.displayName ?: "Athlete",
                    color = TextPrimary,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = user?.email ?: "No email",
                    color = TextSecondary,
                    fontSize = 16.sp
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    StatBox(label = "Total Sessions", value = totalSessions.toString())
                    StatBox(label = "Avg Form %", value = "$avgScore%")
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    StatBox(label = "Weight", value = userProfile?.weight ?: "N/A")
                    StatBox(label = "Goal", value = userProfile?.fitnessGoal?.replace("_", " ")?.capitalize() ?: "N/A")
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                if (!userProfile?.progress.isNullOrEmpty()) {
                    Text("Notes", color = PrimaryCyan, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Text(userProfile?.progress ?: "", color = TextSecondary, fontSize = 14.sp)
                }

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = { isEditing = true },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan)
                ) {
                    Text("Edit Profile", color = MaterialTheme.colorScheme.background, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedButton(
                    onClick = { videoPickerLauncher.launch("video/*") },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = PrimaryCyan),
                    border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(PrimaryCyan))
                ) {
                    Text("Attach Workout Video", fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = onLogout,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ErrorRed)
            ) {
                Icon(Icons.Filled.ExitToApp, contentDescription = "Logout", tint = TextPrimary)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Log Out", color = TextPrimary, fontWeight = FontWeight.Bold)
            }
        }

        if (isEditing) {
            EditProfileDialog(
                currentProfile = userProfile,
                currentUser = user,
                onDismiss = { isEditing = false },
                onSave = { updatedProfile ->
                    userProfile = updatedProfile
                    isEditing = false
                    coroutineScope.launch {
                        repository.updateProfile(updatedProfile)
                    }
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileDialog(
    currentProfile: UserProfile?,
    currentUser: com.google.firebase.auth.FirebaseUser?,
    onDismiss: () -> Unit,
    onSave: (UserProfile) -> Unit
) {
    var name by remember { mutableStateOf(currentProfile?.name ?: currentUser?.displayName ?: "") }
    var fitnessGoal by remember { mutableStateOf(currentProfile?.fitnessGoal ?: "") }
    var weight by remember { mutableStateOf(currentProfile?.weight ?: "") }
    var progress by remember { mutableStateOf(currentProfile?.progress ?: "") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Profile", color = PrimaryCyan) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Name") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = fitnessGoal,
                    onValueChange = { fitnessGoal = it },
                    label = { Text("Fitness Goal (e.g. weight_loss)") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = weight,
                    onValueChange = { weight = it },
                    label = { Text("Weight") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = progress,
                    onValueChange = { progress = it },
                    label = { Text("Progress / Notes") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(onClick = {
                onSave(UserProfile(
                    name = name,
                    fitnessGoal = fitnessGoal,
                    weight = weight,
                    progress = progress
                ))
            }) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun StatBox(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, color = PrimaryCyan, fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Text(text = label, color = TextSecondary, fontSize = 14.sp)
    }
}
