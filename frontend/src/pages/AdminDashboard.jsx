import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { formService } from '../services/formService';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [psychologists, setPsychologists] = useState([]);
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState([]);
  const [editingPsych, setEditingPsych] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPsych, setNewPsych] = useState({ email: '', password: '', name: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [psychs, allForms, allResponses] = await Promise.all([
        authService.getAllPsychologists(),
        formService.getAllForms(),
        formService.getAllResponses(),
      ]);
      setPsychologists(psychs);
      setForms(allForms);
      setResponses(allResponses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePsychologist = async (e) => {
    e.preventDefault();
    try {
      await authService.createPsychologist(newPsych.email, newPsych.password, newPsych.name);
      setMessage('Психолог создан');
      setTimeout(() => setMessage(''), 3000);
      setNewPsych({ email: '', password: '', name: '' });
      setShowCreateForm(false);
      await loadData();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleUpdatePsychologist = async (id, updates) => {
    try {
      await authService.updatePsychologist(id, updates);
      setMessage('Данные обновлены');
      setTimeout(() => setMessage(''), 3000);
      setEditingPsych(null);
      await loadData();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMessage('Ошибка обновления');
    }
  };

  const handleDeletePsychologist = async (id) => {
    if (window.confirm('Удалить психолога? Это удалит все его опросы и ответы.')) {
      try {
        await authService.deletePsychologist(id);
        await loadData();
        setMessage('Психолог удалён');
        setTimeout(() => setMessage(''), 3000);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setMessage('Ошибка удаления');
      }
    }
  };

  const getPsychologistName = (id) => {
    const psych = psychologists.find(p => p.id === id);
    return psych ? psych.name : 'Неизвестно';
  };

  const getFormLink = (formId) => {
    return `${window.location.origin}/form/${formId}`;
  };

  const handleReport = (responseId) => {
    // Можно открыть модальное окно с ответами или перейти на страницу отчёта
    const response = responses.find(r => r.id === responseId);
    const form = forms.find(f => f.id === response?.formId);
    alert(`Отчёт по сессии\nКлиент: ${response.clientName}\nТест: ${form?.title}\nОтветы: ${JSON.stringify(response.answers, null, 2)}`);
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

      {activeTab === 'profile' && user && (
        <div className="card">
          <h2>Профиль</h2>
          <p><strong>Имя:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Роль:</strong> Администратор</p>
          <p><strong>Дата регистрации:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      )}

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
                  <input type="text" value={newPsych.name} onChange={e => setNewPsych({ ...newPsych, name: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary">Создать</button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-outline" style={{ marginLeft: '0.5rem' }}>Отмена</button>
              </form>
            </div>
          )}

          <div className="card">
            <h3>Список психологов</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Статус</th>
                    <th>Дата регистрации</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {psychologists.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td>{p.active ? 'Активен' : 'Деактивирован'}</td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td>
                        {editingPsych === p.id ? (
                          <EditPsychForm
                            psych={p}
                            onSave={(updates) => handleUpdatePsychologist(p.id, updates)}
                            onCancel={() => setEditingPsych(null)}
                          />
                        ) : (
                          <>
                            <button onClick={() => setEditingPsych(p.id)} className="btn btn-outline" style={{ marginRight: '0.5rem' }}>Редактировать</button>
                            <button onClick={() => handleDeletePsychologist(p.id)} className="btn btn-danger">Удалить</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="card">
          <h3>Все тесты психологов</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Название теста</th>
                  <th>Автор</th>
                  <th>Опубликован</th>
                  <th>Кол-во вопросов</th>
                  <th>Кол-во прохождений</th>
                  <th>Дата создания</th>
                  <th>Ссылка</th>
                </tr>
              </thead>
              <tbody>
                {forms.map(form => (
                  <tr key={form.id}>
                    <td>{form.title}</td>
                    <td>{getPsychologistName(form.psychologistId)}</td>
                    <td>{form.published ? 'Да' : 'Нет'}</td>
                    <td>{form.questions.length}</td>
                    <td>{form.completions || 0}</td>
                    <td>{new Date(form.createdAt).toLocaleDateString()}</td>
                    <td><a href={getFormLink(form.id)} target="_blank" rel="noopener noreferrer">Ссылка</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="card">
          <h3>Все сессии (прохождения тестов)</h3>
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
                {responses.map(resp => {
                  const form = forms.find(f => f.id === resp.formId);
                  return (
                    <tr key={resp.id}>
                      <td>{resp.clientName}</td>
                      <td>{form ? form.title : 'Неизвестно'}</td>
                      <td>{resp.status}</td>
                      <td>{new Date(resp.startedAt).toLocaleString()}</td>
                      <td>{new Date(resp.completedAt).toLocaleString()}</td>
                      <td><button onClick={() => handleReport(resp.id)} className="btn btn-outline">Отчёт</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент формы редактирования психолога (синхронный, так как сохранение происходит в родителе)
const EditPsychForm = ({ psych, onSave, onCancel }) => {
  const [name, setName] = useState(psych.name);
  const [email, setEmail] = useState(psych.email);
  const [active, setActive] = useState(psych.active);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, email, active });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Имя" />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        Активен
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
      </label>
      <button type="submit" className="btn btn-primary">Сохранить</button>
      <button type="button" onClick={onCancel} className="btn btn-outline">Отмена</button>
    </form>
  );
};