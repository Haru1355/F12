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
      <div className="container">
        <Link to="/" className="navbar-brand">ПрофДНК</Link>
        <div className="navbar-nav">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Вход</Link>
              <Link to="/register" className="nav-link">Регистрация</Link>
            </>
          ) : (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">Админ панель</Link>
              )}
              {user.role === 'psychologist' && (
                <Link to="/psychologist" className="nav-link">Мой кабинет</Link>
              )}
              <button onClick={handleLogout} className="btn btn-outline">Выйти</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};