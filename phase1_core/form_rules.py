from dataclasses import dataclass
from typing import List


@dataclass
class SquatAssessment:
    score: int
    issues: List[str]
    feedback: str


def assess_squat(left_knee_angle: float, right_knee_angle: float, torso_angle: float) -> SquatAssessment:
    """Simple v1 squat rules based on joint angles.

    This is intentionally rule-based for the first MVP. Tune thresholds after
    testing with real users and different camera positions.
    """
    issues: List[str] = []

    avg_knee_angle = (left_knee_angle + right_knee_angle) / 2

    if avg_knee_angle > 115:
        issues.append("Go lower")

    if torso_angle < 45:
        issues.append("Keep your chest up")

    if abs(left_knee_angle - right_knee_angle) > 20:
        issues.append("Balance both legs")

    score = 100
    score -= len(issues) * 20
    score = max(0, min(100, score))

    if not issues:
        feedback = "Good squat form"
    else:
        feedback = issues[0]

    return SquatAssessment(score=score, issues=issues, feedback=feedback)
