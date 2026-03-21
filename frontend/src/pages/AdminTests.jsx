import { useState, useEffect } from 'react';
import { formService } from '../services/formService';
import { authService } from '../services/authService';

export const AdminTests = () => {
  const [tests, setTests] = useState([]);
  const [, setPsychologists] = useState([]);

  useEffect(() => {
    const allForms = formService.getAllForms();
    const allUsers = authService.getAllUsers();
    const psychMap = allUsers.reduce((acc, u) => {
      if (u.role === 'psychologist') acc[u.id] = u.name;
      return acc;
    }, {});
    const enrichedTests = allForms.map(form => ({
      ...form,
      author: psychMap[form.psychologistId] || 'Неизвестно'
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTests(enrichedTests);
    setPsychologists(allUsers.filter(u => u.role === 'psychologist'));
  }, []);

  const getFormLink = (formId) => {
    return `${window.location.origin}/form/${formId}`;
  };

  return (
    <div className="container">
      <h1 style={{ margin: '2rem 0' }}>Все тесты</h1>
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Название теста</th>
                <th>Автор (психолог)</th>
                <th>Опубликован</th>
                <th>Кол-во вопросов</th>
                <th>Кол-во прохождений</th>
                <th>Дата создания</th>
                <th>Ссылка</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(test => (
                <tr key={test.id}>
                  <td>{test.title}</td>
                  <td>{test.author}</td>
                  <td>{test.published ? 'Да' : 'Нет'}</td>
                  <td>{test.questions.length}</td>
                  <td>{test.responsesCount || 0}</td>
                  <td>{new Date(test.createdAt).toLocaleDateString()}</td>
                  <td><a href={getFormLink(test.id)} target="_blank" rel="noopener noreferrer">Ссылка</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};