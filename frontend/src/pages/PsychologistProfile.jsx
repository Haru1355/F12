import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { formService } from '../services/formService';

export const PsychologistProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    telegram: '',
    whatsapp: '',
    bio: '',
    avatar: ''
  });
  const [message, setMessage] = useState('');
  const [recentForms, setRecentForms] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      const users = JSON.parse(localStorage.getItem('psych_users'));
      const fullUser = users.find(u => u.id === user.id);
      if (fullUser) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfile(fullUser);
        setFormData({
          name: fullUser.name || '',
          phone: fullUser.phone || '',
          telegram: fullUser.telegram || '',
          whatsapp: fullUser.whatsapp || '',
          bio: fullUser.bio || '',
          avatar: fullUser.avatar || ''
        });
      }
      const forms = formService.getFormsByPsychologist(user.id);
      setRecentForms(forms.slice(-3).reverse());
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await authService.updateProfile(user.id, formData);
    if (result.success) {
      setMessage('Профиль успешно обновлён');
      setTimeout(() => setMessage(''), 3000);
      setIsEditing(false);
      setProfile(prev => ({ ...prev, ...formData }));
    } else {
      setMessage('Ошибка при обновлении');
    }
  };

  if (!profile) return <div className="container">Загрузка...</div>;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container" style={{ maxWidth: '1000px', marginTop: '2rem' }}>
      {message && <div className="alert alert-success">{message}</div>}
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Шапка профиля */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
                {getInitials(profile.name)}
              </div>
            )}
            {isEditing && (
              <button onClick={() => fileInputRef.current.click()} style={{ position: 'absolute', bottom: 0, right: 0, background: '#4a90e2', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', cursor: 'pointer' }}>
                📷
              </button>
            )}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            {isEditing ? (
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="ФИО" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }} />
            ) : (
              <h1 style={{ fontSize: '1.8rem' }}>{profile.name}</h1>
            )}
            <p style={{ color: '#64748b' }}>Психолог • {profile.email}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">Редактировать профиль</button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSubmit} className="btn btn-primary">Сохранить</button>
                <button onClick={() => setIsEditing(false)} className="btn btn-outline">Отмена</button>
              </div>
            )}
          </div>
        </div>

        {/* О себе */}
        <div>
          <h3>О себе</h3>
          {isEditing ? (
            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="4" placeholder="Расскажите о вашем опыте, методах работы..." style={{ width: '100%' }} />
          ) : (
            <p>{profile.bio || 'Информация не заполнена'}</p>
          )}
        </div>

        {/* Контакты */}
        <div>
          <h3>Контакты для связи</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label>Телефон</label>
              {isEditing ? (
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+7 XXX XXX-XX-XX" />
              ) : (
                <p>{profile.phone || 'Не указан'}</p>
              )}
            </div>
            <div>
              <label>Telegram</label>
              {isEditing ? (
                <input type="text" name="telegram" value={formData.telegram} onChange={handleInputChange} placeholder="@username" />
              ) : (
                <p>{profile.telegram || 'Не указан'}</p>
              )}
            </div>
            <div>
              <label>WhatsApp</label>
              {isEditing ? (
                <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="+7 XXX XXX-XX-XX" />
              ) : (
                <p>{profile.whatsapp || 'Не указан'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Портфолио тестов */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Мои опросы</h2>
          <a href="/psychologist" className="btn btn-outline">Управлять опросами</a>
        </div>
        {recentForms.length === 0 ? (
          <p>У вас пока нет опросов. <a href="/psychologist">Создайте первый опрос</a></p>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {recentForms.map(form => (
              <div key={form.id} className="card" style={{ marginBottom: 0 }}>
                <h3>{form.title}</h3>
                <p>Создан: {new Date(form.createdAt).toLocaleDateString()}</p>
                <p>Вопросов: {form.questions.length}</p>
                <a href={`/form/${form.id}`} target="_blank" rel="noopener noreferrer">Посмотреть опрос</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};