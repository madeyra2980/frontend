import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { orders as ordersApi, specialties } from '../api/client';
import SpecialtyIcon from '../components/SpecialtyIcon';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Фикс иконки маркера в react-leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const DEFAULT_CENTER = [43.238949, 76.945465]; // Алматы

function MapClickHandler({ onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { Accept: 'application/json' } }
    );
    const data = await res.json();
    return data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function searchAddress(query) {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      { headers: { Accept: 'application/json' } }
    );
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const POLL_INTERVAL_MS = 4000;

export default function Dashboard() {
  const [specialtyList, setSpecialtyList] = useState([]);
  const [specialtyId, setSpecialtyId] = useState('');
  const [description, setDescription] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [position, setPosition] = useState(null);
  const [addressText, setAddressText] = useState('');
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [mapKey, setMapKey] = useState(0);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationSearching, setLocationSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [pollingOrder, setPollingOrder] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    specialties()
      .then((data) => {
        const list = data.specialties || [];
        setSpecialtyList(list);
        if (list.length && !specialtyId) setSpecialtyId(list[0].id);
      })
      .catch(() => setSpecialtyList([]));
  }, []);

  // При загрузке: если уже есть заявка в поиске — показываем её статус и блокируем новую
  useEffect(() => {
    ordersApi
      .list(true)
      .then((data) => {
        const orders = data.orders || [];
        const openOrder = orders.find((o) => o.status === 'open');
        if (openOrder) {
          setPollingOrder(openOrder);
          setSheetOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter([lat, lng]);
        if (!position) {
          setPosition([lat, lng]);
          reverseGeocode(lat, lng).then(setAddressText);
        }
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  const handlePositionChange = useCallback(async (lat, lng) => {
    setPosition([lat, lng]);
    setAddressText('Загрузка...');
    const addr = await reverseGeocode(lat, lng);
    setAddressText(addr);
  }, []);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocationSearching(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter([lat, lng]);
        setMapKey((k) => k + 1);
        setPosition([lat, lng]);
        setAddressText('Загрузка...');
        const addr = await reverseGeocode(lat, lng);
        setAddressText(addr);
        setLocationSearching(false);
      },
      () => setLocationSearching(false),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleSearchLocation = useCallback(async () => {
    const list = await searchAddress(locationQuery);
    setLocationSuggestions(list);
  }, [locationQuery]);

  const handleSelectSuggestion = useCallback(async (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setCenter([lat, lng]);
    setMapKey((k) => k + 1);
    setPosition([lat, lng]);
    setAddressText(item.display_name);
    setLocationSuggestions([]);
    setLocationQuery('');
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    if (!specialtyId) {
      setError('Выберите услугу');
      return;
    }
    setLoading(true);
    try {
      const body = {
        specialtyId,
        description: description.trim() || null,
        proposedPrice: proposedPrice ? parseFloat(proposedPrice) : null,
        addressText: addressText.trim() || null,
      };
      if (position) {
        body.latitude = position[0];
        body.longitude = position[1];
      }
      const { order } = await ordersApi.create(body);
      setCreatedOrder(order);
      setPollingOrder(order);
    } catch (err) {
      setError(err.data?.error || err.message || 'Ошибка создания заявки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pollingOrder) return;
    const id = pollingOrder.id;
    const keepPolling = ['open', 'accepted', 'in_progress'].includes(pollingOrder.status);
    if (!keepPolling) return;
    const t = setInterval(async () => {
      try {
        const { order } = await ordersApi.get(id);
        setPollingOrder(order);
        if (order.status === 'accepted' || order.status === 'in_progress') {
          setCreatedOrder(order);
        }
      } catch (_) {}
    }, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [pollingOrder?.id, pollingOrder?.status]);

  const isSearching = pollingOrder?.status === 'open';
  const acceptedOrder =
    pollingOrder?.status === 'accepted' || pollingOrder?.status === 'in_progress' ? pollingOrder : null;

  const resetForm = () => {
    setCreatedOrder(null);
    setPollingOrder(null);
    setDescription('');
    setProposedPrice('');
    setAddressText('');
    setPosition(null);
    setSheetOpen(true);
  };

  useEffect(() => {
    if (
      pollingOrder?.status === 'open' ||
      pollingOrder?.status === 'accepted' ||
      pollingOrder?.status === 'in_progress'
    )
      setSheetOpen(true);
  }, [pollingOrder?.status]);

  return (
    <div>
      <div className="dashboard-map-wrap">
          {locationSuggestions.length > 0 && (
            <ul className="location-suggestions">
              {locationSuggestions.map((item) => (
                <li key={item.place_id}>
                  <button type="button" className="suggestion-btn" onClick={() => handleSelectSuggestion(item)}>
                    {item.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        <button
          type="button"
          className="map-locate-btn"
          onClick={handleMyLocation}
          disabled={locationSearching}
          title="Моё местоположение"
          aria-label="Моё местоположение"
        >
          {locationSearching ? (
            <span className="map-locate-spinner" aria-hidden />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41" />
            </svg>
          )}
        </button>
          <MapContainer
            key={mapKey}
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapClickHandler onPositionChange={handlePositionChange} />
            {position && <Marker position={position} />}
          </MapContainer>
      </div>

      {/* Кнопка «Создать заявку» — скрыта, пока есть заявка в поиске специалиста */}
      <button
        type="button"
        className={`dashboard-fab ${sheetOpen || isSearching ? 'dashboard-fab--hidden' : ''}`}
        onClick={() => setSheetOpen(true)}
        aria-label="Создать заявку"
      >
        <span className="dashboard-fab-text">Создать заявку</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Затемнение при открытой панели — закрытие только если не в поиске специалиста */}
      <div
        className={`bottom-sheet-backdrop ${sheetOpen ? 'bottom-sheet-backdrop--visible' : ''}`}
        onClick={() => !isSearching && setSheetOpen(false)}
        aria-hidden
      />

      {/* Панель формы снизу вверх */}
      <div className={`bottom-sheet ${sheetOpen ? 'bottom-sheet--open' : ''} ${isSearching ? 'bottom-sheet--searching' : ''}`}>
        <div className="bottom-sheet__handle" onClick={() => !isSearching && setSheetOpen(false)} aria-hidden>
          <span />
        </div>
        <div className="bottom-sheet__content">
          {acceptedOrder ? (
            <div className="card bottom-sheet-card">
              <h3>
                {acceptedOrder.status === 'in_progress' ? 'Специалист едет к вам' : 'Исполнитель найден'}
              </h3>
              <p><strong>{acceptedOrder.specialistName || 'Специалист'}</strong></p>
              {acceptedOrder.specialistPhone && (
                <p><a href={`tel:${acceptedOrder.specialistPhone}`}>{acceptedOrder.specialistPhone}</a></p>
              )}
              <button type="button" className="btn btn-primary" onClick={resetForm}>
                Создать новую заявку
              </button>
            </div>
          ) : isSearching ? (
            <div className="card bottom-sheet-card order-status-search">
              <h3 className="order-status-search__title">В поиске специалиста</h3>
              <p className="order-status-search__message">Заявка отправлена. Ожидайте отклика специалиста.</p>
              <p className="order-status-search__hint">Пока заявка в поиске, создание новых заявок недоступно.</p>
            </div>
          ) : (
            <form onSubmit={handleCreateOrder} className="card bottom-sheet-card">
              <div className="form-group">
                <span className="form-label">Услуга</span>
                <div className="specialty-chips">
                  {specialtyList.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`btn specialty-chip-btn ${specialtyId === s.id ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSpecialtyId(s.id)}
                    >
                      <SpecialtyIcon id={s.id} />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Опишите задачу"
                />
              </div>
              <div className="form-group">
                <label>Предлагаемая цена (₸)</label>
                <input
                  type="number"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder="Необязательно"
                  min={0}
                  step={100}
                />
              </div>
              <div className="form-group">
                <label>Адрес (поиск на карте или клик на карту)</label>
                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="Кликните на карте или введите адрес"
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Создание...' : 'Создать заявку'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
