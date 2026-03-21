const USERS_KEY = 'psych_users';
const CURRENT_USER_KEY = 'psych_current_user';

// Начальные данные: создаём администратора по умолчанию
const initUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    const defaultAdmin = {
      id: '1',
      email: 'admin@example.com',
      password: 'admin123', // в реальности хэшируем
      role: 'admin',
      name: 'Администратор'
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
  }
};

export const authService = {
  getCurrentUser: () => {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  login: async (email, password) => {
    initUsers();
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      // Не сохраняем пароль в сессии
      const {  ...safeUser } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
      return safeUser;
    }
    return null;
  },

  register: async (email, password, role, name) => {
    initUsers();
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email уже используется' };
    }
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      role,
      name
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};