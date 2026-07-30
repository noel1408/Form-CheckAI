import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

import '../models/workout_session.dart';

class LocalSessionStore {
  LocalSessionStore._();

  static final LocalSessionStore instance = LocalSessionStore._();

  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;

    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, 'formcheck_ai.db');

    _database = await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE sessions (
            local_id INTEGER PRIMARY KEY AUTOINCREMENT,
            firebase_id TEXT,
            user_id TEXT NOT NULL,
            exercise TEXT NOT NULL,
            score INTEGER NOT NULL,
            duration_seconds INTEGER NOT NULL,
            issues TEXT NOT NULL,
            created_at TEXT NOT NULL,
            synced INTEGER NOT NULL DEFAULT 0
          )
        ''');
      },
    );

    return _database!;
  }

  Future<WorkoutSession> saveSession(WorkoutSession session) async {
    final db = await database;
    final id = await db.insert('sessions', session.toLocalMap());
    return session.copyWith(localId: id);
  }

  Future<List<WorkoutSession>> getRecentSessions() async {
    final db = await database;
    final rows = await db.query(
      'sessions',
      orderBy: 'created_at DESC',
      limit: 20,
    );
    return rows.map(WorkoutSession.fromLocalMap).toList();
  }

  Future<List<WorkoutSession>> getAllSessions() async {
    final db = await database;
    final rows = await db.query('sessions', orderBy: 'created_at DESC');
    return rows.map(WorkoutSession.fromLocalMap).toList();
  }

  Future<List<WorkoutSession>> getUnsyncedSessions() async {
    final db = await database;
    final rows = await db.query(
      'sessions',
      where: 'synced = ?',
      whereArgs: [0],
      orderBy: 'created_at ASC',
    );
    return rows.map(WorkoutSession.fromLocalMap).toList();
  }

  Future<void> markSynced({
    required int localId,
    required String firebaseId,
  }) async {
    final db = await database;
    await db.update(
      'sessions',
      {'synced': 1, 'firebase_id': firebaseId},
      where: 'local_id = ?',
      whereArgs: [localId],
    );
  }
}
