export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getAuthHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function login(responseData) {
  localStorage.setItem('token', responseData.token);
  localStorage.setItem('user', JSON.stringify(responseData.user));
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
