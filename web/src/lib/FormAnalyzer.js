class FormAnalyzer {
  constructor() {
    this.squatState = "UP";
    this.squatReps = 0;
    this.squatLowestScore = 100;

    this.pushupState = "UP";
    this.pushupReps = 0;
    this.pushupLowestScore = 100;

    this.lungeState = "UP";
    this.lungeReps = 0;
    this.lungeLowestScore = 100;

    this.jjState = "CLOSED";
    this.jjReps = 0;
    this.jjLowestScore = 100;
  }

  getLandmark(keypoints, name) {
    const point = keypoints.find(k => k.name === name);
    return point && point.score > 0.3 ? point : null;
  }

  calculateAngle(firstPoint, midPoint, lastPoint) {
    let result = Math.atan2(lastPoint.y - midPoint.y, lastPoint.x - midPoint.x) -
                 Math.atan2(firstPoint.y - midPoint.y, firstPoint.x - midPoint.x);
    result = Math.abs((result * 180.0) / Math.PI);
    if (result > 180.0) {
      result = 360.0 - result;
    }
    return result;
  }

  analyzeSquat(keypoints) {
    if (!keypoints || keypoints.length === 0) return { score: 0, issues: ["No pose detected"], feedback: "No pose detected", reps: this.squatReps };

    const leftHip = this.getLandmark(keypoints, 'left_hip');
    const leftKnee = this.getLandmark(keypoints, 'left_knee');
    const leftAnkle = this.getLandmark(keypoints, 'left_ankle');
    const leftShoulder = this.getLandmark(keypoints, 'left_shoulder');

    const rightHip = this.getLandmark(keypoints, 'right_hip');
    const rightKnee = this.getLandmark(keypoints, 'right_knee');
    const rightAnkle = this.getLandmark(keypoints, 'right_ankle');
    const rightShoulder = this.getLandmark(keypoints, 'right_shoulder');

    if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle || !leftShoulder || !rightShoulder) {
      return { score: 0, issues: ["Partial pose detected"], feedback: "Partial pose detected", reps: this.squatReps };
    }

    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
    const torsoAngle = this.calculateAngle(leftShoulder, leftHip, { x: leftHip.x, y: 0 });

    const issues = [];
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

    if (avgKneeAngle > 115) issues.push("Go lower");
    if (torsoAngle < 45) issues.push("Keep your chest up");
    if (Math.abs(leftKneeAngle - rightKneeAngle) > 20) issues.push("Balance both legs");

    let currentScore = 100 - (issues.length * 20);
    currentScore = Math.max(0, Math.min(100, currentScore));

    if (avgKneeAngle < 115) {
      if (this.squatState === "UP") {
        this.squatState = "DOWN";
        this.squatLowestScore = 100;
      }
      if (currentScore < this.squatLowestScore) {
        this.squatLowestScore = currentScore;
      }
    } else if (avgKneeAngle > 150) {
      if (this.squatState === "DOWN") {
        this.squatState = "UP";
        if (this.squatLowestScore === 100) {
          this.squatReps++;
        }
      }
    }

    const feedback = issues.length === 0 ? "Good squat form" : issues[0];
    const reportedScore = this.squatState === "DOWN" ? this.squatLowestScore : currentScore;
    
    return { score: reportedScore, issues, feedback, reps: this.squatReps };
  }

  analyzePushup(keypoints) {
    if (!keypoints || keypoints.length === 0) return { score: 0, issues: ["No pose detected"], feedback: "No pose detected", reps: this.pushupReps };

    const leftShoulder = this.getLandmark(keypoints, 'left_shoulder');
    const leftElbow = this.getLandmark(keypoints, 'left_elbow');
    const leftWrist = this.getLandmark(keypoints, 'left_wrist');
    const leftHip = this.getLandmark(keypoints, 'left_hip');
    const leftAnkle = this.getLandmark(keypoints, 'left_ankle');

    if (!leftShoulder || !leftElbow || !leftWrist || !leftHip || !leftAnkle) {
      return { score: 0, issues: ["Partial pose detected"], feedback: "Partial pose detected", reps: this.pushupReps };
    }

    const elbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
    const bodyAngle = this.calculateAngle(leftShoulder, leftHip, leftAnkle);

    const issues = [];
    if (bodyAngle < 160) issues.push("Keep your back straight");
    if (elbowAngle > 90 && elbowAngle < 150) issues.push("Go lower");

    let currentScore = 100 - (issues.length * 20);
    currentScore = Math.max(0, Math.min(100, currentScore));

    if (elbowAngle < 90) {
      if (this.pushupState === "UP") {
        this.pushupState = "DOWN";
        this.pushupLowestScore = 100;
      }
      if (currentScore < this.pushupLowestScore) {
        this.pushupLowestScore = currentScore;
      }
    } else if (elbowAngle > 150) {
      if (this.pushupState === "DOWN") {
        this.pushupState = "UP";
        if (this.pushupLowestScore === 100) {
          this.pushupReps++;
        }
      }
    }

    const feedback = issues.length === 0 ? "Good push-up form" : issues[0];
    const reportedScore = this.pushupState === "DOWN" ? this.pushupLowestScore : currentScore;
    
    return { score: reportedScore, issues, feedback, reps: this.pushupReps };
  }

  analyzePlank(keypoints) {
    if (!keypoints || keypoints.length === 0) return { score: 0, issues: ["No pose detected"], feedback: "No pose detected", reps: 0 };

    const shoulder = this.getLandmark(keypoints, 'left_shoulder');
    const hip = this.getLandmark(keypoints, 'left_hip');
    const ankle = this.getLandmark(keypoints, 'left_ankle');

    if (!shoulder || !hip || !ankle) {
      return { score: 0, issues: ["Partial pose detected"], feedback: "Partial pose detected", reps: 0 };
    }

    const bodyAngle = this.calculateAngle(shoulder, hip, ankle);
    const issues = [];

    if (bodyAngle < 165) issues.push("Lower your hips");
    else if (bodyAngle > 195) issues.push("Raise your hips");

    let currentScore = 100 - (issues.length * 20);
    currentScore = Math.max(0, Math.min(100, currentScore));

    const feedback = issues.length === 0 ? "Good plank form" : issues[0];
    return { score: currentScore, issues, feedback, reps: 0 };
  }

  analyzeLunge(keypoints) {
    if (!keypoints || keypoints.length === 0) return { score: 0, issues: ["No pose detected"], feedback: "No pose detected", reps: this.lungeReps };

    const leftHip = this.getLandmark(keypoints, 'left_hip');
    const leftKnee = this.getLandmark(keypoints, 'left_knee');
    const leftAnkle = this.getLandmark(keypoints, 'left_ankle');

    if (!leftHip || !leftKnee || !leftAnkle) {
      return { score: 0, issues: ["Partial pose detected"], feedback: "Partial pose detected", reps: this.lungeReps };
    }

    const kneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    const issues = [];

    if (kneeAngle > 110) issues.push("Drop your back knee lower");

    let currentScore = 100 - (issues.length * 20);
    currentScore = Math.max(0, Math.min(100, currentScore));

    if (kneeAngle < 100) {
      if (this.lungeState === "UP") {
        this.lungeState = "DOWN";
        this.lungeLowestScore = 100;
      }
      if (currentScore < this.lungeLowestScore) {
        this.lungeLowestScore = currentScore;
      }
    } else if (kneeAngle > 150) {
      if (this.lungeState === "DOWN") {
        this.lungeState = "UP";
        if (this.lungeLowestScore === 100) {
          this.lungeReps++;
        }
      }
    }

    const feedback = issues.length === 0 ? "Good lunge form" : issues[0];
    const reportedScore = this.lungeState === "DOWN" ? this.lungeLowestScore : currentScore;

    return { score: reportedScore, issues, feedback, reps: this.lungeReps };
  }

  analyzeJumpingJack(keypoints) {
    if (!keypoints || keypoints.length === 0) return { score: 0, issues: ["No pose detected"], feedback: "No pose detected", reps: this.jjReps };

    const leftAnkle = this.getLandmark(keypoints, 'left_ankle');
    const rightAnkle = this.getLandmark(keypoints, 'right_ankle');
    const leftWrist = this.getLandmark(keypoints, 'left_wrist');
    const rightWrist = this.getLandmark(keypoints, 'right_wrist');

    if (!leftAnkle || !rightAnkle || !leftWrist || !rightWrist) {
      return { score: 0, issues: ["Partial pose detected"], feedback: "Partial pose detected", reps: this.jjReps };
    }

    const feetDistance = Math.abs(leftAnkle.x - rightAnkle.x);
    const handsDistance = Math.abs(leftWrist.x - rightWrist.x);
    
    const issues = [];
    if (feetDistance < 50 && handsDistance > 100) issues.push("Coordinate arms and legs");

    let currentScore = 100 - (issues.length * 20);
    currentScore = Math.max(0, Math.min(100, currentScore));

    if (handsDistance > 150 && feetDistance > 100) {
      if (this.jjState === "CLOSED") {
        this.jjState = "OPEN";
        this.jjLowestScore = 100;
      }
      if (currentScore < this.jjLowestScore) {
        this.jjLowestScore = currentScore;
      }
    } else if (handsDistance < 100 && feetDistance < 50) {
      if (this.jjState === "OPEN") {
        this.jjState = "CLOSED";
        if (this.jjLowestScore === 100) {
          this.jjReps++;
        }
      }
    }

    const feedback = issues.length === 0 ? "Good jumping jack form" : issues[0];
    const reportedScore = this.jjState === "OPEN" ? this.jjLowestScore : currentScore;

    return { score: reportedScore, issues, feedback, reps: this.jjReps };
  }
}

export default new FormAnalyzer();
