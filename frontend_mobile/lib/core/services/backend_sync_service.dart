import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;

import '../models/workout_session.dart';
import 'local_session_store.dart';

class BackendSyncService {
  BackendSyncService({
    FirebaseAuth? auth,
    Connectivity? connectivity,
    LocalSessionStore? localStore,
  }) : this._internal(
          auth,
          connectivity ?? Connectivity(),
          localStore ?? LocalSessionStore.instance,
        );

  BackendSyncService._internal(
    this._auth,
    this._connectivity,
    this._localStore,
  );

  final FirebaseAuth? _auth;
  final Connectivity _connectivity;
  final LocalSessionStore _localStore;

  // Placeholder for the real backend URL
  static const String _backendUrl = 'https://form-checkai.onrender.com/api';

  bool get isConfigured => _auth != null;

  Future<void> syncPendingSessions() async {
    final auth = _auth;
    if (auth == null) return;

    final connections = await _connectivity.checkConnectivity();
    if (connections.contains(ConnectivityResult.none)) return;

    final user = auth.currentUser;
    if (user == null) return;

    final pendingSessions = await _localStore.getUnsyncedSessions();
    if (pendingSessions.isEmpty) return;

    final token = await user.getIdToken();
    if (token == null) return;

    for (final session in pendingSessions) {
      final sessionForUser = WorkoutSession(
        localId: session.localId,
        firebaseId: session.firebaseId,
        userId: user.uid,
        exercise: session.exercise,
        score: session.score,
        durationSeconds: session.durationSeconds,
        issues: session.issues,
        createdAt: session.createdAt,
        synced: session.synced,
      );

      final response = await http.post(
        Uri.parse('$_backendUrl/sessions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(sessionForUser.toFirestoreMap()),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final firebaseId = data['id'];
        final localId = session.localId;
        if (localId != null) {
          await _localStore.markSynced(localId: localId, firebaseId: firebaseId);
        }
      } else {
        print('Failed to sync session: ${response.body}');
      }
    }
  }
}
