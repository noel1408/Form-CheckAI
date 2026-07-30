import 'package:flutter/material.dart';

import '../../core/models/workout_session.dart';
import '../../core/services/local_session_store.dart';
import '../../shared/widgets/score_badge.dart';

import 'package:firebase_auth/firebase_auth.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    await FirebaseAuth.instance.signOut();
    if (context.mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _logout(context),
          )
        ],
      ),
      body: SafeArea(
        child: FutureBuilder<List<WorkoutSession>>(
          future: LocalSessionStore.instance.getAllSessions(),
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text('Could not load profile: ${snapshot.error}'),
                ),
              );
            }

            final sessions = snapshot.data ?? const <WorkoutSession>[];
            final stats = _ProfileStats.fromSessions(sessions);

            return ListView(
              padding: const EdgeInsets.all(20),
              children: [
                _ProfileHeader(stats: stats),
                const SizedBox(height: 20),
                Text(
                  'Stats',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _StatsGrid(stats: stats),
                const SizedBox(height: 24),
                Text(
                  'Exercise history',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                if (sessions.isEmpty)
                  const _EmptyHistoryCard()
                else
                  for (final session in sessions) ...[
                    _HistoryTile(session: session),
                    const SizedBox(height: 10),
                  ],
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ProfileStats {
  const _ProfileStats({
    required this.totalSessions,
    required this.averageScore,
    required this.bestScore,
    required this.totalSeconds,
    required this.favoriteExercise,
    required this.lastSessionAt,
  });

  final int totalSessions;
  final int averageScore;
  final int bestScore;
  final int totalSeconds;
  final String favoriteExercise;
  final DateTime? lastSessionAt;

  int get totalMinutes => (totalSeconds / 60).ceil();

  factory _ProfileStats.fromSessions(List<WorkoutSession> sessions) {
    if (sessions.isEmpty) {
      return const _ProfileStats(
        totalSessions: 0,
        averageScore: 0,
        bestScore: 0,
        totalSeconds: 0,
        favoriteExercise: 'None yet',
        lastSessionAt: null,
      );
    }

    final exerciseCounts = <String, int>{};
    var totalScore = 0;
    var bestScore = 0;
    var totalSeconds = 0;

    for (final session in sessions) {
      totalScore += session.score;
      totalSeconds += session.durationSeconds;
      if (session.score > bestScore) bestScore = session.score;
      exerciseCounts.update(
        _formatExercise(session.exercise),
        (count) => count + 1,
        ifAbsent: () => 1,
      );
    }

    final favoriteExercise = exerciseCounts.entries.reduce((a, b) {
      return a.value >= b.value ? a : b;
    }).key;

    return _ProfileStats(
      totalSessions: sessions.length,
      averageScore: (totalScore / sessions.length).round(),
      bestScore: bestScore,
      totalSeconds: totalSeconds,
      favoriteExercise: favoriteExercise,
      lastSessionAt: sessions.first.createdAt,
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.stats});

  final _ProfileStats stats;

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    final displayName = user?.displayName ?? 'FormCheck User';
    final email = user?.email ?? 'Not logged in';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0EA5E9), Color(0xFF1E3A8A)],
        ),
        borderRadius: BorderRadius.circular(28),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 34,
            backgroundColor: Colors.white24,
            backgroundImage: user?.photoURL != null ? NetworkImage(user!.photoURL!) : null,
            child: user?.photoURL == null ? const Icon(Icons.person, size: 38, color: Colors.white) : null,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  displayName,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
                ),
                Text(
                  email,
                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                ),
                const SizedBox(height: 6),
                Text(
                  stats.lastSessionAt == null
                      ? 'Start your first workout session'
                      : 'Last workout: ${_formatDate(stats.lastSessionAt!)}',
                  style: const TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.stats});

  final _ProfileStats stats;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.25,
      children: [
        _StatCard(
          icon: Icons.fitness_center,
          label: 'Sessions',
          value: '${stats.totalSessions}',
        ),
        _StatCard(
          icon: Icons.stars,
          label: 'Avg score',
          value: '${stats.averageScore}',
        ),
        _StatCard(
          icon: Icons.emoji_events,
          label: 'Best score',
          value: '${stats.bestScore}',
        ),
        _StatCard(
          icon: Icons.timer,
          label: 'Training time',
          value: '${stats.totalMinutes} min',
        ),
        _StatCard(
          icon: Icons.repeat,
          label: 'Top exercise',
          value: stats.favoriteExercise,
          wideText: true,
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    this.wideText = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final bool wideText;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: const Color(0xFF7DD3FC)),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 4),
              Text(
                value,
                maxLines: wideText ? 2 : 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HistoryTile extends StatelessWidget {
  const _HistoryTile({required this.session});

  final WorkoutSession session;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFF111827),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 10,
        ),
        leading: CircleAvatar(
          backgroundColor: const Color(0xFF38BDF8).withValues(alpha: 0.16),
          child: const Icon(Icons.history, color: Color(0xFF7DD3FC)),
        ),
        title: Text(
          _formatExercise(session.exercise),
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            '${_formatDate(session.createdAt)} • ${session.durationSeconds}s • ${session.issues.length} issue${session.issues.length == 1 ? '' : 's'}',
          ),
        ),
        trailing: ScoreBadge(score: session.score),
      ),
    );
  }
}

class _EmptyHistoryCard extends StatelessWidget {
  const _EmptyHistoryCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(22),
      ),
      child: const Row(
        children: [
          Icon(Icons.insights, color: Color(0xFF7DD3FC)),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'No exercise history yet. Complete a session to see your stats here.',
              style: TextStyle(color: Colors.white70),
            ),
          ),
        ],
      ),
    );
  }
}

String _formatExercise(String value) {
  if (value.isEmpty) return 'Exercise';
  return value
      .replaceAll('_', ' ')
      .split(' ')
      .where((word) => word.isNotEmpty)
      .map((word) => '${word[0].toUpperCase()}${word.substring(1)}')
      .join(' ');
}

String _formatDate(DateTime date) {
  final localDate = date.toLocal();
  final month = localDate.month.toString().padLeft(2, '0');
  final day = localDate.day.toString().padLeft(2, '0');
  final hour = localDate.hour.toString().padLeft(2, '0');
  final minute = localDate.minute.toString().padLeft(2, '0');
  return '$day/$month/${localDate.year} $hour:$minute';
}
