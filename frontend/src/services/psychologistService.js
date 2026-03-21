const PSYCHOLOGISTS_KEY = 'psych_psychologists';
const SUBSCRIPTIONS_KEY = 'psych_subscriptions';

// Инициализация
export const initPsychologists = () => {
  if (!localStorage.getItem(PSYCHOLOGISTS_KEY)) {
    localStorage.setItem(PSYCHOLOGISTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(SUBSCRIPTIONS_KEY)) {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify({}));
  }
};

export const psychologistService = {
  getAll: () => {
    initPsychologists();
    const psychologists = JSON.parse(localStorage.getItem(PSYCHOLOGISTS_KEY));
    const subscriptions = JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY));
    return psychologists.map(p => ({
      ...p,
      subscriptionExpiry: subscriptions[p.id] || null
    }));
  },

  create: (email, name) => {
    initPsychologists();
    const psychologists = JSON.parse(localStorage.getItem(PSYCHOLOGISTS_KEY));
    const newId = Date.now().toString();
    const newPsych = { id: newId, email, name };
    psychologists.push(newPsych);
    localStorage.setItem(PSYCHOLOGISTS_KEY, JSON.stringify(psychologists));
    return newPsych;
  },

  extendSubscription: (psychologistId, months = 1) => {
    initPsychologists();
    const subscriptions = JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY));
    const currentExpiry = subscriptions[psychologistId] ? new Date(subscriptions[psychologistId]) : new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + months);
    subscriptions[psychologistId] = newExpiry.toISOString();
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));

    // Отправляем уведомление на email (имитация)
    const psychologist = psychologistService.getAll().find(p => p.id === psychologistId);
    if (psychologist) {
      console.log(`Уведомление на email ${psychologist.email}: подписка продлена до ${newExpiry.toLocaleDateString()}`);
      alert(`Уведомление отправлено психологу ${psychologist.name} (${psychologist.email}) о продлении подписки.`);
    }
    return newExpiry;
  },

  checkExpirations: () => {
    // Можно вызывать при загрузке, чтобы проверить истекающие подписки
    const psychologists = psychologistService.getAll();
    const now = new Date();
    psychologists.forEach(p => {
      if (p.subscriptionExpiry) {
        const expiry = new Date(p.subscriptionExpiry);
        const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        if (diffDays === 3) {
          console.log(`Уведомление: у психолога ${p.email} подписка истекает через 3 дня`);
          alert(`Уведомление: подписка психолога ${p.name} истекает через 3 дня.`);
        }
      }
    });
  }
};