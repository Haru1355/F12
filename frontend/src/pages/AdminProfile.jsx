import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// eslint-disable-next-line no-unused-vars
import { authService } from '../services/authService';

export const AdminProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      const users = JSON.parse(localStorage.getItem('psych_users'));
      const fullUser = users.find(u => u.id === user.id);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (fullUser) setProfile(fullUser);
    }
  }, [user]);

  if (!profile) return <div className="container">Загрузка...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
            {profile.name.charAt(0)}
          </div>
          <div>
            <h1>{profile.name}</h1>
            <p style={{ color: '#64748b' }}>{profile.email}</p>
            <p><span style={{ background: '#e0e7ff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>Администратор</span></p>
          </div>
        </div>
        <div>
          <p><strong>Дата регистрации:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};