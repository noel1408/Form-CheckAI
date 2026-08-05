import React, { useState } from 'react';

function Upload() {
  const [file, setFile] = useState(null);
  const [exercise, setExercise] = useState('squat');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      console.log(`Uploading file for ${exercise} analysis...`, file);
      // Implement upload logic here
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
      
      <button onClick={handleUpload} disabled={!file} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Analyze Form
      </button>
    </div>
  );
}

export default Upload;
