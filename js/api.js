var API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3001/api' : '/api';
var TOKEN_KEY = 'jacademy_token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); }

function api(path, options) {
  options = options || {};
  var headers = options.headers || {};
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  var token = getToken();
  if (token) headers['Authorization'] = token;
  if (options.formData) {
    delete headers['Content-Type'];
    return fetch(API_BASE + path, { method: options.method || 'GET', headers: headers, body: options.formData }).then(function(r) {
      if (!r.ok) return r.json().then(function(e) { throw new Error(e.error || 'Erreur serveur'); });
      return r.json();
    });
  }
  return fetch(API_BASE + path, {
    method: options.method || 'GET',
    headers: headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  }).then(function(r) {
    if (!r.ok) return r.json().then(function(e) { throw new Error(e.error || 'Erreur serveur'); });
    return r.json();
  });
}

var API = {
  // Auth
  signup: function(name, email, password) {
    return api('/auth/signup', { method: 'POST', body: { name: name, email: email, password: password } });
  },
  login: function(email, password) {
    return api('/auth/login', { method: 'POST', body: { email: email, password: password } });
  },
  logout: function() {
    var token = getToken();
    setToken(null);
    return api('/auth/logout', { method: 'POST', body: { token: token } });
  },
  getSession: function() {
    return api('/auth/session');
  },
  setLevel: function(level) {
    return api('/auth/user/level', { method: 'PUT', body: { level: level } });
  },

  // Content
  getContent: function(params) {
    var q = '?';
    if (params) Object.keys(params).forEach(function(k) { if (params[k]) q += k + '=' + encodeURIComponent(params[k]) + '&'; });
    return api('/content' + q);
  },
  addContent: function(data) {
    return api('/content', { method: 'POST', body: data });
  },
  updateContent: function(id, data) {
    return api('/content/' + id, { method: 'PUT', body: data });
  },
  deleteContent: function(id) {
    return api('/content/' + id, { method: 'DELETE' });
  },
  toggleContent: function(id) {
    return api('/content/' + id + '/toggle', { method: 'PUT' });
  },

  // Users
  getUsers: function() {
    return api('/users');
  },
  banUser: function(id) {
    return api('/users/' + id + '/ban', { method: 'PUT' });
  },
  deleteUser: function(id) {
    return api('/users/' + id, { method: 'DELETE' });
  },

  // Upload
  uploadFile: function(file) {
    var fd = new FormData();
    fd.append('file', file);
    return api('/upload', { method: 'POST', formData: fd });
  },

  // Activity
  getActivity: function() {
    return api('/activity');
  },

  // Mail
  sendNotification: function(title, message) {
    return api('/mail/send', { method: 'POST', body: { title: title, message: message } });
  },
  getMailStatus: function() {
    return api('/mail/status');
  }
};
