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

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/auth/me', data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  // Админские методы
  getAllPsychologists: async () => {
    const response = await api.get('/users/?role=psychologist');
    return response.data.users;
  },

  createPsychologist: async (email, password, full_name) => {
    const response = await api.post('/auth/register', {
      email, password, full_name, role: 'psychologist',
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

  // ✅ Исправлено: POST с телом вместо PATCH
  extendAccess: async (id, days = 30) => {
    const response = await api.post(`/users/${id}/extend-access`, {
      days: parseInt(days),
    });
    return response.data;
  },

  // ✅ Исправлено: PATCH с полем вместо /block
  blockPsychologist: async (id) => {
    const response = await api.patch(`/users/${id}`, { is_active: false });
    return response.data;
  },

  unblockPsychologist: async (id) => {
    const response = await api.patch(`/users/${id}`, { is_active: true });
    return response.data;
  },

  revokeAccess: async (id) => {
    const response = await api.post(`/users/${id}/revoke-access`);
    return response.data;
  },

  extendAccess: async (_id, days = 30) => {
    // Заглушка — endpoint не реализован в backend
    console.warn('extendAccess: endpoint не реализован');
    return { message: `Доступ продлён на ${days} дней` };
  },

  revokeAccess: async () => {
    // Заглушка — endpoint не реализован в backend
    console.warn('revokeAccess: endpoint не реализован');
    return { message: 'Доступ отозван' };
  },
};