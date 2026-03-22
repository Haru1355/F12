import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formService } from '../services/formService';

export const PsychologistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [sessions, setSessions] = useState([]);
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
    if (window.confirm('Удалить тест? Все данные прохождений будут потеряны.')) {
      try {
        await formService.deleteForm(id);
        showMsg('🗑 Тест удалён');
        await loadData();
      } catch {
        showMsg('Ошибка удаления', 'error');
      }
    }
  };

  const handleCopyLink = (uniqueLink) => {
    const link = `${window.location.origin}/form/${uniqueLink}`;
    navigator.clipboard.writeText(link);
    showMsg('📋 Ссылка скопирована!');
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

  const hasAccess = (() => {
    if (!user?.is_active) return false;
    if (user?.role === 'admin') return true;
    if (!user?.access_until) return true;
    return new Date(user.access_until) > new Date();
  })();

  const accessUntil = user?.access_until ? new Date(user.access_until) : null;
  const daysLeft = accessUntil
    ? Math.ceil((accessUntil - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div style={{ background: '#f0f9ff', minHeight: '100vh', padding: '32px 0' }}>
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>
            Добро пожаловать, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Личный кабинет психолога</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type === 'error' ? 'error' : 'success'}`}>
            {message.text}
          </div>
        )}

        {/* Статус подписки */}
        <div style={{
          background: hasAccess ? 'white' : '#fee2e2',
          borderRadius: '20px', padding: '20px 24px', marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: hasAccess ? '1px solid #e0f2fe' : '2px solid #fca5a5',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>{hasAccess ? '✅' : '⛔'}</span>
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
        </div>

        {/* Статистика */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px', marginBottom: '32px',
        }}>
          {[
            { emoji: '📝', label: 'Тестов', value: tests.length, color: '#e0f2fe' },
            { emoji: '✅', label: 'Опубликовано', value: tests.filter(t => t.is_published).length, color: '#f0fdf4' },
            { emoji: '📊', label: 'Прохождений', value: sessions.filter(s => s.status === 'completed').length, color: '#fef9c3' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'white', borderRadius: '20px', padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: stat.color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.4rem',
              }}>{stat.emoji}</div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Тесты */}
        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h2 style={{ fontWeight: '700', color: '#1e293b' }}>Мои тесты</h2>
            <button
              onClick={() => navigate('/psychologist/constructor/new')}
              className="btn btn-primary"
            >
              + Создать тест
            </button>
          </div>

          <div style={{ padding: '16px' }}>
            {tests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
                <p>У вас пока нет тестов.</p>
                <button
                  onClick={() => navigate('/psychologist/constructor/new')}
                  className="btn btn-primary"
                  style={{ marginTop: '16px' }}
                >
                  Создать первый тест
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tests.map(test => (
                  <div key={test.id} style={{
                    background: '#f8fafc', borderRadius: '16px', padding: '20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '12px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <h3 style={{ fontWeight: '700', color: '#1e293b', margin: 0 }}>{test.title}</h3>
                        <span style={{
                          background: test.is_published ? '#dcfce7' : '#f1f5f9',
                          color: test.is_published ? '#166534' : '#64748b',
                          padding: '2px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '600',
                        }}>
                          {test.is_published ? '✅ Опубликован' : '📝 Черновик'}
                        </span>
                      </div>
                      {test.description && (
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                          {test.description}
                        </p>
                      )}
                      <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '16px' }}>
                        <span>❓ {test.questions_count || 0} вопросов</span>
                        <span>📊 {getTestSessions(test.id).length} прохождений</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Редактировать (конструктор) */}
                      <button
                        onClick={() => navigate(`/psychologist/constructor/${test.id}`)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem' }}
                      >
                        ✏️ Редактировать
                      </button>
                      {/* Ссылка */}
                      {test.is_published && test.unique_link && (
                        <button
                          onClick={() => handleCopyLink(test.unique_link)}
                          className="btn btn-outline"
                          style={{ fontSize: '0.8rem' }}
                        >
                          📋 Ссылка
                        </button>
                      )}
                      {/* Опубликовать / снять */}
                      <button
                        onClick={() => handlePublish(test)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem' }}
                        title={test.is_published ? 'Снять с публикации' : 'Опубликовать'}
                      >
                        {test.is_published ? '⏸ Снять' : '▶ Опубликовать'}
                      </button>
                      {/* Удалить */}
                      <button
                        onClick={() => handleDelete(test.id)}
                        className="btn btn-danger"
                        style={{ fontSize: '0.8rem' }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};