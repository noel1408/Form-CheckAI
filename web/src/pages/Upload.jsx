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
        const token = await currentUser.getIdToken();
        const API_URL = import.meta.env.VITE_API_URL || "https://form-checkai.onrender.com";
        
        // Simulate a random score between 60 and 95
        const simulatedScore = Math.floor(Math.random() * (95 - 60 + 1) + 60);
        
        await axios.post(`${API_URL}/api/sessions`, {
          exerciseType: exercise,
          score: simulatedScore,
          notes: "Good depth, keep your chest up.",
          videoUrl: "simulated_url" // In a real app, upload to Firebase Storage first
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSuccess(true);
        setFile(null);
      } catch (err) {
        console.error("Failed to upload session", err);
        alert("Failed to upload session");
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
