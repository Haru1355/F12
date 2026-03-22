import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formService } from '../services/formService';

const QUESTION_TYPES = [
  { value: 'single_choice', label: 'Один вариант' },
  { value: 'multiple_choice', label: 'Несколько вариантов' },
  { value: 'text', label: 'Свободный текст' },
  { value: 'scale', label: 'Шкала' },
];

export const TestConstructor = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [testSettings, setTestSettings] = useState({
    title: '',
    description: '',
    is_published: false,
    show_result_to_client: true,
  });

  const isNew = testId === 'new';

  useEffect(() => {
    if (!isNew) {
      loadTest();
    } else {
      setLoading(false);
    }
  }, [isNew, loadTest, testId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function loadTest() {
		try {
			const t = await formService.getForm(testId)
			setTest(t)
			setTestSettings({
				title: t.title,
				description: t.description || '',
				is_published: t.is_published,
				show_result_to_client: t.show_result_to_client,
			})
			const qs = await formService.getQuestions(testId)
			setQuestions(
				qs.map((q) => ({
					...q,
					_key: Math.random().toString(36).slice(2),
				}))
			)
		} catch {
			setMessage('Ошибка загрузки теста')
		} finally {
			setLoading(false)
		}
	}

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  /* ── Вопросы ── */

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        _key: Math.random().toString(36).slice(2),
        text: '',
        question_type: 'single_choice',
        order: prev.length,
        is_required: true,
        scale_config: null,
        branching_rules: null,
        options: [
          { text: '', order: 0, score: 0, metric_key: '' },
          { text: '', order: 1, score: 0, metric_key: '' },
        ],
      },
    ]);
  };

  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveQuestion = (idx, dir) => {
    setQuestions((prev) => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr.map((q, i) => ({ ...q, order: i }));
    });
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  /* ── Варианты ── */

  const addOption = (qIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: [
                ...q.options,
                {
                  text: '',
                  order: q.options.length,
                  score: 0,
                  metric_key: '',
                },
              ],
            }
          : q
      )
    );
  };

  const removeOption = (qIdx, oIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.filter((_, j) => j !== oIdx) }
          : q
      )
    );
  };

  const updateOption = (qIdx, oIdx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === oIdx ? { ...o, [field]: value } : o
              ),
            }
          : q
      )
    );
  };

  /* ── Сохранение ── */

  const handleSave = async () => {
    if (!testSettings.title.trim()) {
      showMsg('Введите название теста');
      return;
    }

    setSaving(true);
    try {
      let currentTestId = testId;

      if (isNew) {
        const created = await formService.createForm({
          title: testSettings.title,
          description: testSettings.description,
          is_published: testSettings.is_published,
          show_result_to_client: testSettings.show_result_to_client,
        });
        currentTestId = created.id;
      } else {
        await formService.updateForm(currentTestId, {
          title: testSettings.title,
          description: testSettings.description,
          is_published: testSettings.is_published,
          show_result_to_client: testSettings.show_result_to_client,
        });
      }

      // Сохраняем вопросы (bulk-замена)
      const payload = questions.map((q, i) => ({
        text: q.text,
        question_type: q.question_type,
        order: i,
        is_required: q.is_required,
        scale_config: q.scale_config,
        branching_rules: q.branching_rules,
        options: (q.options || []).map((o, j) => ({
          text: o.text,
          order: j,
          score: parseFloat(o.score) || 0,
          metric_key: o.metric_key || null,
        })),
      }));

      await formService.updateQuestions(currentTestId, payload);

      showMsg('✅ Тест сохранён!');

      if (isNew) {
        navigate(`/psychologist/constructor/${currentTestId}`, { replace: true });
      }
    } catch (err) {
      showMsg('Ошибка сохранения: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>Загрузка...</div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      {message && (
        <div
          style={{
            background: message.includes('✅') ? '#dcfce7' : '#fef3c7',
            color: message.includes('✅') ? '#166534' : '#92400e',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {message}
        </div>
      )}

      {/* ── Настройки теста ── */}
      <div style={cardStyle}>
        <h1 style={{ marginBottom: 20, fontSize: 22 }}>
          {isNew ? '🆕 Новый тест' : `✏️ Редактирование: ${testSettings.title}`}
        </h1>

        <Field label="Название теста *">
          <input
            type="text"
            value={testSettings.title}
            onChange={(e) =>
              setTestSettings({ ...testSettings, title: e.target.value })
            }
            placeholder="Например: Тест на тип личности"
            style={inputStyle}
          />
        </Field>

        <Field label="Описание">
          <textarea
            value={testSettings.description}
            onChange={(e) =>
              setTestSettings({ ...testSettings, description: e.target.value })
            }
            rows={3}
            placeholder="Краткое описание для клиента"
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </Field>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={testSettings.is_published}
              onChange={(e) =>
                setTestSettings({
                  ...testSettings,
                  is_published: e.target.checked,
                })
              }
            />
            Опубликован (доступен по ссылке)
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={testSettings.show_result_to_client}
              onChange={(e) =>
                setTestSettings({
                  ...testSettings,
                  show_result_to_client: e.target.checked,
                })
              }
            />
            Показывать результат клиенту
          </label>
        </div>
      </div>

      {/* ── Вопросы ── */}
      <div style={{ marginTop: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>Вопросы ({questions.length})</h2>
          <button onClick={addQuestion} style={btnPrimary}>
            + Добавить вопрос
          </button>
        </div>

        {questions.length === 0 && (
          <div
            style={{
              ...cardStyle,
              textAlign: 'center',
              color: '#9ca3af',
              padding: 40,
            }}
          >
            Нет вопросов. Нажмите «+ Добавить вопрос».
          </div>
        )}

        {questions.map((q, qIdx) => (
          <div key={q._key || qIdx} style={{ ...cardStyle, marginBottom: 16 }}>
            {/* Заголовок вопроса */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: '#6366f1',
                  fontSize: 15,
                }}
              >
                Вопрос #{qIdx + 1}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => moveQuestion(qIdx, -1)}
                  disabled={qIdx === 0}
                  style={btnSmall}
                >
                  ↑
                </button>
                <button
                  onClick={() => moveQuestion(qIdx, 1)}
                  disabled={qIdx === questions.length - 1}
                  style={btnSmall}
                >
                  ↓
                </button>
                <button
                  onClick={() => removeQuestion(qIdx)}
                  style={{ ...btnSmall, color: '#ef4444' }}
                >
                  🗑
                </button>
              </div>
            </div>

            {/* Текст вопроса */}
            <Field label="Текст вопроса">
              <input
                type="text"
                value={q.text}
                onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                placeholder="Введите текст вопроса"
                style={inputStyle}
              />
            </Field>

            {/* Тип и обязательность */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={labelStyle}>Тип</label>
                <select
                  value={q.question_type}
                  onChange={(e) =>
                    updateQuestion(qIdx, 'question_type', e.target.value)
                  }
                  style={inputStyle}
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <label
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  marginTop: 22,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={q.is_required}
                  onChange={(e) =>
                    updateQuestion(qIdx, 'is_required', e.target.checked)
                  }
                />
                Обязательный
              </label>
            </div>

            {/* Варианты ответов */}
            {(q.question_type === 'single_choice' ||
              q.question_type === 'multiple_choice') && (
              <div>
                <label style={labelStyle}>Варианты ответов</label>
                {(q.options || []).map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginBottom: 8,
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) =>
                        updateOption(qIdx, oIdx, 'text', e.target.value)
                      }
                      placeholder={`Вариант ${oIdx + 1}`}
                      style={{ ...inputStyle, flex: 3 }}
                    />
                    <input
                      type="number"
                      value={opt.score}
                      onChange={(e) =>
                        updateOption(qIdx, oIdx, 'score', e.target.value)
                      }
                      placeholder="Балл"
                      title="Баллы"
                      style={{ ...inputStyle, flex: 1, minWidth: 70 }}
                    />
                    <input
                      type="text"
                      value={opt.metric_key || ''}
                      onChange={(e) =>
                        updateOption(qIdx, oIdx, 'metric_key', e.target.value)
                      }
                      placeholder="Метрика"
                      title="Ключ метрики (необязательно)"
                      style={{ ...inputStyle, flex: 1.5, minWidth: 100 }}
                    />
                    <button
                      onClick={() => removeOption(qIdx, oIdx)}
                      style={{ ...btnSmall, color: '#ef4444' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOption(qIdx)}
                  style={{
                    background: 'none',
                    border: '1px dashed #d1d5db',
                    borderRadius: 6,
                    padding: '6px 16px',
                    cursor: 'pointer',
                    color: '#6366f1',
                    fontSize: 13,
                  }}
                >
                  + Добавить вариант
                </button>
              </div>
            )}

            {/* Шкала */}
            {q.question_type === 'scale' && (
              <div style={{ display: 'flex', gap: 16 }}>
                <Field label="Мин">
                  <input
                    type="number"
                    value={q.scale_config?.min ?? 1}
                    onChange={(e) =>
                      updateQuestion(qIdx, 'scale_config', {
                        ...(q.scale_config || {}),
                        min: parseInt(e.target.value),
                      })
                    }
                    style={{ ...inputStyle, width: 80 }}
                  />
                </Field>
                <Field label="Макс">
                  <input
                    type="number"
                    value={q.scale_config?.max ?? 10}
                    onChange={(e) =>
                      updateQuestion(qIdx, 'scale_config', {
                        ...(q.scale_config || {}),
                        max: parseInt(e.target.value),
                      })
                    }
                    style={{ ...inputStyle, width: 80 }}
                  />
                </Field>
                <Field label="Метрика">
                  <input
                    type="text"
                    value={q.scale_config?.metric_key || ''}
                    onChange={(e) =>
                      updateQuestion(qIdx, 'scale_config', {
                        ...(q.scale_config || {}),
                        metric_key: e.target.value,
                      })
                    }
                    placeholder="metric_key"
                    style={inputStyle}
                  />
                </Field>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Кнопки сохранения ── */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
          marginTop: 24,
          marginBottom: 60,
        }}
      >
        <button
          onClick={() => navigate('/psychologist')}
          style={{
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: '12px 28px',
            cursor: 'pointer',
            fontSize: 15,
          }}
        >
          ← Назад
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...btnPrimary,
            padding: '12px 36px',
            fontSize: 16,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Сохранение...' : '💾 Сохранить тест'}
        </button>
      </div>
    </div>
  );
};

/* ── Стили ── */

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  marginBottom: 4,
  fontSize: 13,
  color: '#374151',
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  boxSizing: 'border-box',
  outline: 'none',
};

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  padding: 24,
};

const btnPrimary = {
  background: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 24px',
  fontSize: 14,
  cursor: 'pointer',
  fontWeight: 600,
};

const btnSmall = {
  background: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  padding: '4px 10px',
  cursor: 'pointer',
  fontSize: 14,
};