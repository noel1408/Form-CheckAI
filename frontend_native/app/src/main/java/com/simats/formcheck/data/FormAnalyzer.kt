package com.simats.formcheck.data

import com.google.mlkit.vision.pose.Pose
import com.google.mlkit.vision.pose.PoseLandmark
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.toDegrees

data class SquatAssessment(
    val score: Int,
    val issues: List<String>,
    val feedback: String
)

class FormAnalyzer {

    fun analyzeSquat(pose: Pose): SquatAssessment {
        val landmarks = pose.allPoseLandmarks
        if (landmarks.isEmpty()) return SquatAssessment(0, emptyList(), "No pose detected")

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
            return SquatAssessment(0, emptyList(), "Partial pose detected")
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

        return SquatAssessment(score, issues, feedback)
    }

    private fun calculateAngle(firstPoint: PoseLandmark, midPoint: PoseLandmark, lastPoint: PoseLandmark): Float {
        var result = Math.toDegrees(
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
        var result = Math.toDegrees(
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
