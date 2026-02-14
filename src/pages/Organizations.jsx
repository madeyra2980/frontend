import { useState, useEffect } from 'react';
import { organizations, cities } from '../api/client';

export default function Organizations() {
  const [list, setList] = useState([]);
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
    organizations
      .list(city || undefined)
      .then((data) => setList(data.organizations || []))
      .catch((err) => setError(err.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <>
      <h1>Организации</h1>
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
      ) : list.length === 0 ? (
        <div>Организации не найдены.</div>
      ) : (
        <div>
          {list.map((o) => (
            <div key={o.id}>
              <div>
                <strong>{o.name}</strong>
                {o.city && <span> · {o.city}</span>}
                {o.description && <div>{o.description}</div>}
                {o.address && <div>{o.address}</div>}
                {(o.phone || o.email) && (
                  <div>
                    {o.phone} {o.email}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
