import React, { useState } from 'react';
import { X, Save, User } from 'lucide-react';
import axios from 'axios';

export default function ProfileModal({ isOpen, onClose, currentUser, profile, onProfileUpdated, onShowToast }) {
  const [name, setName] = useState(profile?.name || currentUser?.displayName || '');
  const [fitnessGoal, setFitnessGoal] = useState(profile?.fitnessGoal || '');
  const [weight, setWeight] = useState(profile?.weight || '');
  const [progress, setProgress] = useState(profile?.progress || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || "https://form-checkai.onrender.com";
      
      const response = await axios.put(`${API_URL}/api/users/profile`, { name, fitnessGoal, weight, progress }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onProfileUpdated({ ...profile, name, fitnessGoal, weight, progress });
      onShowToast('Profile saved successfully!', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      onShowToast('Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', position: 'relative' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <X size={24} color="var(--text-secondary)" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--primary-cyan-dim)', padding: '8px', borderRadius: '8px' }}>
            <User size={24} color="var(--primary-cyan)" />
          </div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Edit Profile</h2>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Display Name</label>
            <input
              type="text"
              className="glass-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Fitness Goal</label>
            <select
              className="glass-input"
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value)}
              style={{ appearance: 'none', background: 'var(--bg-dark)' }}
            >
              <option value="">Select a goal...</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="flexibility">Flexibility</option>
              <option value="endurance">Endurance</option>
              <option value="general_fitness">General Fitness</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Weight (kg/lbs)</label>
            <input
              type="text"
              className="glass-input"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 75 kg"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Progress/Notes</label>
            <textarea
              className="glass-input"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="How is your progress going?"
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <button disabled={loading} type="submit" className="glass-button" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
