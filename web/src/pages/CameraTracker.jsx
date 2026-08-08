import React, { useRef, useEffect, useState } from 'react';
import FormAnalyzer from '../lib/FormAnalyzer';

// We use window.tf and window.poseDetection loaded from index.html CDN
// to bypass Vite's strict ESM bundler issues with mediapipe.

const CameraTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const [currentExercise, setCurrentExercise] = useState('Squat');
  const [exerciseStats, setExerciseStats] = useState({
    score: 100,
    issues: [],
    feedback: 'Waiting for pose...',
    reps: 0
  });

  useEffect(() => {
    // Initialize Pose Detection model
    const initModel = async () => {
      if (!window.tf || !window.poseDetection) {
        console.error("TensorFlow not loaded from CDN yet");
        setTimeout(initModel, 500);
        return;
      }
      
      await window.tf.ready();
      const detectorConfig = { modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      const newDetector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      setDetector(newDetector);
    };
    initModel();

    return () => {
      // Cleanup camera on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraActive(true);
          detectPose();
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const drawKeypoints = (keypoints, ctx) => {
    keypoints.forEach(keypoint => {
      if (keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#00F0FF';
        ctx.fill();
        ctx.stroke();
      }
    });
  };

  const detectPose = async () => {
    if (
      videoRef.current &&
      detector &&
      videoRef.current.readyState === 4
    ) {
      const video = videoRef.current;
      const poses = await detector.estimatePoses(video);
      
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        drawKeypoints(keypoints, ctx);
        
        let stats;
        switch (currentExercise) {
          case 'Squat': stats = FormAnalyzer.analyzeSquat(keypoints); break;
          case 'Pushup': stats = FormAnalyzer.analyzePushup(keypoints); break;
          case 'Plank': stats = FormAnalyzer.analyzePlank(keypoints); break;
          case 'Lunge': stats = FormAnalyzer.analyzeLunge(keypoints); break;
          case 'Jumping Jack': stats = FormAnalyzer.analyzeJumpingJack(keypoints); break;
          default: stats = FormAnalyzer.analyzeSquat(keypoints);
        }
        setExerciseStats(stats);
      } else {
        setExerciseStats(prev => ({ ...prev, feedback: 'No pose detected' }));
      }
    }
    
    // Loop
    if (videoRef.current && videoRef.current.srcObject) {
      requestAnimationFrame(detectPose);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Web Camera Tracker</h1>
          <p className="text-text-secondary">
            This tracks your pose directly in the browser using your laptop webcam.
          </p>
        </div>
        
        <div className="bg-glass-morphism p-3 rounded-lg shadow-md border border-cyan/30">
          <label className="text-sm text-text-secondary mr-3 font-semibold">Exercise:</label>
          <select 
            value={currentExercise}
            onChange={(e) => setCurrentExercise(e.target.value)}
            className="bg-background text-text-primary border border-cyan/50 rounded p-2 outline-none focus:border-primary-cyan"
          >
            <option value="Squat">Squat</option>
            <option value="Pushup">Push-up</option>
            <option value="Plank">Plank</option>
            <option value="Lunge">Lunge</option>
            <option value="Jumping Jack">Jumping Jack</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {!isCameraActive && (
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-primary-cyan text-background rounded-full font-bold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-cyan/50"
            disabled={!detector}
          >
            {detector ? 'Start Camera' : 'Loading Tracker Model...'}
          </button>
        )}

        <div className="relative mt-8 rounded-xl overflow-hidden shadow-2xl shadow-cyan/20 glassmorphism p-2">
          <video
            ref={videoRef}
            className="rounded-lg bg-black"
            width="640"
            height="480"
            playsInline
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            className="absolute top-0 left-0 rounded-lg w-full h-full"
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {isCameraActive && (
            <div className="absolute top-4 left-4 bg-black/60 p-4 rounded-xl backdrop-blur-sm border border-cyan/20 pointer-events-none">
              <div className="text-4xl font-bold text-primary-cyan mb-2">
                Reps: {exerciseStats.reps}
              </div>
              <div className="text-lg text-white mb-1">
                Score: <span className={exerciseStats.score > 80 ? 'text-green-400' : 'text-yellow-400'}>{Math.round(exerciseStats.score)}/100</span>
              </div>
              <div className="text-md text-gray-300 font-medium">
                {exerciseStats.feedback}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraTracker;
