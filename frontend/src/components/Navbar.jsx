import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="navbar-brand">ПрофДНК</Link>
        <div className="navbar-nav" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!user ? (
            <Link to="/login" className="nav-link">Вход</Link>
          ) : (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className="nav-link">Панель админа</Link>
                  <Link to="/admin/profile" className="nav-link">Профиль</Link>
                </>
              )}
              {user.role === 'psychologist' && (
                <>
                  <Link to="/psychologist" className="nav-link">Мои тесты</Link>
                  <Link to="/psychologist/profile" className="nav-link">Профиль</Link>
                </>
              )}
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{user.full_name}</span>
              <button onClick={handleLogout} className="btn btn-outline">Выйти</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};