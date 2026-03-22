import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { formService } from '../services/formService';

export const PsychologistDashboard = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTest, setNewTest] = useState({ title: '', description: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [allTests, allSessions] = await Promise.all([
        formService.getMyForms(),
        formService.getAllResponses(),
      ]);
      setTests(allTests);
      setSessions(allSessions);
    } catch (err) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      await formService.createForm({
        title: newTest.title,
        description: newTest.description,
        is_published: false,
        show_result_to_client: true,
      });
      showMsg('✅ Тест создан!');
      setNewTest({ title: '', description: '' });
      setShowCreateForm(false);
      await loadData();
    } catch {
      showMsg('Ошибка создания теста', 'error');
    }
  };

  const handlePublish = async (test) => {
    try {
      await formService.updateForm(test.id, { is_published: !test.is_published });
      showMsg(test.is_published ? 'Тест снят с публикации' : '✅ Тест опубликован');
      await loadData();
    } catch {
      showMsg('Ошибка', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить тест?')) {
      try {
        await formService.deleteForm(id);
        showMsg('✅ Тест удалён');
        await loadData();
      } catch {
        showMsg('Ошибка удаления', 'error');
      }
    }
  };

  const handleCopyLink = (uniqueLink) => {
    const link = `${window.location.origin}/form/${uniqueLink}`;
    navigator.clipboard.writeText(link);
    showMsg('✅ Ссылка скопирована!');
  };

  const getTestSessions = (testId) =>
    sessions.filter(s => s.test_id === testId);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
        <p style={{ color: '#64748b', marginTop: '12px' }}>Загрузка...</p>
      </div>
    </div>
  );

  // Проверяем подписку
  const accessUntil = user?.access_until ? new Date(user.access_until) : null;
  const hasAccess = (() => {
  if (!user?.is_active) return false;
  if (user?.role === 'admin') return true;
  if (!user?.access_until) return true;
  return new Date(user.access_until) > new Date();
})();
  const daysLeft = accessUntil
    ? Math.ceil((accessUntil - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div style={{ background: '#f0f9ff', minHeight: '100vh', padding: '32px 0' }}>
      <div className="container">

        {/* Заголовок */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>
            Добро пожаловать, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Личный кабинет психолога
          </p>
        </div>

        {/* Сообщение */}
        {message.text && (
          <div className={`alert alert-${message.type === 'error' ? 'error' : 'success'}`}>
            {message.text}
          </div>
        )}

        {/* Статус подписки */}
        <div style={{
          background: hasAccess ? 'white' : '#fee2e2',
          borderRadius: '20px', padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: hasAccess ? '1px solid #e0f2fe' : '2px solid #fca5a5',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>
              {hasAccess ? '✅' : '❌'}
            </span>
            <div>
              <div style={{ fontWeight: '700', color: '#1e293b' }}>
                {hasAccess ? 'Подписка активна' : 'Подписка неактивна'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {accessUntil
                  ? `До ${accessUntil.toLocaleDateString('ru-RU')} (осталось ${daysLeft} дн.)`
                  : 'Бессрочный доступ'}
              </div>
            </div>
          </div>
          {!hasAccess && (
            <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: '600' }}>
              Обратитесь к администратору для продления
            </span>
          )}
          {hasAccess && daysLeft !== null && daysLeft <= 7 && (
            <span style={{
              background: '#fef9c3', color: '#92400e',
              padding: '4px 12px', borderRadius: '50px',
              fontSize: '0.8rem', fontWeight: '600',
            }}>
              ⚠️ Скоро истекает
            </span>
          )}
        </div>

        {/* Статистика */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px', marginBottom: '32px',
        }}>
          {[
            { emoji: '📋', label: 'Тестов создано', value: tests.length, color: '#e0f2fe' },
            { emoji: '✅', label: 'Опубликовано', value: tests.filter(t => t.is_published).length, color: '#f0fdf4' },
            { emoji: '👥', label: 'Прохождений', value: sessions.filter(s => s.status === 'completed').length, color: '#fef9c3' },
            { emoji: '⏳', label: 'В процессе', value: sessions.filter(s => s.status === 'in_progress').length, color: '#fdf2f8' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'white', borderRadius: '20px', padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: stat.color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
              }}>
                {stat.emoji}
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Мои тесты */}
        <div style={{
          background: 'white', borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h2 style={{ fontWeight: '700', color: '#1e293b' }}>Мои тесты</h2>
            <button onClick={() => setShowCreateForm(!showCreateForm)} style={{
              background: 'linear-gradient(135deg, #0369a1, #0d9488)',
              color: 'white', border: 'none', borderRadius: '50px',
              padding: '10px 24px', fontWeight: '700', fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}>
              + Создать тест
            </button>
          </div>

          {/* Форма создания */}
          {showCreateForm && (
            <div style={{
              padding: '24px', borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
            }}>
              <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>📋 Новый тест</h3>
              <form onSubmit={handleCreateTest}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Название *</label>
                    <input
                      type="text"
                      value={newTest.title}
                      onChange={e => setNewTest({ ...newTest, title: e.target.value })}
                      placeholder="Например: Тест на профориентацию"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Описание</label>
                    <input
                      type="text"
                      value={newTest.description}
                      onChange={e => setNewTest({ ...newTest, description: e.target.value })}
                      placeholder="Краткое описание теста"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary">Создать</button>
                  <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-outline">Отмена</button>
                </div>
              </form>
            </div>
          )}

          {/* Список тестов */}
          <div style={{ padding: '16px' }}>
            {tests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
                <p style={{ fontWeight: '600' }}>У вас пока нет тестов</p>
                <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Нажмите «Создать тест» чтобы начать</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tests.map(test => {
                  const testSessions = getTestSessions(test.id);
                  return (
                    <div key={test.id} style={{
                      background: '#f8fafc', borderRadius: '16px', padding: '20px',
                      border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <h3 style={{ fontWeight: '700', color: '#1e293b', margin: 0 }}>
                            {test.title}
                          </h3>
                          <span style={{
                            background: test.is_published ? '#dcfce7' : '#f1f5f9',
                            color: test.is_published ? '#166534' : '#64748b',
                            padding: '2px 10px', borderRadius: '50px',
                            fontSize: '0.75rem', fontWeight: '600',
                          }}>
                            {test.is_published ? '✅ Опубликован' : '📝 Черновик'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '16px' }}>
                          <span>📊 Вопросов: {test.questions_count || 0}</span>
                          <span>👥 Прохождений: {testSessions.length}</span>
                          <span>📅 {new Date(test.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {test.is_published && test.unique_link && (
                          <button onClick={() => handleCopyLink(test.unique_link)} style={{
                            background: '#e0f2fe', color: '#0369a1',
                            border: 'none', borderRadius: '50px',
                            padding: '8px 16px', fontSize: '0.8rem',
                            fontWeight: '600', cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                          }}>
                            🔗 Скопировать ссылку
                          </button>
                        )}
                        <button onClick={() => handlePublish(test)} style={{
                          background: test.is_published ? '#fef9c3' : '#f0fdf4',
                          color: test.is_published ? '#92400e' : '#166534',
                          border: 'none', borderRadius: '50px',
                          padding: '8px 16px', fontSize: '0.8rem',
                          fontWeight: '600', cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          {test.is_published ? '⏸ Снять' : '▶ Опубликовать'}
                        </button>
                        <button onClick={() => handleDelete(test.id)} style={{
                          background: '#fee2e2', color: '#991b1b',
                          border: 'none', borderRadius: '50px',
                          padding: '8px 16px', fontSize: '0.8rem',
                          fontWeight: '600', cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};