import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, User, Activity, Dumbbell, TrendingUp, Edit2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    async function fetchData() {
      try {
        const token = await currentUser.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };
        const API_URL = import.meta.env.VITE_API_URL || "https://form-checkai.onrender.com";
        
        const [profileRes, sessionsRes] = await Promise.all([
          axios.get(`${API_URL}/api/users/profile`, { headers }),
          axios.get(`${API_URL}/api/sessions`, { headers })
        ]);

        setProfile(profileRes.data);
        setSessions(sessionsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (currentUser) {
      fetchData();
    }
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

  // Real data for the chart
  const chartData = sessions.map((s, i) => ({
    name: `Session ${i+1}`,
    score: s.score || 0,
  }));

  const avgScore = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length) 
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
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Total Sessions</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '28px' }}>{sessions.length}</h2>
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
        
        {sessions.length > 0 ? (
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No sessions recorded yet. Start training in the mobile app to see your progress!</p>
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
