import 'dart:async';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

import '../../core/models/exercise_type.dart';
import '../../core/models/workout_session.dart';
import '../../core/services/local_session_store.dart';
import '../result/session_result_screen.dart';

class LiveCameraScreen extends StatefulWidget {
  const LiveCameraScreen({super.key, required this.exercise});

  final ExerciseType exercise;

  @override
  State<LiveCameraScreen> createState() => _LiveCameraScreenState();
}

class _LiveCameraScreenState extends State<LiveCameraScreen> {
  CameraController? _controller;
  Future<void>? _initializeCamera;
  final FlutterTts _tts = FlutterTts();
  final Stopwatch _stopwatch = Stopwatch();
  List<CameraDescription> _cameras = [];
  CameraDescription? _selectedCamera;
  Timer? _timer;
  String _feedback = 'Get ready';
  int _score = 100;
  int _elapsedSeconds = 0;
  bool _isSwitchingCamera = false;

  @override
  void initState() {
    super.initState();
    _setupCamera();
    _startDemoSession();
  }

  Future<void> _setupCamera() async {
    try {
      final cameras = await availableCameras();
      if (!mounted) return;

      if (cameras.isEmpty) {
        setState(() => _feedback = 'No camera found');
        return;
      }

      _cameras = cameras;
      final camera =
          _findCamera(CameraLensDirection.front) ??
          _findCamera(CameraLensDirection.back) ??
          cameras.first;

      await _setCamera(camera);
    } catch (error) {
      if (!mounted) return;
      setState(() => _feedback = 'Camera error: $error');
    }
  }

  CameraDescription? _findCamera(CameraLensDirection direction) {
    for (final camera in _cameras) {
      if (camera.lensDirection == direction) return camera;
    }
    return null;
  }

  CameraDescription? _nextCameraAfter(CameraDescription? currentCamera) {
    if (_cameras.isEmpty) return null;
    if (currentCamera == null) return _cameras.first;

    final currentIndex = _cameras.indexWhere(
      (camera) => camera.name == currentCamera.name,
    );
    if (currentIndex == -1) return _cameras.first;

    return _cameras[(currentIndex + 1) % _cameras.length];
  }

  String get _cameraLabel {
    return switch (_selectedCamera?.lensDirection) {
      CameraLensDirection.front => 'Front',
      CameraLensDirection.back => 'Back',
      CameraLensDirection.external => 'External',
      null => 'Camera',
    };
  }

  Future<void> _setCamera(CameraDescription camera) async {
    final previousController = _controller;

    setState(() {
      _controller = null;
      _initializeCamera = null;
      _selectedCamera = camera;
    });

    await previousController?.dispose();

    final controller = CameraController(
      camera,
      ResolutionPreset.medium,
      enableAudio: false,
    );
    final initializeCamera = controller.initialize();

    if (!mounted) {
      await controller.dispose();
      return;
    }

    setState(() {
      _controller = controller;
      _initializeCamera = initializeCamera;
    });

    try {
      await initializeCamera;
    } catch (error) {
      if (!mounted) return;
      setState(() => _feedback = 'Camera error: $error');
    }
  }

  Future<void> _switchCamera() async {
    if (_isSwitchingCamera || _cameras.length < 2) return;

    setState(() => _isSwitchingCamera = true);

    try {
      final preferredDirection =
          _selectedCamera?.lensDirection == CameraLensDirection.front
          ? CameraLensDirection.back
          : CameraLensDirection.front;
      final nextCamera =
          _findCamera(preferredDirection) ?? _nextCameraAfter(_selectedCamera);

      if (nextCamera != null) {
        await _setCamera(nextCamera);
      }
    } finally {
      if (mounted) {
        setState(() => _isSwitchingCamera = false);
      }
    }
  }

