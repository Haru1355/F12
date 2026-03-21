import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { psychologistService } from '../services/psychologistService';
import { formService } from '../services/formService';

export const PsychologistDashboard = () => {
  const { user } = useAuth();
  const [psychologistData, setPsychologistData] = useState(null);
  const [forms, setForms] = useState([]);
  const [showFormCreator, setShowFormCreator] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [questions, setQuestions] = useState([{ questionText: '', type: 'text' }]);
  const [message, setMessage] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps, no-undef
  const loadData = useCallback(() => {
    const psychologists = psychologistService.getAll();
    const currentPsych = psychologists.find(p => p.email === user.email);
    setPsychologistData(currentPsych);
    const myForms = formService.getFormsByPsychologist(currentPsych.id);
    setForms(myForms);
  });

  useEffect(() => {
     
    loadData();
  }, [loadData, user]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', type: 'text' }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleCreateForm = (e) => {
    e.preventDefault();
    if (!newFormTitle) return;
    formService.createForm(psychologistData.id, newFormTitle, questions);
    setNewFormTitle('');
    setQuestions([{ questionText: '', type: 'text' }]);
    setShowFormCreator(false);
    loadData();
    setMessage('Опрос создан!');
    setTimeout(() => setMessage(''), 3000);
  };

  const getFormLink = (formId) => {
    return `${window.location.origin}/form/${formId}`;
  };

  if (!psychologistData) return <div className="container">Загрузка...</div>;

  const subscriptionExpiry = psychologistData.subscriptionExpiry ? new Date(psychologistData.subscriptionExpiry) : null;
  const isActive = subscriptionExpiry ? subscriptionExpiry > new Date() : false;

  return (
    <div className="container">
      <h1 style={{ margin: '2rem 0' }}>Личный кабинет психолога</h1>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <h2>Добро пожаловать, {psychologistData.name}</h2>
        <p>
          <strong>Статус подписки:</strong>{' '}
          {isActive ? (
            <span style={{ color: 'var(--secondary)' }}>Активна до {subscriptionExpiry.toLocaleDateString()}</span>
          ) : (
            <span style={{ color: 'var(--danger)' }}>Не активна. Обратитесь к администратору.</span>
          )}
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Мои опросы</h2>
          <button onClick={() => setShowFormCreator(!showFormCreator)} className="btn btn-primary">
            + Создать опрос
          </button>
        </div>

        {showFormCreator && (
          <form onSubmit={handleCreateForm} style={{ marginBottom: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <h3>Новый опрос</h3>
            <div className="form-group">
              <label>Название опроса</label>
              <input type="text" value={newFormTitle} onChange={(e) => setNewFormTitle(e.target.value)} required />
            </div>
            <h4>Вопросы</h4>
            {questions.map((q, idx) => (
              <div key={idx} style={{ marginBottom: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: 'var(--radius)' }}>
                <div className="form-group">
                  <label>Текст вопроса {idx + 1}</label>
                  <input type="text" value={q.questionText} onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Тип вопроса</label>
                  <select value={q.type} onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}>
                    <option value="text">Текстовый ответ</option>
                    <option value="radio">Один вариант (Да/Нет)</option>
                  </select>
                </div>
              </div>
            ))}
            <button type="button" onClick={handleAddQuestion} className="btn btn-outline" style={{ marginRight: '1rem' }}>Добавить вопрос</button>
            <button type="submit" className="btn btn-primary">Сохранить опрос</button>
          </form>
        )}

        {forms.length === 0 ? (
          <p>У вас пока нет опросов. Создайте первый!</p>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
            {forms.map(form => (
              <div key={form.id} className="card" style={{ background: '#f8fafc' }}>
                <h3>{form.title}</h3>
                <p>Создан: {new Date(form.createdAt).toLocaleDateString()}</p>
                <p>Вопросов: {form.questions.length}</p>
                <div>
                  <strong>Ссылка для клиента:</strong>
                  <input type="text" readOnly value={getFormLink(form.id)} onClick={(e) => e.target.select()} style={{ fontSize: '0.875rem' }} />
                  <button onClick={() => {
                    navigator.clipboard.writeText(getFormLink(form.id));
                    alert('Ссылка скопирована!');
                  }} className="btn btn-outline" style={{ marginTop: '0.5rem' }}>Копировать</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};