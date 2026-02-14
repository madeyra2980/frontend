import { useState, useEffect } from 'react';
import { profile, cities } from '../api/client';
import { uploadUrl } from '../api/client';

export default function Specialists() {
  const [specialists, setSpecialists] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cities.list().then((d) => setCityList(d.cities || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    profile
      .specialists(city || undefined)
      .then((data) => setSpecialists(data.specialists || []))
      .catch((err) => setError(err.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [city]);

  const avatarUrl = (s) => {
    const v = s.avatar || s.googleAvatar;
    if (!v) return null;
    return v.startsWith('http') ? v : uploadUrl(v);
  };

  return (
    <>
      <h1>Специалисты</h1>
      <div>
        <label>Город</label>
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Все города</option>
          {cityList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {error && <p>{error}</p>}
      {loading ? (
        <p>Загрузка...</p>
      ) : specialists.length === 0 ? (
        <div>Специалисты не найдены.</div>
      ) : (
        <div>
          {specialists.map((s) => (
            <div key={s.id}>
              <div>
                {avatarUrl(s) && (
                  <img src={avatarUrl(s)} alt="" />
                )}
                <div>
                  <strong>{s.fullName || 'Специалист'}</strong>
                  {s.specialistCity && <span> · {s.specialistCity}</span>}
                  {s.rating > 0 && <span> · ★ {s.rating}</span>}
                  {s.specialistBio && <div>{s.specialistBio}</div>}
                  {s.specialistSpecialties?.length > 0 && (
                    <div>
                      {s.specialistSpecialties.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
