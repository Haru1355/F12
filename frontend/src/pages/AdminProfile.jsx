import { useAuth } from '../contexts/AuthContext';

export const AdminProfile = () => {
  const { user } = useAuth();

  if (!user) return <div className="container">Загрузка...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
            {user.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <h1>{user.full_name}</h1>
            <p style={{ color: '#64748b' }}>{user.email}</p>
            <p><span style={{ background: '#e0e7ff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>Администратор</span></p>
          </div>
        </div>
        <div>
          <p><strong>Дата регистрации:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};