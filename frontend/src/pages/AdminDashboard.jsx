import { useState, useEffect } from 'react';
import { psychologistService } from '../services/psychologistService';

export const AdminDashboard = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState('');

  const loadPsychologists = () => {
    const list = psychologistService.getAll();
    setPsychologists(list);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPsychologists();
  }, []);

  const handleCreatePsychologist = (e) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    psychologistService.create(newEmail, newName);
    setNewEmail('');
    setNewName('');
    loadPsychologists();
    setMessage('Психолог успешно создан');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExtend = (id, months = 1) => {
    psychologistService.extendSubscription(id, months);
    loadPsychologists();
    setMessage('Подписка продлена, уведомление отправлено');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="container">
      <h1 style={{ margin: '2rem 0' }}>Панель администратора</h1>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <h2>Создать психолога</h2>
        <form onSubmit={handleCreatePsychologist}>
          <div className="form-group">
            <label>Имя</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Создать</button>
        </form>
      </div>

      <div className="card">
        <h2>Список психологов</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Подписка до</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {psychologists.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.subscriptionExpiry ? new Date(p.subscriptionExpiry).toLocaleDateString() : 'Не активна'}</td>
                  <td>
                    <button onClick={() => handleExtend(p.id, 1)} className="btn btn-secondary">Продлить на 1 мес</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};