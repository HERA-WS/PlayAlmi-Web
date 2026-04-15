const API_URL = 'http://hera-playalmi.switzerlandnorth.cloudapp.azure.com/api';

// ===== TOKEN HELPERS =====
function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('avatar');
}

function isLoggedIn() {
  return !!getToken();
}

// ===== API HELPER =====
async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Error en la petición');
  return data;
}

// ===== NAVBAR USER STATE =====
function updateNavbar() {
  const username = localStorage.getItem('username');
  const $loginBtn = $('#nav-login');
  const $registerBtn = $('#nav-register');
  const $profileBtn = $('#nav-profile');
  const $logoutBtn = $('#nav-logout');
  const $usernameSpan = $('#nav-username');

  if (isLoggedIn() && username) {
    $loginBtn?.hide();
    $registerBtn?.hide();
    $profileBtn?.show();
    $logoutBtn?.show();
    $usernameSpan?.text(username).show();
  } else {
    $loginBtn?.show();
    $registerBtn?.show();
    $profileBtn?.hide();
    $logoutBtn?.hide();
    $usernameSpan?.hide();
  }
}

// ===== LOGOUT =====
function logout() {
  removeToken();
  window.location.href = 'index.html';
}

// ===== NAVBAR HAMBURGER =====
$(document).ready(function () {
  updateNavbar();

  $('#hamburger').on('click', function () {
    $('#nav-links').toggleClass('open');
  });

  $('#nav-logout').on('click', function (e) {
    e.preventDefault();
    logout();
  });
});
