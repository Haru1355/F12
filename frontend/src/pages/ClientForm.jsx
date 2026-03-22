import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formService } from '../services/formService';
import api from '../services/api';

export const ClientForm = () => {
  const { formId } = useParams();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadForm = async () => {
      try {
        const data = await formService.getFormByLink(formId);
        setTest(data);
      } catch {
        setError('Тест не найден или не опубликован');
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [formId]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultipleChange = (questionId, optionId, checked) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, optionId] };
      } else {
        return { ...prev, [questionId]: current.filter(id => id !== optionId) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Пожалуйста, введите ваше имя');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Создаём сессию
      const sessionRes = await api.post(`/sessions/start/${formId}`);
      const sessionId = sessionRes.data.id;

      // 2. Формируем массив ответов
      const answersArray = [];
      for (const question of test.questions) {
        const answer = answers[question.id];
        const answerObj = { question_id: question.id };

        if (question.question_type === 'single_choice') {
          answerObj.selected_option_id = answer || null;
        } else if (question.question_type === 'multiple_choice') {
          answerObj.selected_option_ids = answer || [];
        } else if (question.question_type === 'text') {
          answerObj.text_value = answer || '';
        } else if (question.question_type === 'scale') {
          answerObj.scale_value = answer ? parseInt(answer) : null;
        }

        answersArray.push(answerObj);
      }

      // 3. Отправляем ответы
      const submitRes = await api.post(`/sessions/${sessionId}/submit`, {
        client_name: clientName,
        client_email: clientEmail || null,
        answers: answersArray,
      });

      setResults(submitRes.data.results);
      setSubmitted(true);
    } catch (err) {
      alert('Ошибка при отправке: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
        <p style={{ color: '#64748b', marginTop: '12px' }}>Загрузка теста...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
      <h2 style={{ color: '#1e293b', marginBottom: '8px' }}>Тест не найден</h2>
      <p style={{ color: '#64748b' }}>{error}</p>
    </div>
  );

  if (submitted) return (
    <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 20px' }}>
      <div style={{
        background: 'white', borderRadius: '24px', padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ color: '#1e293b', marginBottom: '12px' }}>Спасибо за участие!</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Ваши ответы успешно отправлены.
        </p>
        {results && test.show_result_to_client !== false && (
          <div style={{
            background: '#f0f9ff', borderRadius: '16px', padding: '20px',
            textAlign: 'left',
          }}>
            <h3 style={{ marginBottom: '12px', color: '#0369a1' }}>Ваши результаты:</h3>
            {results.total_score !== undefined && (
              <p><strong>Общий балл:</strong> {results.total_score}</p>
            )}
            {results.metrics && Object.keys(results.metrics).length > 0 && (
              <div>
                <p style={{ fontWeight: '600', marginTop: '12px' }}>Метрики:</p>
                {Object.entries(results.metrics).map(([key, val]) => (
                  <p key={key} style={{ marginLeft: '12px' }}>• {key}: {val}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{
        background: 'white', borderRadius: '24px', padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
          {test.title}
        </h1>
        {test.description && (
          <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>
            {test.description}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Имя клиента */}
          <div className="form-group">
            <label>Ваше имя *</label>
            <input
              type="text" value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required placeholder="Введите ваше имя"
            />
          </div>
          <div className="form-group">
            <label>Email (необязательно)</label>
            <input
              type="email" value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

          {/* Вопросы */}
          {test.questions.map((q, idx) => (
            <div key={q.id} style={{
              marginBottom: '24px', padding: '20px',
              background: '#f8fafc', borderRadius: '16px',
              border: '1px solid #e2e8f0',
            }}>
              <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '12px', display: 'block' }}>
                {idx + 1}. {q.text}
                {q.is_required && <span style={{ color: '#ef4444' }}> *</span>}
              </label>

              {/* Один вариант */}
              {q.question_type === 'single_choice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options.map(opt => (
                    <label key={opt.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                      background: answers[q.id] === opt.id ? '#e0f2fe' : 'white',
                      border: `2px solid ${answers[q.id] === opt.id ? '#0369a1' : '#e2e8f0'}`,
                      transition: 'all 0.2s',
                    }}>
                      <input
                        type="radio" name={`q_${q.id}`}
                        value={opt.id}
                        checked={answers[q.id] === opt.id}
                        onChange={() => handleAnswerChange(q.id, opt.id)}
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              )}

              {/* Несколько вариантов */}
              {q.question_type === 'multiple_choice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options.map(opt => (
                    <label key={opt.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                      background: (answers[q.id] || []).includes(opt.id) ? '#e0f2fe' : 'white',
                      border: `2px solid ${(answers[q.id] || []).includes(opt.id) ? '#0369a1' : '#e2e8f0'}`,
                      transition: 'all 0.2s',
                    }}>
                      <input
                        type="checkbox"
                        checked={(answers[q.id] || []).includes(opt.id)}
                        onChange={(e) => handleMultipleChange(q.id, opt.id, e.target.checked)}
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              )}

              {/* Текст */}
              {q.question_type === 'text' && (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  rows={3} placeholder="Введите ваш ответ..."
                  style={{ resize: 'vertical' }}
                />
              )}

              {/* Шкала */}
              {q.question_type === 'scale' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {q.scale_config?.min ?? 1}
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0369a1' }}>
                      {answers[q.id] ?? '—'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {q.scale_config?.max ?? 10}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={q.scale_config?.min ?? 1}
                    max={q.scale_config?.max ?? 10}
                    value={answers[q.id] || q.scale_config?.min || 1}
                    onChange={(e) => handleAnswerChange(q.id, parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? '⏳ Отправка...' : '📤 Отправить ответы'}
          </button>
        </form>
      </div>
    </div>
  );
};