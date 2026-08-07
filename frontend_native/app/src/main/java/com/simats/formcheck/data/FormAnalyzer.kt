package com.simats.formcheck.data

import com.google.mlkit.vision.pose.Pose
import com.google.mlkit.vision.pose.PoseLandmark
import kotlin.math.abs
import kotlin.math.atan2

data class ExerciseAssessment(
    val score: Int,
    val issues: List<String>,
    val feedback: String,
    val reps: Int = 0
)

class FormAnalyzer {
    // State Tracking
    private var squatState = "UP"
    private var squatReps = 0
    private var squatLowestScore = 100

    private var pushupState = "UP"
    private var pushupReps = 0
    private var pushupLowestScore = 100

    private var lungeState = "UP"
    private var lungeReps = 0
    private var lungeLowestScore = 100

    private var jjState = "CLOSED"
    private var jjReps = 0
    private var jjLowestScore = 100

    fun analyzeSquat(pose: Pose): ExerciseAssessment {
        val landmarks = pose.allPoseLandmarks
        if (landmarks.isEmpty()) return ExerciseAssessment(0, emptyList(), "No pose detected")

        val leftHip = pose.getPoseLandmark(PoseLandmark.LEFT_HIP)
        val leftKnee = pose.getPoseLandmark(PoseLandmark.LEFT_KNEE)
        val leftAnkle = pose.getPoseLandmark(PoseLandmark.LEFT_ANKLE)
        val leftShoulder = pose.getPoseLandmark(PoseLandmark.LEFT_SHOULDER)

        val rightHip = pose.getPoseLandmark(PoseLandmark.RIGHT_HIP)
        val rightKnee = pose.getPoseLandmark(PoseLandmark.RIGHT_KNEE)
        val rightAnkle = pose.getPoseLandmark(PoseLandmark.RIGHT_ANKLE)
        val rightShoulder = pose.getPoseLandmark(PoseLandmark.RIGHT_SHOULDER)

        if (leftHip == null || leftKnee == null || leftAnkle == null ||
            rightHip == null || rightKnee == null || rightAnkle == null ||
            leftShoulder == null || rightShoulder == null
        ) {
            return ExerciseAssessment(0, emptyList(), "Partial pose detected")
        }

        val leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle)
        val rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle)
        
        // Torso angle relative to vertical (simple proxy for "chest up")
        val torsoAngle = calculateAngle(leftShoulder, leftHip, Point(leftHip.position.x, 0f))

        val issues = mutableListOf<String>()
        val avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2

        if (avgKneeAngle > 115) {
            issues.add("Go lower")
        }

        if (torsoAngle < 45) {
            issues.add("Keep your chest up")
        }

        if (abs(leftKneeAngle - rightKneeAngle) > 20) {
            issues.add("Balance both legs")
        }

        var currentScore = 100
        currentScore -= issues.size * 20
        currentScore = currentScore.coerceIn(0, 100)

        // State Machine for Rep Counting
        if (avgKneeAngle < 115) {
            if (squatState == "UP") {
                squatState = "DOWN"
                squatLowestScore = 100 // Reset for new rep
            }
            if (currentScore < squatLowestScore) {
                squatLowestScore = currentScore
            }
        } else if (avgKneeAngle > 150) {
            if (squatState == "DOWN") {
                squatState = "UP"
                if (squatLowestScore == 100) {
                    squatReps++
                }
            }
        }

        val feedback = if (issues.isEmpty()) "Good squat form" else issues[0]

        val reportedScore = if (squatState == "DOWN") squatLowestScore else currentScore
        return ExerciseAssessment(reportedScore, issues, feedback, squatReps)
    }

    fun analyzePushup(pose: Pose): ExerciseAssessment {
        val landmarks = pose.allPoseLandmarks
        if (landmarks.isEmpty()) return ExerciseAssessment(0, emptyList(), "No pose detected")
        
        val leftShoulder = pose.getPoseLandmark(PoseLandmark.LEFT_SHOULDER)
        val leftElbow = pose.getPoseLandmark(PoseLandmark.LEFT_ELBOW)
        val leftWrist = pose.getPoseLandmark(PoseLandmark.LEFT_WRIST)
        val leftHip = pose.getPoseLandmark(PoseLandmark.LEFT_HIP)
        val leftAnkle = pose.getPoseLandmark(PoseLandmark.LEFT_ANKLE)

        if (leftShoulder == null || leftElbow == null || leftWrist == null || leftHip == null || leftAnkle == null) {
            return ExerciseAssessment(0, emptyList(), "Partial pose detected")
        }

        val elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist)
        val bodyAngle = calculateAngle(leftShoulder, leftHip, leftAnkle)

        val issues = mutableListOf<String>()
        if (bodyAngle < 160) issues.add("Keep your back straight")
        if (elbowAngle > 90 && elbowAngle < 150) issues.add("Go lower")

        var currentScore = 100 - (issues.size * 20)
        currentScore = currentScore.coerceIn(0, 100)
        
        // State Machine for Rep Counting
        if (elbowAngle < 90) { // Going down
            if (pushupState == "UP") {
                pushupState = "DOWN"
                pushupLowestScore = 100
            }
            if (currentScore < pushupLowestScore) {
                pushupLowestScore = currentScore
            }
        } else if (elbowAngle > 150) { // Coming up
            if (pushupState == "DOWN") {
                pushupState = "UP"
                if (pushupLowestScore == 100) {
                    pushupReps++
                }
            }
        }

        val reportedScore = if (pushupState == "DOWN") pushupLowestScore else currentScore
        return ExerciseAssessment(reportedScore, issues, if (issues.isEmpty()) "Good push-up form" else issues[0], pushupReps)
    }

    fun analyzePlank(pose: Pose): ExerciseAssessment {
        val landmarks = pose.allPoseLandmarks
        if (landmarks.isEmpty()) return ExerciseAssessment(0, emptyList(), "No pose detected")

        val shoulder = pose.getPoseLandmark(PoseLandmark.LEFT_SHOULDER)
        val hip = pose.getPoseLandmark(PoseLandmark.LEFT_HIP)
        val ankle = pose.getPoseLandmark(PoseLandmark.LEFT_ANKLE)

        if (shoulder == null || hip == null || ankle == null) {
            return ExerciseAssessment(0, emptyList(), "Partial pose detected")
        }

        val bodyAngle = calculateAngle(shoulder, hip, ankle)
        val issues = mutableListOf<String>()
        
        if (bodyAngle < 165) issues.add("Lower your hips")
        else if (bodyAngle > 195) issues.add("Raise your hips")

        var score = 100 - (issues.size * 20)
        score = score.coerceIn(0, 100)
        return ExerciseAssessment(score, issues, if (issues.isEmpty()) "Good plank form" else issues[0])
    }

    fun analyzeLunge(pose: Pose): ExerciseAssessment {
        val landmarks = pose.allPoseLandmarks
        if (landmarks.isEmpty()) return ExerciseAssessment(0, emptyList(), "No pose detected")

        val leftHip = pose.getPoseLandmark(PoseLandmark.LEFT_HIP)
        val leftKnee = pose.getPoseLandmark(PoseLandmark.LEFT_KNEE)
        val leftAnkle = pose.getPoseLandmark(PoseLandmark.LEFT_ANKLE)
        
        if (leftHip == null || leftKnee == null || leftAnkle == null) {
            return ExerciseAssessment(0, emptyList(), "Partial pose detected")
        }

        val kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle)
        val issues = mutableListOf<String>()

        if (kneeAngle > 110) issues.add("Drop your back knee lower")

        var currentScore = 100 - (issues.size * 20)
        currentScore = currentScore.coerceIn(0, 100)

        // State Machine for Rep Counting
        if (kneeAngle < 100) {
            if (lungeState == "UP") {
                lungeState = "DOWN"
                lungeLowestScore = 100
            }
            if (currentScore < lungeLowestScore) {
                lungeLowestScore = currentScore
            }
        } else if (kneeAngle > 150) {
            if (lungeState == "DOWN") {
                lungeState = "UP"
                if (lungeLowestScore == 100) {
                    lungeReps++
                }
            }
        }

        val reportedScore = if (lungeState == "DOWN") lungeLowestScore else currentScore
        return ExerciseAssessment(reportedScore, issues, if (issues.isEmpty()) "Good lunge form" else issues[0], lungeReps)
    }

    fun analyzeJumpingJack(pose: Pose): ExerciseAssessment {
        val landmarks = pose.allPoseLandmarks
        if (landmarks.isEmpty()) return ExerciseAssessment(0, emptyList(), "No pose detected")

        val leftAnkle = pose.getPoseLandmark(PoseLandmark.LEFT_ANKLE)
        val rightAnkle = pose.getPoseLandmark(PoseLandmark.RIGHT_ANKLE)
        val leftWrist = pose.getPoseLandmark(PoseLandmark.LEFT_WRIST)
        val rightWrist = pose.getPoseLandmark(PoseLandmark.RIGHT_WRIST)

        if (leftAnkle == null || rightAnkle == null || leftWrist == null || rightWrist == null) {
            return ExerciseAssessment(0, emptyList(), "Partial pose detected")
        }

        // Just basic checks for a jumping jack
        val feetDistance = abs(leftAnkle.position.x - rightAnkle.position.x)
        val handsDistance = abs(leftWrist.position.x - rightWrist.position.x)

        val issues = mutableListOf<String>()
        if (feetDistance < 50 && handsDistance > 100) issues.add("Coordinate arms and legs")

        var currentScore = 100 - (issues.size * 20)
        currentScore = currentScore.coerceIn(0, 100)

        // State Machine for Rep Counting
        if (handsDistance > 150 && feetDistance > 100) {
            if (jjState == "CLOSED") {
                jjState = "OPEN"
                jjLowestScore = 100
            }
            if (currentScore < jjLowestScore) {
                jjLowestScore = currentScore
            }
        } else if (handsDistance < 100 && feetDistance < 50) {
            if (jjState == "OPEN") {
                jjState = "CLOSED"
                if (jjLowestScore == 100) {
                    jjReps++
                }
            }
        }

        val reportedScore = if (jjState == "OPEN") jjLowestScore else currentScore
        return ExerciseAssessment(reportedScore, issues, if (issues.isEmpty()) "Good jumping jack form" else issues[0], jjReps)
    }

    private fun calculateAngle(firstPoint: PoseLandmark, midPoint: PoseLandmark, lastPoint: PoseLandmark): Float {
        var result = java.lang.Math.toDegrees(
            (atan2(lastPoint.position.y - midPoint.position.y, lastPoint.position.x - midPoint.position.x) -
                    atan2(firstPoint.position.y - midPoint.position.y, firstPoint.position.x - midPoint.position.x)).toDouble()
        ).toFloat()
        result = abs(result)
        if (result > 180) {
            result = 360.0f - result
        }
        return result
    }

    private fun calculateAngle(firstPoint: PoseLandmark, midPoint: PoseLandmark, lastPoint: Point): Float {
        var result = java.lang.Math.toDegrees(
            (atan2(lastPoint.y - midPoint.position.y, lastPoint.x - midPoint.position.x) -
                    atan2(firstPoint.position.y - midPoint.position.y, firstPoint.position.x - midPoint.position.x)).toDouble()
        ).toFloat()
        result = abs(result)
        if (result > 180) {
            result = 360.0f - result
        }
        return result
    }

    private data class Point(val x: Float, val y: Float)
}
