import 'package:flutter/material.dart';

import '../../core/models/workout_session.dart';
import '../../shared/widgets/score_badge.dart';
import '../home/home_screen.dart';

class SessionResultScreen extends StatelessWidget {
  const SessionResultScreen({super.key, required this.session});

  final WorkoutSession session;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Session result')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        session.exercise.toUpperCase(),
                        style: const TextStyle(
                          color: Color(0xFF7DD3FC),
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                        ),
                      ),
                      ScoreBadge(score: session.score),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    _resultTitle(session.score),
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Duration: ${session.durationSeconds}s',
                    style: const TextStyle(color: Colors.white70),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Issues detected',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            if (session.issues.isEmpty)
              const _IssueTile(icon: Icons.check_circle, text: 'No major issues detected')
            else
              for (final issue in session.issues) _IssueTile(icon: Icons.warning_amber_rounded, text: issue),
            const SizedBox(height: 20),
            const _SyncInfoCard(),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const HomeScreen()),
                  (route) => false,
                );
              },
              icon: const Icon(Icons.home),
              label: const Text('Back to home'),
            ),
          ],
        ),
      ),
    );
  }

  String _resultTitle(int score) {
    if (score >= 90) return 'Great form';
    if (score >= 75) return 'Good start';
    return 'Needs correction';
  }
}

class _IssueTile extends StatelessWidget {
  const _IssueTile({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFF111827),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF7DD3FC)),
        title: Text(text),
      ),
    );
  }
}

class _SyncInfoCard extends StatelessWidget {
  const _SyncInfoCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.cloud_off, color: Colors.white70),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'Saved locally. Firebase sync will activate after Firebase config and login are added.',
              style: TextStyle(color: Colors.white70),
            ),
          ),
        ],
      ),
    );
  }
}
