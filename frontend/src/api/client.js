const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Centralized HTTP Client helper.
 * Automatically injects the JWT Bearer token from localStorage.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle empty body responses (e.g., 204 No Content on delete)
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If token expired or invalid, clear local storage
    if (response.status === 401 && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    const errorMessage = data.detail || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
