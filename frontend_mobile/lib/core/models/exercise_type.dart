enum ExerciseType {
  squat('Squat', 'Keep knees stable and reach proper depth.'),
  pushup('Push-up', 'Keep a straight body line and controlled elbows.'),
  plank('Plank', 'Keep hips level and core engaged.');

  const ExerciseType(this.label, this.description);

  final String label;
  final String description;
}
