package com.simats.formcheck.ui.camera

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PointMode
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.mlkit.vision.pose.Pose
import com.google.mlkit.vision.pose.PoseLandmark
import com.simats.formcheck.data.FormAnalyzer
import com.simats.formcheck.data.ExerciseAssessment
import com.simats.formcheck.data.SessionRepository
import com.simats.formcheck.theme.PrimaryCyan
import com.simats.formcheck.theme.TextPrimary
import com.simats.formcheck.theme.TextSecondary
import com.simats.formcheck.theme.glassmorphism

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CameraScreen(
    exerciseId: String,
    onNavigateBack: () -> Unit
) {
    val analyzer = remember { FormAnalyzer() }
    val repository = remember { SessionRepository() }
    val scope = rememberCoroutineScope()
    var isSaving by remember { mutableStateOf(false) }
    var detectedPose by remember { mutableStateOf<Pose?>(null) }
    var assessment by remember { mutableStateOf<ExerciseAssessment?>(null) }
    var imageWidth by remember { mutableStateOf(1) }
    var imageHeight by remember { mutableStateOf(1) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Live Form Check", color = PrimaryCyan, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = PrimaryCyan)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            CameraPreview(
                onPoseDetected = { pose, width, height ->
                    detectedPose = pose
                    imageWidth = width
                    imageHeight = height
                    assessment = when (exerciseId) {
                        "squat" -> analyzer.analyzeSquat(pose)
                        "pushup" -> analyzer.analyzePushup(pose)
                        "plank" -> analyzer.analyzePlank(pose)
                        "lunge" -> analyzer.analyzeLunge(pose)
                        "jumping_jack" -> analyzer.analyzeJumpingJack(pose)
                        else -> analyzer.analyzeSquat(pose)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            detectedPose?.let { pose ->
                SkeletonOverlay(pose = pose, imageWidth = imageWidth, imageHeight = imageHeight)
            }

            // Top Feedback Banner
            assessment?.let {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(16.dp)
                        .glassmorphism()
                        .padding(horizontal = 24.dp, vertical = 12.dp)
                ) {
                    Text(
                        text = it.feedback,
                        color = if (it.issues.isEmpty()) PrimaryCyan else Color.Yellow,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Bottom Score/Reps Card
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(32.dp)
                    .glassmorphism()
                    .padding(horizontal = 32.dp, vertical = 16.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = "Form Score", color = TextSecondary, fontSize = 14.sp)
                    Text(
                        text = assessment?.score?.toString() ?: "0",
                        color = PrimaryCyan,
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = {
                            assessment?.let { currentAssessment ->
                                isSaving = true
                                scope.launch {
                                    val success = repository.saveSession(exerciseId, currentAssessment)
                                    isSaving = false
                                    onNavigateBack()
                                }
                            }
                        },
                        enabled = !isSaving && assessment != null,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan)
                    ) {
                        Text(if (isSaving) "Saving..." else "Finish & Save", color = Color.Black)
                    }
                }
            }
        }
    }
}

@Composable
fun SkeletonOverlay(pose: Pose, imageWidth: Int, imageHeight: Int) {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val landmarks = pose.allPoseLandmarks
        if (landmarks.isEmpty()) return@Canvas

        val scaleX = size.width / imageWidth
        val scaleY = size.height / imageHeight

        // Draw points
        val points = landmarks.map { Offset(it.position.x * scaleX, it.position.y * scaleY) }
        
        drawPoints(
            points = points,
            pointMode = PointMode.Points,
            color = PrimaryCyan,
            strokeWidth = 10f,
            cap = StrokeCap.Round
        )

        // Draw basic connections for squat (Hips to Knees, Knees to Ankles)
        fun drawLineBetween(start: Int, end: Int) {
            val startLandmark = pose.getPoseLandmark(start)
            val endLandmark = pose.getPoseLandmark(end)
            if (startLandmark != null && endLandmark != null) {
                drawLine(
                    color = Color.White,
                    start = Offset(startLandmark.position.x * scaleX, startLandmark.position.y * scaleY),
                    end = Offset(endLandmark.position.x * scaleX, endLandmark.position.y * scaleY),
                    strokeWidth = 4f
                )
            }
        }

        drawLineBetween(PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_KNEE)
        drawLineBetween(PoseLandmark.LEFT_KNEE, PoseLandmark.LEFT_ANKLE)
        drawLineBetween(PoseLandmark.RIGHT_HIP, PoseLandmark.RIGHT_KNEE)
        drawLineBetween(PoseLandmark.RIGHT_KNEE, PoseLandmark.RIGHT_ANKLE)
        drawLineBetween(PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP)
        drawLineBetween(PoseLandmark.LEFT_SHOULDER, PoseLandmark.RIGHT_SHOULDER)
        drawLineBetween(PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_HIP)
        drawLineBetween(PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_HIP)
    }
}
