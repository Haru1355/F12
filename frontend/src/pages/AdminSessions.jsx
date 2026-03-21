import { useState, useEffect } from 'react';
import { sessionService } from '../services/sessionService';
// eslint-disable-next-line no-unused-vars
import { formService } from '../services/formService';

export const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const allSessions = sessionService.getAllSessions();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessions(allSessions);
  }, []);

  const handleReport = (session) => {
    alert(`Отчёт по сессии ${session.id}\nКлиент: ${session.clientName}\nТест: ${session.testTitle}\nСтатус: ${session.status}\nДата начала: ${new Date(session.startDate).toLocaleString()}\nДата завершения: ${session.endDate ? new Date(session.endDate).toLocaleString() : '—'}\nОтветы: ${JSON.stringify(session.answers)}`);
  };

  return (
    <div className="container">
      <h1 style={{ margin: '2rem 0' }}>Все сессии (прохождения тестов)</h1>
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Клиент (имя)</th>
                <th>Тест</th>
                <th>Статус</th>
                <th>Дата начала</th>
                <th>Дата завершения</th>
                <th>Отчёт</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr key={session.id}>
                  <td>{session.clientName}</td>
                  <td>{session.testTitle}</td>
                  <td>{session.status === 'in_progress' ? 'В процессе' : 'Завершён'}</td>
                  <td>{new Date(session.startDate).toLocaleString()}</td>
                  <td>{session.endDate ? new Date(session.endDate).toLocaleString() : '—'}</td>
                  <td><button onClick={() => handleReport(session)} className="btn btn-outline">Отчёт</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};