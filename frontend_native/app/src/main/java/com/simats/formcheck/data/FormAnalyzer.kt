package com.simats.formcheck.data

import com.google.mlkit.vision.pose.Pose
import com.google.mlkit.vision.pose.PoseLandmark
import kotlin.math.abs
import kotlin.math.atan2

data class ExerciseAssessment(
    val score: Int,
    val issues: List<String>,
    val feedback: String
)

class FormAnalyzer {

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

        var score = 100
        score -= issues.size * 20
        score = score.coerceIn(0, 100)

        val feedback = if (issues.isEmpty()) "Good squat form" else issues[0]

        return ExerciseAssessment(score, issues, feedback)
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

        var score = 100 - (issues.size * 20)
        score = score.coerceIn(0, 100)
        
        return ExerciseAssessment(score, issues, if (issues.isEmpty()) "Good push-up form" else issues[0])
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

        var score = 100 - (issues.size * 20)
        score = score.coerceIn(0, 100)
        return ExerciseAssessment(score, issues, if (issues.isEmpty()) "Good lunge form" else issues[0])
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

        var score = 100 - (issues.size * 20)
        score = score.coerceIn(0, 100)
        return ExerciseAssessment(score, issues, if (issues.isEmpty()) "Good jumping jack form" else issues[0])
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
