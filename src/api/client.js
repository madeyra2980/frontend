const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-2-jbcd.onrender.com';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || res.statusText || 'Ошибка запроса');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const auth = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/auth/me'),
  logout: () => api('/auth/logout', { method: 'POST', credentials: 'include' }),
};

export const profile = {
  me: () => api('/profile/me'),
  update: (body) => api('/profile/me', { method: 'PUT', body: JSON.stringify(body) }),
  setSpecialist: (body) => api('/profile/me/specialist', { method: 'PATCH', body: JSON.stringify(body) }),
  specialists: (city) => api(city ? `/profile/specialists?city=${encodeURIComponent(city)}` : '/profile/specialists'),
};

export const orders = {
  list: (my) => api(my ? '/orders?my=1' : '/orders'),
  get: (id) => api(`/orders/${id}`),
  create: (body) => api('/orders', { method: 'POST', body: JSON.stringify(body) }),
  accept: (id) => api(`/orders/${id}/accept`, { method: 'PATCH' }),
};

export const organizations = {
  list: (city) => api(city ? `/organizations?city=${encodeURIComponent(city)}` : '/organizations'),
  get: (id) => api(`/organizations/${id}`),
};

export const cities = {
  list: () => api('/cities'),
};

export const specialties = () => api('/specialties');

export function uploadUrl(path) {
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
}
