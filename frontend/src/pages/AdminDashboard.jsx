import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { formService } from '../services/formService';
import { psychologistService } from '../services/psychologistService';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [psychologists, setPsychologists] = useState([]);
  const [tests, setTests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [editingPsych, setEditingPsych] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPsych, setNewPsych] = useState({ email: '', password: '', full_name: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [psychs, allTests, allSessions] = await Promise.all([
        authService.getAllPsychologists(),
        formService.getAllForms(),
        formService.getAllResponses(),
      ]);
      setPsychologists(psychs);
      setTests(allTests);
      setSessions(allSessions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCreatePsychologist = async (e) => {
    e.preventDefault();
    try {
      await authService.createPsychologist(newPsych.email, newPsych.password, newPsych.full_name);
      showMessage('Психолог создан');
      setNewPsych({ email: '', password: '', full_name: '' });
      setShowCreateForm(false);
      await loadData();
    } catch (err) {
      showMessage(err.message);
    }
  };

  const handleUpdatePsychologist = async (id, updates) => {
    try {
      await authService.updatePsychologist(id, updates);
      showMessage('Данные обновлены');
      setEditingPsych(null);
      await loadData();
    } catch {
      showMessage('Ошибка обновления');
    }
  };

  const handleDeletePsychologist = async (id) => {
    if (window.confirm('Удалить психолога? Это удалит все его тесты и данные.')) {
      try {
        await authService.deletePsychologist(id);
        showMessage('Психолог удалён');
        await loadData();
      } catch {
        showMessage('Ошибка удаления');
      }
    }
  };

  const handleBlockPsychologist = async (id, isActive) => {
    try {
      if (isActive) {
        await authService.blockPsychologist(id);
        showMessage('Психолог заблокирован');
      } else {
        await authService.unblockPsychologist(id);
        showMessage('Психолог разблокирован');
      }
      await loadData();
    } catch {
      showMessage('Ошибка');
    }
  };

  const handleExtendAccess = async (id) => {
    const days = prompt('На сколько дней продлить доступ?', '30');
    if (days) {
      try {
        await authService.extendAccess(id, parseInt(days));
        showMessage(`Доступ продлён на ${days} дней`);
        await loadData();
      } catch {
        showMessage('Ошибка продления');
      }
    }
  };

  const handleReport = async (sessionId) => {
    try {
      await psychologistService.downloadReportDocx(sessionId, 'psychologist');
    } catch {
      showMessage('Ошибка генерации отчёта');
    }
  };

  const getPsychologistName = (ownerId) => {
    const psych = psychologists.find(p => p.id === ownerId);
    return psych ? psych.full_name : 'Неизвестно';
  };

  const getTestLink = (uniqueLink) => {
    return `${window.location.origin}/form/${uniqueLink}`;
  };

  const getTestTitle = (testId) => {
    const test = tests.find(t => t.id === testId);
    return test ? test.title : 'Неизвестно';
  };

  if (loading) return <div className="container">Загрузка...</div>;
  if (error) return <div className="container alert alert-error">{error}</div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <h1>Панель администратора</h1>
      {message && <div className="alert alert-success">{message}</div>}

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'btn btn-primary' : 'btn'}>Мой профиль</button>
        <button onClick={() => setActiveTab('psychologists')} className={activeTab === 'psychologists' ? 'btn btn-primary' : 'btn'}>Психологи</button>
        <button onClick={() => setActiveTab('tests')} className={activeTab === 'tests' ? 'btn btn-primary' : 'btn'}>Тесты</button>
        <button onClick={() => setActiveTab('sessions')} className={activeTab === 'sessions' ? 'btn btn-primary' : 'btn'}>Сессии</button>
      </div>

      {/* ПРОФИЛЬ */}
      {activeTab === 'profile' && user && (
        <div className="card">
          <h2>Профиль</h2>
          <p><strong>Имя:</strong> {user.full_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Роль:</strong> Администратор</p>
          <p><strong>Дата регистрации:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      )}

      {/* ПСИХОЛОГИ */}
      {activeTab === 'psychologists' && (
        <div>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-primary" style={{ marginBottom: '1rem' }}>
            + Создать психолога
          </button>
          {showCreateForm && (
            <div className="card">
              <h3>Создать психолога</h3>
              <form onSubmit={handleCreatePsychologist}>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={newPsych.email} onChange={e => setNewPsych({ ...newPsych, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Пароль *</label>
                  <input type="password" value={newPsych.password} onChange={e => setNewPsych({ ...newPsych, password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>ФИО *</label>
                  <input type="text" value={newPsych.full_name} onChange={e => setNewPsych({ ...newPsych, full_name: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary">Создать</button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-outline" style={{ marginLeft: '0.5rem' }}>Отмена</button>
              </form>
            </div>
          )}

          <div className="card">
            <h3>Список психологов ({psychologists.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ФИО</th>
                    <th>Email</th>
                    <th>Статус</th>
                    <th>Доступ до</th>
                    <th>Дата регистрации</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {psychologists.map(p => (
                    <tr key={p.id}>
                      <td>{p.full_name}</td>
                      <td>{p.email}</td>
                      <td>
                        <span style={{
                          background: p.is_active ? '#dcfce7' : '#fee2e2',
                          color: p.is_active ? '#166534' : '#991b1b',
                          padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem'
                        }}>
                          {p.is_active ? 'Активен' : 'Заблокирован'}
                        </span>
                      </td>
                      <td>{p.access_until ? new Date(p.access_until).toLocaleDateString() : 'Не задано'}</td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td>
                        {editingPsych === p.id ? (
                          <EditPsychForm
                            psych={p}
                            onSave={(updates) => handleUpdatePsychologist(p.id, updates)}
                            onCancel={() => setEditingPsych(null)}
                          />
                        ) : (
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            <button onClick={() => setEditingPsych(p.id)} className="btn btn-outline">✏️</button>
                            <button onClick={() => handleBlockPsychologist(p.id, p.is_active)} className="btn btn-outline">
                              {p.is_active ? '🔒' : '🔓'}
                            </button>
                            <button onClick={() => handleExtendAccess(p.id)} className="btn btn-outline">📅</button>
                            <button onClick={() => handleDeletePsychologist(p.id)} className="btn btn-danger">🗑️</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {psychologists.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Психологов пока нет</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ТЕСТЫ */}
      {activeTab === 'tests' && (
        <div className="card">
          <h3>Все тесты ({tests.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Автор</th>
                  <th>Опубликован</th>
                  <th>Вопросов</th>
                  <th>Прохождений</th>
                  <th>Дата создания</th>
                  <th>Ссылка</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(test => (
                  <tr key={test.id}>
                    <td>{test.title}</td>
                    <td>{getPsychologistName(test.owner_id)}</td>
                    <td>{test.is_published ? '✅' : '❌'}</td>
                    <td>{test.questions_count || 0}</td>
                    <td>{test.sessions_count || 0}</td>
                    <td>{new Date(test.created_at).toLocaleDateString()}</td>
                    <td>
                      {test.unique_link ? (
                        <a href={getTestLink(test.unique_link)} target="_blank" rel="noopener noreferrer">Ссылка</a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
                {tests.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>Тестов пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* СЕССИИ */}
      {activeTab === 'sessions' && (
        <div className="card">
          <h3>Все прохождения ({sessions.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Тест</th>
                  <th>Статус</th>
                  <th>Дата начала</th>
                  <th>Дата завершения</th>
                  <th>Отчёт</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(sess => (
                  <tr key={sess.id}>
                    <td>{sess.client_name || 'Аноним'}</td>
                    <td>{getTestTitle(sess.test_id)}</td>
                    <td>
                      <span style={{
                        background: sess.status === 'completed' ? '#dcfce7' : '#fef3c7',
                        color: sess.status === 'completed' ? '#166534' : '#92400e',
                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem'
                      }}>
                        {sess.status === 'completed' ? 'Завершён' : 'В процессе'}
                      </span>
                    </td>
                    <td>{new Date(sess.created_at).toLocaleString()}</td>
                    <td>{sess.completed_at ? new Date(sess.completed_at).toLocaleString() : '—'}</td>
                    <td>
                      {sess.status === 'completed' && (
                        <button onClick={() => handleReport(sess.id)} className="btn btn-outline">📄 Скачать</button>
                      )}
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>Прохождений пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент редактирования психолога
const EditPsychForm = ({ psych, onSave, onCancel }) => {
  const [full_name, setFullName] = useState(psych.full_name);
  const [email, setEmail] = useState(psych.email);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ full_name, email });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input type="text" value={full_name} onChange={e => setFullName(e.target.value)} placeholder="ФИО" />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <button type="submit" className="btn btn-primary">💾</button>
      <button type="button" onClick={onCancel} className="btn btn-outline">✖</button>
    </form>
  );
};