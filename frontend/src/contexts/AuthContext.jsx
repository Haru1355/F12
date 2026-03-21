import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем, есть ли сохранённый пользователь
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await authService.login(email, password);
    if (userData) {
      setUser(userData);
      return { success: true };
    }
    return { success: false, error: 'Неверный email или пароль' };
  };

  const register = async (email, password, role, name) => {
    // Для простоты регистрация возможна только как психолог (администратор создаётся отдельно)
    if (role === 'admin') {
      return { success: false, error: 'Регистрация администратора недоступна' };
    }
    const result = await authService.register(email, password, role, name);
    if (result.success) {
      // После регистрации автоматически логиним
      return await login(email, password);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};