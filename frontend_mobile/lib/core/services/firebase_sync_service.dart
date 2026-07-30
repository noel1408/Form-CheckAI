import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/workout_session.dart';
import 'local_session_store.dart';

class FirebaseSyncService {
  FirebaseSyncService({
    FirebaseAuth? auth,
    FirebaseFirestore? firestore,
    Connectivity? connectivity,
    LocalSessionStore? localStore,
  }) : this._internal(
          auth,
          firestore,
          connectivity ?? Connectivity(),
          localStore ?? LocalSessionStore.instance,
        );

  FirebaseSyncService._internal(
    this._auth,
    this._firestore,
    this._connectivity,
    this._localStore,
  );

  final FirebaseAuth? _auth;
  final FirebaseFirestore? _firestore;
  final Connectivity _connectivity;
  final LocalSessionStore _localStore;

  bool get isConfigured => _auth != null && _firestore != null;

  Future<void> syncPendingSessions() async {
    final auth = _auth;
    final firestore = _firestore;
    if (auth == null || firestore == null) return;

    final connections = await _connectivity.checkConnectivity();
    if (connections.contains(ConnectivityResult.none)) return;

    final user = auth.currentUser;
    if (user == null) return;

    final pendingSessions = await _localStore.getUnsyncedSessions();
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

      final doc = await firestore.collection('sessions').add(sessionForUser.toFirestoreMap());
      final localId = session.localId;
      if (localId != null) {
        await _localStore.markSynced(localId: localId, firebaseId: doc.id);
      }
    }
  }
}
