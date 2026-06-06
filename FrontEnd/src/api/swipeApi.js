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

  // Hardcodeamos el ID de un usuario de prueba (ej. a1b2c3d4-0000-0000-0000-000000000013)
  const hardcodedUserId = "a1b2c3d4-0000-0000-0000-000000000013"; 

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
  // Hardcodeamos el ID de un usuario de prueba (ej. a1b2c3d4-0000-0000-0000-000000000013)
  const hardcodedUserId = "a1b2c3d4-0000-0000-0000-000000000013"; 
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
  // Hardcodeamos el ID de un usuario de prueba (ej. a1b2c3d4-0000-0000-0000-000000000013)
  const hardcodedUserId = "a1b2c3d4-0000-0000-0000-000000000013"; 
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
  // Hardcodeamos el ID de un usuario de prueba (ej. a1b2c3d4-0000-0000-0000-000000000013)
  const hardcodedUserId = "a1b2c3d4-0000-0000-0000-000000000013"; 
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
