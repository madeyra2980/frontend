import { useState, useEffect } from 'react';
import { profile as profileApi, specialties } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { uploadUrl } from '../api/client';

export default function Profile() {
  const { user: authUser, refreshUser } = useAuth();
  const [user, setUser] = useState(null);
  const [specialtyList, setSpecialtyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [edit, setEdit] = useState({ firstName: '', lastName: '', phone: '' });
  const [specialist, setSpecialist] = useState({ isSpecialist: false, specialistBio: '', specialistSpecialties: [], specialistCity: '' });

  useEffect(() => {
    profileApi
      .me()
      .then((data) => {
        const u = data.user;
        setUser(u);
        setEdit({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '' });
        setSpecialist({
          isSpecialist: !!u.isSpecialist,
          specialistBio: u.specialistBio || '',
          specialistSpecialties: u.specialistSpecialties || [],
          specialistCity: u.specialistCity || '',
        });
      })
      .catch((err) => setError(err.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    specialties().then((d) => setSpecialtyList(d.specialties || [])).catch(() => {});
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await profileApi.update(edit);
      setSuccess('Профиль обновлён');
      refreshUser();
      const res = await profileApi.me();
      setUser(res.user);
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSpecialist = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await profileApi.setSpecialist(specialist);
      setSuccess(specialist.isSpecialist ? 'Режим специалиста включён' : 'Режим специалиста отключён');
      refreshUser();
      const res = await profileApi.me();
      setUser(res.user);
      setSpecialist({
        isSpecialist: !!res.user.isSpecialist,
        specialistBio: res.user.specialistBio || '',
        specialistSpecialties: res.user.specialistSpecialties || [],
        specialistCity: res.user.specialistCity || '',
      });
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = user?.avatar || user?.picture;
  const fullUrl = avatarUrl && !avatarUrl.startsWith('http') ? uploadUrl(avatarUrl) : avatarUrl;

  if (loading) return <p>Загрузка...</p>;

  return (
    <>
      <div className="card">
        <h1>Профиль</h1>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          {fullUrl && (
            <img src={fullUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <div>
            <strong>{user?.fullName || authUser?.name}</strong>
            <div style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label>Имя</label>
            <input value={edit.firstName} onChange={(e) => setEdit((p) => ({ ...p, firstName: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Фамилия</label>
            <input value={edit.lastName} onChange={(e) => setEdit((p) => ({ ...p, lastName: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Телефон</label>
            <input value={edit.phone} onChange={(e) => setEdit((p) => ({ ...p, phone: e.target.value }))} placeholder="+7 ..." />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
        </form>
      </div>
    </>
  );
}
