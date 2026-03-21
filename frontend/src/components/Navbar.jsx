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
        <Link to="/" className="navbar-brand">ПсихоПлатформа</Link>
        <div className="navbar-nav">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Вход</Link>
              <Link to="/register" className="nav-link">Регистрация</Link>
            </>
          ) : (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/profile" className="nav-link">Мой профиль</Link>
                  <Link to="/admin" className="nav-link">Психологи</Link>
                  <Link to="/admin/tests" className="nav-link">Все тесты</Link>
                  <Link to="/admin/sessions" className="nav-link">Сессии</Link>
                </>
              )}
              {user.role === 'psychologist' && (
                <>
                  <Link to="/psychologist/profile" className="nav-link">Мой профиль</Link>
                  <Link to="/psychologist" className="nav-link">Опросы</Link>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-outline">Выйти</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};