package com.simats.formcheck.data

import com.google.android.gms.tasks.Task
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.pose.Pose
import com.google.mlkit.vision.pose.PoseDetection
import com.google.mlkit.vision.pose.accurate.AccuratePoseDetectorOptions


class PoseDetector(accurate: Boolean = true) {
    private val options = AccuratePoseDetectorOptions.Builder()
        .setDetectorMode(AccuratePoseDetectorOptions.STREAM_MODE)
        .build()

    private val detector = PoseDetection.getClient(options)

    fun processImage(image: InputImage): Task<Pose> {
        return detector.process(image)
    }

    fun close() {
        detector.close()
    }
}
