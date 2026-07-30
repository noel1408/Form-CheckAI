import time

import cv2
import mediapipe as mp
import pyttsx3

from form_rules import assess_squat
from pose_utils import calculate_angle, landmark_to_point

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose


class VoiceFeedback:
    def __init__(self, cooldown_seconds: float = 2.5) -> None:
        self.engine = pyttsx3.init()
        self.cooldown_seconds = cooldown_seconds
        self.last_spoken_at = 0.0
        self.last_message = ""

    def say(self, message: str) -> None:
        now = time.time()
        if message == self.last_message and now - self.last_spoken_at < self.cooldown_seconds:
            return
        if now - self.last_spoken_at < self.cooldown_seconds:
            return

        self.last_message = message
        self.last_spoken_at = now
        self.engine.say(message)
        self.engine.runAndWait()


def main() -> None:
    cap = cv2.VideoCapture(0)
    voice = VoiceFeedback()

    if not cap.isOpened():
        raise RuntimeError("Could not open camera. Check camera permission or device index.")

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            frame = cv2.flip(frame, 1)
            image_height, image_width, _ = frame.shape

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            rgb_frame.flags.writeable = False
            results = pose.process(rgb_frame)
            rgb_frame.flags.writeable = True

            status_text = "Stand in frame"
            score_text = "Score: --"

            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark

                left_hip = landmark_to_point(landmarks, mp_pose.PoseLandmark.LEFT_HIP.value, image_width, image_height)
                left_knee = landmark_to_point(landmarks, mp_pose.PoseLandmark.LEFT_KNEE.value, image_width, image_height)
                left_ankle = landmark_to_point(landmarks, mp_pose.PoseLandmark.LEFT_ANKLE.value, image_width, image_height)

                right_hip = landmark_to_point(landmarks, mp_pose.PoseLandmark.RIGHT_HIP.value, image_width, image_height)
                right_knee = landmark_to_point(landmarks, mp_pose.PoseLandmark.RIGHT_KNEE.value, image_width, image_height)
                right_ankle = landmark_to_point(landmarks, mp_pose.PoseLandmark.RIGHT_ANKLE.value, image_width, image_height)

                left_shoulder = landmark_to_point(landmarks, mp_pose.PoseLandmark.LEFT_SHOULDER.value, image_width, image_height)
                right_shoulder = landmark_to_point(landmarks, mp_pose.PoseLandmark.RIGHT_SHOULDER.value, image_width, image_height)

                left_knee_angle = calculate_angle(left_hip, left_knee, left_ankle)
                right_knee_angle = calculate_angle(right_hip, right_knee, right_ankle)

                mid_shoulder = ((left_shoulder[0] + right_shoulder[0]) / 2, (left_shoulder[1] + right_shoulder[1]) / 2)
                mid_hip = ((left_hip[0] + right_hip[0]) / 2, (left_hip[1] + right_hip[1]) / 2)
                vertical_reference = (mid_hip[0], mid_hip[1] - 100)
                torso_angle = calculate_angle(mid_shoulder, mid_hip, vertical_reference)

                assessment = assess_squat(left_knee_angle, right_knee_angle, torso_angle)
                status_text = assessment.feedback
                score_text = f"Score: {assessment.score}"

                if assessment.issues:
                    voice.say(assessment.feedback)

                mp_drawing.draw_landmarks(
                    frame,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                    mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2, circle_radius=2),
                )

            cv2.rectangle(frame, (0, 0), (image_width, 80), (20, 20, 20), -1)
            cv2.putText(frame, status_text, (20, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
            cv2.putText(frame, score_text, (20, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            cv2.imshow("FormCheck AI - Squat MVP", frame)

            if cv2.waitKey(10) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
