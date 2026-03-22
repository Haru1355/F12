import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formService } from '../services/formService';

export const PsychologistDashboard = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const data = await formService.getMyForms();
      setTests(data);
    } catch {
      setMessage('Ошибка загрузки тестов');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить тест? Все данные будут потеряны.')) return;
    try {
      await formService.deleteForm(id);
      showMsg('Тест удалён');
      loadTests();
    } catch {
      showMsg('Ошибка удаления');
    }
  };

  const handleCopyLink = (link) => {
    const url = `${window.location.origin}/form/${link}`;
    navigator.clipboard.writeText(url);
    showMsg('Ссылка скопирована!');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60 }}>Загрузка...</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>Мои тесты</h1>
        <button
          onClick={() => navigate('/psychologist/constructor/new')}
          style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontSize: 15,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + Создать тест
        </button>
      </div>

      {message && (
        <div
          style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {message}
        </div>
      )}

      {tests.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: 48,
            textAlign: 'center',
            color: '#9ca3af',
          }}
        >
          <p style={{ fontSize: 48, marginBottom: 8 }}>📋</p>
          <p>Пока нет тестов. Создайте первый!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {tests.map((test) => (
            <div
              key={test.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                padding: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ margin: '0 0 4px' }}>{test.title}</h3>
                <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#6b7280' }}>
                  <span>📝 {test.questions_count || 0} вопросов</span>
                  <span>👤 {test.sessions_count || 0} прохождений</span>
                  <span
                    style={{
                      background: test.is_published ? '#dcfce7' : '#fef3c7',
                      color: test.is_published ? '#166534' : '#92400e',
                      padding: '1px 8px',
                      borderRadius: 10,
                    }}
                  >
                    {test.is_published ? 'Опубликован' : 'Черновик'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {test.unique_link && (
                  <button
                    onClick={() => handleCopyLink(test.unique_link)}
                    title="Копировать ссылку"
                    style={btnOutline}
                  >
                    🔗
                  </button>
                )}
                <button
                  onClick={() =>
                    navigate(`/psychologist/constructor/${test.id}`)
                  }
                  style={btnOutline}
                >
                  ✏️ Редактировать
                </button>
                <button
                  onClick={() => handleDelete(test.id)}
                  style={{ ...btnOutline, color: '#ef4444', borderColor: '#fca5a5' }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const btnOutline = {
  background: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '8px 14px',
  cursor: 'pointer',
  fontSize: 14,
};