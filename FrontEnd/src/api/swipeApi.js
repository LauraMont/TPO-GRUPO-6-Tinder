const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

console.log('swipeApi using base URL:', API_BASE);

async function handleResponse(res) {
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const errorMessage = typeof data === 'object' && data !== null
        ? data.detail || data.message || res.statusText
        : data || res.statusText;
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data ?? text;
  } catch {
    if (!res.ok) {
      const error = new Error(text || res.statusText);
      error.status = res.status;
      error.data = text || null;
      throw error;
    }
  }

  return text;
}

const getFeed = async ({ debug = false } = {}) => {
  const url = new URL(`${API_BASE}/api/discover/feed`);
  if (debug) url.searchParams.set('debug', 'true');


  const hardcodedUserId = "u001";

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Simulamos que el ID es el token de sesión
      'Authorization': `Bearer ${hardcodedUserId}` 
    }
  });

  return handleResponse(res);
};

const like = async (userId) => {

  const hardcodedUserId = "u001";
  const res = await fetch(`${API_BASE}/api/swipe/like/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hardcodedUserId}`
    },
  });
  return handleResponse(res);
};

const pass = async (userId) => {

  const hardcodedUserId = "u001";
  const res = await fetch(`${API_BASE}/api/swipe/pass/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hardcodedUserId}`
    },
  });
  return handleResponse(res);
};

const getMatches = async () => {

  const hardcodedUserId = "u001";
  const res = await fetch(`${API_BASE}/api/matches`, {
    headers: {
      'Authorization': `Bearer ${hardcodedUserId}`
    }
  });
  return handleResponse(res);
};

export default {
  getFeed,
  like,
  pass,
  getMatches,
};
