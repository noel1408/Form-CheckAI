import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

function Upload() {
  const [file, setFile] = useState(null);
  const [exercise, setExercise] = useState('squat');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (file && currentUser) {
      setUploading(true);
      try {
        const simulatedScore = Math.floor(Math.random() * (95 - 60 + 1) + 60);
        
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        
        await addDoc(collection(db, 'sessions'), {
          userId: currentUser.uid,
          exercise: exercise,
          score: simulatedScore,
          feedback: "Good depth, keep your chest up.",
          issues: ["Slight forward lean"],
          reps: 12,
          createdAt: serverTimestamp()
        });
        
        setSuccess(true);
        setFile(null);
      } catch (err) {
        console.error("Failed to upload session", err);
        alert("Failed to upload session: " + err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Workout Video</h2>
      <p>Upload a video of your exercise to receive AI form feedback.</p>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="exercise-select" style={{ display: 'block', marginBottom: '8px' }}>Select Exercise:</label>
        <select 
          id="exercise-select" 
          value={exercise} 
          onChange={(e) => setExercise(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', width: '100%', maxWidth: '300px' }}
        >
          <option value="squat">Squat</option>
          <option value="pushup">Push-up</option>
          <option value="plank">Plank</option>
          <option value="lunge">Lunge</option>
          <option value="jumping_jack">Jumping Jacks</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input type="file" accept="video/*" onChange={handleFileChange} />
      </div>
      
      <button onClick={handleUpload} disabled={!file || uploading} className="glass-button" style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {uploading ? 'Analyzing...' : success ? <><CheckCircle size={18} /> Done!</> : 'Analyze Form'}
      </button>
    </div>
  );
}

export default Upload;
