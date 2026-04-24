/* ═══════════════════════════════════════════════
   api.js — Age of The Dead · PlayAlmi API Client
   Base: http://hera-playalmi.switzerlandnorth.cloudapp.azure.com:3000
   ═══════════════════════════════════════════════ */

const API_BASE = '/api';

// ─── TOKEN HELPERS ───────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('aotd_token'),
  getUser:  () => JSON.parse(localStorage.getItem('aotd_user') || 'null'),
  setSession(token, user) {
    localStorage.setItem('aotd_token', token);
    localStorage.setItem('aotd_user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('aotd_token');
    localStorage.removeItem('aotd_user');
  },
  isLoggedIn: () => !!localStorage.getItem('aotd_token'),
  isAdmin:    () => {
    const u = JSON.parse(localStorage.getItem('aotd_user') || '{}');
    return u.role === 'admin';
  }
};

// ─── BASE FETCH ──────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

// ─── AUTH ENDPOINTS ──────────────────────────────
const AuthAPI = {
  async register(username, email, password) {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
  },
 async login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  // Guardamos el token primero para poder llamar a /profile
  Auth.setSession(data.token, { username: data.username, avatar: data.avatar, role: 'user' });
  // Cargamos el perfil completo que incluye el role real
  try {
    const profile = await apiFetch('/auth/profile');
    Auth.setSession(data.token, {
      username: profile.username,
      avatar: profile.avatar,
      role: profile.role,
      id: profile._id
    });
  } catch(_) {}
  return data;
},
  async getProfile() {
    return apiFetch('/auth/profile');
  },
  async updateProfile(username, email) {
    return apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ username, email })
    });
  },
  async updateAvatar(avatarBase64) {
    return apiFetch('/auth/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar: avatarBase64 })
    });
  },
  async changePassword(currentPassword, newPassword) {
    return apiFetch('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },
  async deleteAccount() {
    return apiFetch('/auth/profile', { method: 'DELETE' });
  },
  async forgotPassword(email) {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },
  async resetPassword(token, newPassword) {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  },
  logout() {
    Auth.clear();
    window.location.href = 'index.html';
  }
};

// ─── SCORES ENDPOINTS ────────────────────────────
const ScoresAPI = {
  async submitScore(score, level, difficulty) {
    return apiFetch('/scores', {
      method: 'POST',
      body: JSON.stringify({ score, level, difficulty })
    });
  },
  async getRanking() {
    return apiFetch('/scores/ranking');
  },
  async getRankingByDifficulty(difficulty) {
    // difficulty: 'easy' | 'medium' | 'hard'
    return apiFetch(`/scores/ranking/${difficulty}`);
  },
  async getHistory() {
    return apiFetch('/scores/history');
  },
  async getBestScore(userId) {
    return apiFetch(`/scores/best/${userId}`);
  }
};

// ─── ADMIN ENDPOINTS ─────────────────────────────
const AdminAPI = {
  async getUsers() {
    return apiFetch('/admin/users');
  },
  async updateUser(id, username, email, role) {
    return apiFetch(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ username, email, role })
    });
  },
  async deleteUser(id) {
    return apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
  }
};

// ─── TOAST UTILITY ───────────────────────────────
let _toastTimer;
function showToast(msg, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

// ─── LANG UTILITY ────────────────────────────────
let _lang = localStorage.getItem('aotd_lang') || 'en';
function applyLang() {
  document.querySelectorAll('[data-en]').forEach(el => {
    const val = el.getAttribute('data-' + _lang);
    if (val) el.innerHTML = val;
  });
  const btn = document.getElementById('lang-btn');
  if (btn) btn.textContent = _lang === 'en' ? 'EN / ES' : 'ES / EN';
}
function toggleLang() {
  _lang = _lang === 'en' ? 'es' : 'en';
  localStorage.setItem('aotd_lang', _lang);
  applyLang();
}
document.addEventListener('DOMContentLoaded', applyLang);

// ─── NAV AUTH STATE ──────────────────────────────
function renderNavAuth() {
  const loginBtn  = document.getElementById('nav-login-btn');
  const registerBtn = document.getElementById('nav-register-btn');
  const logoutBtn = document.getElementById('nav-logout-btn');
  const profileBtn = document.getElementById('nav-profile-btn');
  const adminBtn  = document.getElementById('nav-admin-btn');

  if (Auth.isLoggedIn()) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = '';
    if (profileBtn) profileBtn.style.display = '';
    if (adminBtn) adminBtn.style.display = Auth.isAdmin() ? '' : 'none';
  } else {
    if (loginBtn) loginBtn.style.display = '';
    if (registerBtn) registerBtn.style.display = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (profileBtn) profileBtn.style.display = 'none';
    if (adminBtn) adminBtn.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', renderNavAuth);