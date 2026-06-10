const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

async function handleResponse(res) {
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = data?.detail || data?.message || res.statusText;
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    err.status = res.status; err.data = data; throw err;
  }
  return data ?? text;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getFeed = async ({ debug = false } = {}) => {
  const url = new URL(`${API_BASE}/api/discover/feed`);
  if (debug) url.searchParams.set('debug', 'true');
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  return handleResponse(res);
};

const like = async (userId) => {
  const res = await fetch(`${API_BASE}/api/swipe/like/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  return handleResponse(res);
};

const pass = async (userId) => {
  const res = await fetch(`${API_BASE}/api/swipe/pass/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  return handleResponse(res);
};

const getMatches = async () => {
  const res = await fetch(`${API_BASE}/api/matches`, {
    headers: { ...getAuthHeader() },
  });
  return handleResponse(res);
};

export default { getFeed, like, pass, getMatches };
