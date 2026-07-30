import math
from typing import Iterable, Tuple

Point = Tuple[float, float]


def calculate_angle(a: Point, b: Point, c: Point) -> float:
    """Return the angle ABC in degrees for three 2D points."""
    ax, ay = a
    bx, by = b
    cx, cy = c

    radians = math.atan2(cy - by, cx - bx) - math.atan2(ay - by, ax - bx)
    angle = abs(math.degrees(radians))

    if angle > 180:
        angle = 360 - angle

    return angle


def landmark_to_point(landmarks: Iterable, index: int, image_width: int, image_height: int) -> Point:
    landmark = landmarks[index]
    return landmark.x * image_width, landmark.y * image_height
