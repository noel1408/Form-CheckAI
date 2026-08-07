import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, User, Activity, Dumbbell, TrendingUp, Edit2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import Toast from '../components/Toast';
import ProfileModal from '../components/ProfileModal';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    let unsubscribeProfile;
    let unsubscribeSessions;

    async function setupListeners() {
      try {
        unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          }
        }, (err) => {
          console.error("Profile snapshot error:", err);
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
        }, (err) => {
          console.error("Sessions snapshot error:", err);
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

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  function showToast(message, type = 'success') {
    setToast({ show: true, message, type });
  }

  const totalExercises = sessions.length;
  const completedSessions = Math.floor(totalExercises / 5);
  const exercisesTowardsNext = totalExercises % 5;
  const nextSessionProgressPercent = (exercisesTowardsNext / 5) * 100;

  // Chart data: Group every 5 exercises into one Session
  // Sessions are fetched newest first, so we reverse them to plot oldest to newest
  const chartSessions = [...sessions].reverse();
  const groupedChartData = [];
  
  for (let i = 0; i < chartSessions.length; i += 5) {
    const chunk = chartSessions.slice(i, i + 5);
    if (chunk.length === 5) {
       const avg = chunk.reduce((acc, s) => acc + (s.score || 0), 0) / 5;
       const avgReps = chunk.reduce((acc, s) => acc + (s.reps || 0), 0) / 5;
       groupedChartData.push({
         name: `Session ${groupedChartData.length + 1}`,
         score: Math.round(avg),
         reps: Math.round(avgReps)
       });
    }
  }

  const avgScore = totalExercises > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalExercises) 
    : 0;

  const avgTotalReps = totalExercises > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.reps || 0), 0) / totalExercises)
    : 0;

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary-cyan)' }}>Loading Dashboard...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt="Profile" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--primary-cyan)' }} />
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary-cyan)' }}>
              <User size={32} color="var(--primary-cyan)" />
            </div>
          )}
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>Welcome back, {profile?.name || currentUser.displayName || 'Athlete'}</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{currentUser.email}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setIsModalOpen(true)} className="glass-button" style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary-cyan-dim)', border: '1px solid var(--primary-cyan)' }}>
            <Edit2 size={18} color="var(--primary-cyan)" /> <span style={{ color: 'var(--primary-cyan)' }}>Edit Profile</span>
          </button>
          <button onClick={handleLogout} className="glass-button" style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary-cyan-dim)', padding: '16px', borderRadius: '12px' }}>
            <Activity size={32} color="var(--primary-cyan)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Completed Sessions</p>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '28px' }}>{completedSessions}</h2>
              </div>
              <span style={{ color: 'var(--primary-cyan)', fontSize: '14px', fontWeight: 'bold' }}>
                {exercisesTowardsNext} / 5
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--border-glass)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
              <div style={{ width: `${nextSessionProgressPercent}%`, height: '100%', background: 'var(--primary-cyan)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary-cyan-dim)', padding: '16px', borderRadius: '12px' }}>
            <Dumbbell size={32} color="var(--primary-cyan)" />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Avg Form Score</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '28px' }}>{sessions.length > 0 ? `${avgScore}%` : 'N/A'}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary-cyan-dim)', padding: '16px', borderRadius: '12px' }}>
            <Activity size={32} color="var(--primary-cyan)" />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Avg Reps / Exercise</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '28px' }}>{sessions.length > 0 ? avgTotalReps : 'N/A'}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary-cyan-dim)', padding: '16px', borderRadius: '12px' }}>
            <User size={32} color="var(--primary-cyan)" />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Fitness Goal</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', textTransform: 'capitalize' }}>{profile?.fitnessGoal?.replace('_', ' ') || 'Not Set'}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary-cyan-dim)', padding: '16px', borderRadius: '12px' }}>
            <TrendingUp size={32} color="var(--primary-cyan)" />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Weight</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '20px' }}>{profile?.weight || 'Not Set'}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary-cyan-dim)', padding: '16px', borderRadius: '12px' }}>
            <Activity size={32} color="var(--primary-cyan)" />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Notes</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{profile?.progress || 'No notes added'}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <TrendingUp size={24} color="var(--primary-cyan)" />
          <h3 style={{ margin: 0, fontSize: '20px' }}>Performance Trend (Form Score)</h3>
        </div>
        
        {groupedChartData.length > 0 ? (
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={groupedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-cyan)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--primary-cyan)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--primary-cyan)' }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--primary-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <Activity size={48} color="var(--text-secondary)" opacity={0.5} />
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No full sessions recorded yet. Complete 5 exercises to see your progress!</p>
          </div>
        )}
      </div>

      <ProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        profile={profile}
        onProfileUpdated={setProfile}
        onShowToast={showToast}
      />

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
    </div>
  );
}
