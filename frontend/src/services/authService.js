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

  register: async (email, password, full_name, role = 'psychologist') => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        full_name,
        role,
      });
      return response.data;
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

  // Админские методы
  getAllPsychologists: async () => {
    const response = await api.get('/users/?role=psychologist');
    return response.data;
  },

  createPsychologist: async (email, password, full_name) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name,
      role: 'psychologist',
    });
    return response.data;
  },

  updatePsychologist: async (id, updates) => {
    const response = await api.patch(`/users/${id}`, updates);
    return response.data;
  },

  deletePsychologist: async (id) => {
    await api.delete(`/users/${id}`);
  },

  extendAccess: async (id, days = 30) => {
    const response = await api.patch(`/users/${id}/extend-access?days=${days}`);
    return response.data;
  },

  blockPsychologist: async (id) => {
    const response = await api.patch(`/users/${id}/block`);
    return response.data;
  },

  unblockPsychologist: async (id) => {
    const response = await api.patch(`/users/${id}/unblock`);
    return response.data;
  },
};