  void _startDemoSession() {
    _stopwatch.start();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        _elapsedSeconds = _stopwatch.elapsed.inSeconds;
        if (_elapsedSeconds < 4) {
          _feedback = 'Stand fully in frame';
          _score = 100;
        } else if (_elapsedSeconds < 8) {
          _feedback = widget.exercise == ExerciseType.squat
              ? 'Go lower'
              : 'Keep your body straight';
          _score = 82;
        } else {
          _feedback = 'Good form';
          _score = 92;
        }
      });

      if (_elapsedSeconds == 4) {
        _tts.speak(_feedback);
      }
    });
  }

  Future<void> _finishSession() async {
    _timer?.cancel();
    _stopwatch.stop();

    final issues = _score >= 90 ? <String>[] : <String>[_feedback];
    final session = WorkoutSession(
      userId: 'local-user',
      exercise: widget.exercise.name,
      score: _score,
      durationSeconds: _elapsedSeconds,
      issues: issues,
      createdAt: DateTime.now(),
    );

    final savedSession = await LocalSessionStore.instance.saveSession(session);

    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => SessionResultScreen(session: savedSession),
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _stopwatch.stop();
    _controller?.dispose();
    _tts.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              child: _CameraPreview(
                controller: _controller,
                initializeCamera: _initializeCamera,
              ),
            ),
            Positioned.fill(
              child: IgnorePointer(
                child: CustomPaint(painter: _SkeletonGuidePainter()),
              ),
            ),
            Positioned(
              left: 16,
              right: 16,
              top: 16,
              child: _TopHud(
                exerciseLabel: widget.exercise.label,
                elapsedSeconds: _elapsedSeconds,
                score: _score,
              ),
            ),
            Positioned(
              right: 16,
              top: 72,
              child: _CameraSwitchButton(
                canSwitch: _cameras.length > 1,
                currentCameraLabel: _cameraLabel,
                isSwitching: _isSwitchingCamera,
                onSwitch: _switchCamera,
              ),
            ),
            Positioned(
              left: 16,
              right: 16,
              bottom: 16,
              child: _FeedbackPanel(
                feedback: _feedback,
                onFinish: _finishSession,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CameraPreview extends StatelessWidget {
  const _CameraPreview({
    required this.controller,
    required this.initializeCamera,
  });

  final CameraController? controller;
  final Future<void>? initializeCamera;

  @override
  Widget build(BuildContext context) {
    final controller = this.controller;
    final initializeCamera = this.initializeCamera;

    if (controller == null || initializeCamera == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return FutureBuilder<void>(
      future: initializeCamera,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text('Camera error: ${snapshot.error}'),
            ),
          );
        }
        return CameraPreview(controller);
      },
    );
  }
}

class _TopHud extends StatelessWidget {
  const _TopHud({
    required this.exerciseLabel,
    required this.elapsedSeconds,
    required this.score,
  });

  final String exerciseLabel;
  final int elapsedSeconds;
  final int score;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _HudPill(icon: Icons.fitness_center, label: exerciseLabel),
        ),
        const SizedBox(width: 10),
        _HudPill(icon: Icons.timer, label: '${elapsedSeconds}s'),
        const SizedBox(width: 10),
        _HudPill(icon: Icons.stars, label: '$score'),
      ],
    );
  }
}

class _HudPill extends StatelessWidget {
  const _HudPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.54),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

class _CameraSwitchButton extends StatelessWidget {
  const _CameraSwitchButton({
    required this.canSwitch,
    required this.currentCameraLabel,
    required this.isSwitching,
    required this.onSwitch,
  });

  final bool canSwitch;
  final String currentCameraLabel;
  final bool isSwitching;
  final VoidCallback onSwitch;

  @override
  Widget build(BuildContext context) {
    if (!canSwitch) return const SizedBox.shrink();

    return FilledButton.icon(
      onPressed: isSwitching ? null : onSwitch,
      style: FilledButton.styleFrom(
        backgroundColor: Colors.black.withValues(alpha: 0.62),
        foregroundColor: Colors.white,
        disabledBackgroundColor: Colors.black.withValues(alpha: 0.38),
        disabledForegroundColor: Colors.white70,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
      icon: isSwitching
          ? const SizedBox.square(
              dimension: 18,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.cameraswitch),
      label: Text('$currentCameraLabel camera'),
    );
  }
}

class _FeedbackPanel extends StatelessWidget {
  const _FeedbackPanel({required this.feedback, required this.onFinish});

  final String feedback;
  final VoidCallback onFinish;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF020617).withValues(alpha: 0.86),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              const Icon(Icons.record_voice_over, color: Color(0xFF7DD3FC)),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  feedback,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: onFinish,
              icon: const Icon(Icons.stop_circle),
              label: const Text('Finish session'),
            ),
          ),
        ],
      ),
    );
  }
}

class _SkeletonGuidePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF38BDF8).withValues(alpha: 0.72)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final centerX = size.width / 2;
    final head = Offset(centerX, size.height * 0.24);
    final neck = Offset(centerX, size.height * 0.34);
    final hip = Offset(centerX, size.height * 0.55);
    final leftShoulder = Offset(centerX - 62, size.height * 0.37);
    final rightShoulder = Offset(centerX + 62, size.height * 0.37);
    final leftKnee = Offset(centerX - 54, size.height * 0.72);
    final rightKnee = Offset(centerX + 54, size.height * 0.72);
    final leftAnkle = Offset(centerX - 70, size.height * 0.88);
    final rightAnkle = Offset(centerX + 70, size.height * 0.88);

    canvas.drawCircle(head, 22, paint);
    canvas.drawLine(neck, hip, paint);
    canvas.drawLine(leftShoulder, rightShoulder, paint);
    canvas.drawLine(hip, leftKnee, paint);
    canvas.drawLine(hip, rightKnee, paint);
    canvas.drawLine(leftKnee, leftAnkle, paint);
    canvas.drawLine(rightKnee, rightAnkle, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
