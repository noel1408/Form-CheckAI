import 'dart:convert';

class WorkoutSession {
  const WorkoutSession({
    this.localId,
    this.firebaseId,
    required this.userId,
    required this.exercise,
    required this.score,
    required this.durationSeconds,
    required this.issues,
    required this.createdAt,
    this.synced = false,
  });

  final int? localId;
  final String? firebaseId;
  final String userId;
  final String exercise;
  final int score;
  final int durationSeconds;
  final List<String> issues;
  final DateTime createdAt;
  final bool synced;

  WorkoutSession copyWith({
    int? localId,
    String? firebaseId,
    String? userId,
    String? exercise,
    int? score,
    int? durationSeconds,
    List<String>? issues,
    DateTime? createdAt,
    bool? synced,
  }) {
    return WorkoutSession(
      localId: localId ?? this.localId,
      firebaseId: firebaseId ?? this.firebaseId,
      userId: userId ?? this.userId,
      exercise: exercise ?? this.exercise,
      score: score ?? this.score,
      durationSeconds: durationSeconds ?? this.durationSeconds,
      issues: issues ?? this.issues,
      createdAt: createdAt ?? this.createdAt,
      synced: synced ?? this.synced,
    );
  }

  Map<String, Object?> toLocalMap() {
    return {
      'local_id': localId,
      'firebase_id': firebaseId,
      'user_id': userId,
      'exercise': exercise,
      'score': score,
      'duration_seconds': durationSeconds,
      'issues': jsonEncode(issues),
      'created_at': createdAt.toIso8601String(),
      'synced': synced ? 1 : 0,
    };
  }

  factory WorkoutSession.fromLocalMap(Map<String, Object?> map) {
    return WorkoutSession(
      localId: map['local_id'] as int?,
      firebaseId: map['firebase_id'] as String?,
      userId: map['user_id'] as String,
      exercise: map['exercise'] as String,
      score: map['score'] as int,
      durationSeconds: map['duration_seconds'] as int,
      issues: List<String>.from(jsonDecode(map['issues'] as String) as List),
      createdAt: DateTime.parse(map['created_at'] as String),
      synced: (map['synced'] as int) == 1,
    );
  }

  Map<String, Object?> toFirestoreMap() {
    return {
      'userId': userId,
      'exercise': exercise,
      'score': score,
      'durationSeconds': durationSeconds,
      'issues': issues,
      'createdAt': createdAt,
    };
  }
}
