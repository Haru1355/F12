import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formService } from '../services/formService';

export const ClientForm = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadForm = async () => {
      try {
        const found = await formService.getForm(formId);
        setForm(found);
        if (found) {
          const initialAnswers = {};
          found.questions.forEach((q, idx) => {
            initialAnswers[idx] = '';
          });
          setAnswers(initialAnswers);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Форма не найдена');
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [formId]);

  const handleAnswerChange = (idx, value) => {
    setAnswers(prev => ({ ...prev, [idx]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Пожалуйста, введите ваше имя');
      return;
    }
    try {
      await formService.saveResponse(formId, clientName, answers);
      alert('Спасибо! Ваши ответы сохранены.');
      setSubmitted(true);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Ошибка при сохранении ответов');
    }
  };

  if (loading) return <div className="container" style={{ marginTop: '3rem' }}>Загрузка...</div>;
  if (error || !form) return <div className="container" style={{ marginTop: '3rem' }}>Форма не найдена</div>;
  if (submitted) return (
    <div className="container" style={{ marginTop: '3rem', textAlign: 'center' }}>
      <div className="card">
        <h2>Спасибо за участие в опросе!</h2>
        <p>Ваши ответы успешно отправлены.</p>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ maxWidth: '700px', marginTop: '3rem' }}>
      <div className="card">
        <h1 style={{ marginBottom: '1rem' }}>{form.title}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ваше имя</label>
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required placeholder="Введите ваше имя" />
          </div>
          {form.questions.map((q, idx) => (
            <div key={idx} className="form-group">
              <label>{q.questionText}</label>
              {q.type === 'text' && (
                <input type="text" value={answers[idx]} onChange={(e) => handleAnswerChange(idx, e.target.value)} required />
              )}
              {q.type === 'radio' && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label>
                    <input type="radio" name={`q${idx}`} value="Да" onChange={() => handleAnswerChange(idx, 'Да')} /> Да
                  </label>
                  <label>
                    <input type="radio" name={`q${idx}`} value="Нет" onChange={() => handleAnswerChange(idx, 'Нет')} /> Нет
                  </label>
                </div>
              )}
            </div>
          ))}
          <button type="submit" className="btn btn-primary">Отправить</button>
        </form>
      </div>
    </div>
  );
};