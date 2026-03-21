import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

export const Login = () => {
  const [access_token] = useState('');
  const [user] = useState('');
  const [, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const handleSubmit = async (e) => {
    e.preventDefault();
     
    const result = await login(access_token, user );
    if (result.success) {
      const user = authService.getCurrentUser();
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'psychologist') navigate('/psychologist');
      else navigate('/');
    } else {
      setError(result.error);
    }
  };

  // ... остальной JSX
};