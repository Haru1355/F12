import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

export const PsychologistProfile = () => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    telegram: '',
    education_level: '',
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadProfile = async () => {
    try {
      const data = await authService.getMe();
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        telegram: data.telegram || '',
        education_level: data.education_level || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
      });
      if (setUser) setUser(data);
    } catch {
      showMsg('Ошибка загрузки профиля');
    }
  };

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await authService.updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        telegram: profile.telegram,
        education_level: profile.education_level,
        bio: profile.bio,
      });
      setProfile((prev) => ({ ...prev, ...updated }));
      if (setUser) setUser(updated);
      setEditing(false);
      showMsg('Профиль сохранён');
    } catch {
      showMsg('Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const updated = await authService.uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatar_url: updated.avatar_url }));
      if (setUser) setUser(updated);
      showMsg('Фото обновлено');
    } catch {
      showMsg('Ошибка загрузки фото');
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = profile.avatar_url
    ? `http://localhost:8000${profile.avatar_url}`
    : null;

  const educationOptions = [
    'Среднее специальное',
    'Бакалавриат',
    'Магистратура',
    'Аспирантура / PhD',
    'Кандидат наук',
    'Доктор наук',
    'Курсы повышения квалификации',
  ];

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
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

      {/* ── Карточка профиля ── */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Шапка */}
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            height: 120,
            position: 'relative',
          }}
        />

        {/* Аватар */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -50 }}>
          <div
            onClick={handleAvatarClick}
            title="Нажмите чтобы сменить фото"
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: '4px solid #fff',
              background: avatarSrc ? `url(${avatarSrc}) center/cover` : '#e0e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 36,
              fontWeight: 700,
              color: '#6366f1',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {!avatarSrc && (profile.full_name?.charAt(0)?.toUpperCase() || '?')}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 28,
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              📷
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>

        {/* Содержимое */}
        <div style={{ padding: '16px 32px 32px' }}>
          {!editing ? (
            /* ── Режим просмотра ── */
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: '8px 0 4px', fontSize: 24 }}>{profile.full_name}</h1>
                <span
                  style={{
                    background: '#e0e7ff',
                    color: '#4338ca',
                    padding: '3px 12px',
                    borderRadius: 20,
                    fontSize: 13,
                  }}
                >
                  Психолог
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <InfoBlock label="📧 Email" value={user?.email} />
                <InfoBlock label="📱 Телефон" value={profile.phone || '—'} />
                <InfoBlock label="✈️ Telegram" value={profile.telegram || '—'} />
                <InfoBlock label="🎓 Образование" value={profile.education_level || '—'} />
              </div>

              {profile.bio && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: '#374151' }}>
                    О себе
                  </div>
                  <p style={{ color: '#6b7280', lineHeight: 1.6 }}>{profile.bio}</p>
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 32px',
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  ✏️ Редактировать профиль
                </button>
              </div>
            </>
          ) : (
            /* ── Режим редактирования ── */
            <form onSubmit={handleSave}>
              <h2 style={{ marginBottom: 20 }}>Редактирование профиля</h2>

              <Field label="ФИО *">
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="Телефон">
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="+7 (999) 123-45-67"
                  style={inputStyle}
                />
              </Field>

              <Field label="Telegram">
                <input
                  type="text"
                  value={profile.telegram}
                  onChange={(e) =>
                    setProfile({ ...profile, telegram: e.target.value })
                  }
                  placeholder="@username"
                  style={inputStyle}
                />
              </Field>

              <Field label="Уровень образования">
                <select
                  value={profile.education_level}
                  onChange={(e) =>
                    setProfile({ ...profile, education_level: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="">— Выберите —</option>
                  {educationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="О себе">
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  rows={4}
                  placeholder="Расскажите о своём опыте, специализации..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </Field>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'flex-end',
                  marginTop: 16,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    loadProfile();
                  }}
                  style={{
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    padding: '10px 24px',
                    cursor: 'pointer',
                  }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    cursor: 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Сохранение...' : '💾 Сохранить'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Вспомогательные компоненты ── */

const InfoBlock = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 15, color: '#374151' }}>{value}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label
      style={{
        display: 'block',
        fontWeight: 600,
        marginBottom: 6,
        fontSize: 14,
        color: '#374151',
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  boxSizing: 'border-box',
  outline: 'none',
};