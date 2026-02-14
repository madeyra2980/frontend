import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orders as ordersApi } from '../api/client';
import SpecialtyIcon from '../components/SpecialtyIcon';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [my, setMy] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    ordersApi
      .list(my)
      .then((data) => {
        if (!cancelled) setOrders(data.orders || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.data?.error || err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [my]);

  const handleAccept = async (id) => {
    try {
      await ordersApi.accept(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'accepted' } : o)));
    } catch (err) {
      setError(err.data?.error || err.message);
    }
  };

  const statusLabel = (s) => ({ open: 'Открыта', accepted: 'Принята', done: 'Выполнена' }[s] || s);

  return (
    <div className="page-content">
      <div className="card">
        <h1>Заявки</h1>
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`btn ${my ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMy(true)}
            style={{ marginRight: 8 }}
          >
            Мои заявки
          </button>
          <button
            type="button"
            className={`btn ${!my ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMy(false)}
          >
            Доступные
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
        {loading ? (
          <p>Загрузка...</p>
        ) : orders.length === 0 ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>
            {my ? 'У вас пока нет заявок.' : 'Нет доступных заявок по вашим специальностям.'}
            {my && <p style={{ marginTop: 12 }}><Link to="/">Создать заявку</Link></p>}
          </div>
        ) : (
          <div className="order-list">
            {orders.map((o) => (
              <div key={o.id} className="card order-item">
                <div>
                  <strong>#{o.id}</strong> — <span className="order-specialty"><SpecialtyIcon id={o.specialtyId} /> {o.specialtyLabel || o.specialtyId}</span> · {statusLabel(o.status)}
                  {o.description && <div style={{ marginTop: 4, color: 'var(--color-text-secondary)' }}>{o.description}</div>}
                  {o.proposedPrice != null && <span> · {o.proposedPrice} ₸</span>}
                </div>
                {!my && o.status === 'open' && (
                  <button type="button" className="btn btn-primary" onClick={() => handleAccept(o.id)} style={{ marginTop: 12 }}>
                    Принять
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
