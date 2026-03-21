import api from './api';

export const authService = {
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      const message = error.response?.data?.detail || 'Ошибка входа';
      throw new Error(message);
    }
  },

  register: async (email, password, role, name) => {
    try {
      const response = await api.post('/auth/register', { email, password, role, name });
      const { access_token, user } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      const message = error.response?.data?.detail || 'Ошибка регистрации';
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  updateProfile: async (userId, updates) => {
    const response = await api.patch(`/users/${userId}`, updates);
    const updatedUser = response.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  // Админские методы для управления психологами
  getAllPsychologists: async () => {
    const response = await api.get('/admin/psychologists');
    return response.data;
  },

  createPsychologist: async (email, password, name) => {
    const response = await api.post('/admin/psychologists', { email, password, name });
    return response.data;
  },

  updatePsychologist: async (id, updates) => {
    const response = await api.patch(`/admin/psychologists/${id}`, updates);
    return response.data;
  },

  deletePsychologist: async (id) => {
    await api.delete(`/admin/psychologists/${id}`);
  },
};