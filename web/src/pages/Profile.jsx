import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Activity, Dumbbell } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    let unsubscribeProfile;
    let unsubscribeSessions;

    async function setupListeners() {
      try {
        const token = await currentUser.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
        
        const profileRes = await axios.get(`${API_URL}/api/users/profile`, { headers });
        
        unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          }
        }, (err) => {
          console.error("Profile snapshot error:", err);
          // Fallback to REST API if Firestore rules block us
          setProfile(profileRes.data);
          setLoading(false);
        });

        const q = query(
          collection(db, 'sessions'),
          where('userId', '==', currentUser.uid)
        );
        
        unsubscribeSessions = onSnapshot(q, (snapshot) => {
          const sessionsList = [];
          snapshot.forEach(docSnap => sessionsList.push({ id: docSnap.id, ...docSnap.data() }));
          
          sessionsList.sort((a, b) => {
            const timeA = a.createdAt ? (a.createdAt.toMillis ? a.createdAt.toMillis() : a.createdAt.seconds * 1000) : 0;
            const timeB = b.createdAt ? (b.createdAt.toMillis ? b.createdAt.toMillis() : b.createdAt.seconds * 1000) : 0;
            return timeB - timeA;
          });
          
          setSessions(sessionsList);
          setLoading(false);
        }, async (err) => {
          console.error("Sessions snapshot error:", err);
          // Fallback to REST API if Firestore rules block us
          try {
            const sessionsRes = await axios.get(`${API_URL}/api/sessions`, { headers });
            setSessions(sessionsRes.data);
          } catch (restErr) {
            console.error("REST fallback failed:", restErr);
          }
          setLoading(false);
        });

      } catch (error) {
        console.error("Error setting up real-time listeners:", error);
        setLoading(false);
      }
    }
    
    if (currentUser) {
      setupListeners();
    }
    
    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeSessions) unsubscribeSessions();
    };
  }, [currentUser]);

  const avgScore = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length) 
    : 0;

  return (
    <div className="profile-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>User Profile</h2>
        <button onClick={() => setIsModalOpen(true)} className="glass-button" style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Edit Profile
        </button>
      </div>
      <p>Manage your account settings and view your overall statistics.</p>
      
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Name</label>
          <div style={{ padding: '12px', background: 'var(--bg-dark)', borderRadius: '4px' }}>{profile?.name || currentUser?.displayName || 'Athlete'}</div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
          <div style={{ padding: '12px', background: 'var(--bg-dark)', borderRadius: '4px' }}>{currentUser?.email || ''}</div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Weight</label>
          <div style={{ padding: '12px', background: 'var(--bg-dark)', borderRadius: '4px' }}>{profile?.weight || 'Not Set'}</div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Progress/Notes</label>
          <div style={{ padding: '12px', background: 'var(--bg-dark)', borderRadius: '4px' }}>{profile?.progress || 'No notes added'}</div>
        </div>
      </div>


      <h3>Your Lifetime Statistics</h3>
      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'var(--primary-cyan-dim)', padding: '16px', borderRadius: '12px' }}>
              <Activity size={32} color="var(--primary-cyan)" />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Total Sessions</p>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '28px' }}>{Math.floor(sessions.length / 5)}</h2>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'var(--primary-cyan-dim)', padding: '16px', borderRadius: '12px' }}>
              <Dumbbell size={32} color="var(--primary-cyan)" />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Avg Form %</p>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '28px' }}>{sessions.length > 0 ? `${avgScore}%` : '0%'}</h2>
            </div>
          </div>
        </div>
      )}
      
      <ProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        profile={profile}
        onProfileUpdated={setProfile}
        onShowToast={(msg, type) => setToast({ show: true, message: msg, type })}
      />
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', padding: '12px 24px', background: toast.type === 'error' ? 'var(--error-red)' : 'var(--primary-cyan)', color: '#fff', borderRadius: '8px', zIndex: 1000 }}>
          {toast.message}
          <button onClick={() => setToast({ ...toast, show: false })} style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>x</button>
        </div>
      )}
    </div>
  );
}

export default Profile;
