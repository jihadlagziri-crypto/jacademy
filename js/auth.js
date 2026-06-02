var DB_KEY      = 'jacademy_users';
var SESSION_KEY = 'jacademy_session';
var ADMIN_EMAIL    = 'admin@jacademy.ma';
var ADMIN_PASSWORD = 'admin1234';
var ADMIN_KEY      = 'jacademy_admin_session';

function getUsers()        { return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); }
function saveUsers(users)  { localStorage.setItem(DB_KEY, JSON.stringify(users)); }
function setSession(user)  { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
function getSession()      { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }

function logout() {
  API.logout().catch(function(){});
  localStorage.removeItem(SESSION_KEY);
  var inPages = window.location.pathname.indexOf('/pages/') !== -1;
  window.location.href = inPages ? '../index.html' : 'index.html';
}

function handleSignup(e) {
  e.preventDefault();
  clearErrors();
  var name     = document.getElementById('signup-name').value.trim();
  var email    = document.getElementById('signup-email').value.trim().toLowerCase();
  var password = document.getElementById('signup-password').value;
  var confirm  = document.getElementById('signup-confirm').value;
  if (!name || name.length < 2)    return showError('signup-name',     'Veuillez entrer votre nom complet.');
  if (!isValidEmail(email))        return showError('signup-email',    'Adresse e-mail invalide.');
  if (password.length < 6)         return showError('signup-password', 'Le mot de passe doit contenir au moins 6 caractères.');
  if (password !== confirm)        return showError('signup-confirm',  'Les mots de passe ne correspondent pas.');

  var users = getUsers();
  if (users.find(function(u){ return u.email === email; }))
    return showError('signup-email', 'Ce compte existe déjà. Connecte-toi.');

  var newUser = { id: Date.now(), name: name, email: email, password: btoa(password), level: null, banned: false, createdAt: new Date().toISOString() };
  users.push(newUser);
  saveUsers(users);
  setSession(newUser);

  if (window.API) {
    API.signup(name, email, password).then(function(r) {
      setToken(r.token);
    }).catch(function(){});
  }

  showSuccess('Compte créé ! Redirection...');
  setTimeout(function(){ window.location.href = 'pages/niveau.html'; }, 1200);
}

function handleLogin(e) {
  e.preventDefault();
  clearErrors();
  var email    = document.getElementById('login-email').value.trim().toLowerCase();
  var password = document.getElementById('login-password').value;
  if (!isValidEmail(email)) return showError('login-email',    'Adresse e-mail invalide.');
  if (!password)            return showError('login-password', 'Veuillez entrer votre mot de passe.');

  var users = getUsers();
  var user  = users.find(function(u){ return u.email === email && u.password === btoa(password); });

  // Admin login detection
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify({ email: email }));
    if (window.API) {
      API.login(email, password).then(function(r) { setToken(r.token); }).catch(function(){});
    }
    showSuccess('Connexion admin réussie ! Redirection...');
    setTimeout(function(){ window.location.href = 'pages/admin-dashboard.html'; }, 1000);
    return;
  }

  if (user) {
    setSession(user);
    showSuccess('Connexion réussie ! Redirection...');
    if (window.API) {
      API.login(email, password).then(function(r) { setToken(r.token); }).catch(function(){});
    }
    setTimeout(function(){
      if (!user.level) { window.location.href = 'pages/niveau.html'; }
      else             { window.location.href = 'pages/modules.html'; }
    }, 1000);
  } else {
    if (window.API) {
      var btn = document.querySelector('#login-form button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Connexion...';
      API.login(email, password).then(function(r) {
        setToken(r.token);
        var newUser = { id: r.user.id, name: r.user.name, email: r.user.email, password: btoa(password), level: r.user.level, banned: false, createdAt: r.user.createdAt };
        var u = getUsers();
        if (!u.find(function(x){ return x.email === email; })) { u.push(newUser); saveUsers(u); }
        setSession(newUser);
        showSuccess('Connexion réussie ! Redirection...');
        setTimeout(function(){
          if (!newUser.level) { window.location.href = 'pages/niveau.html'; }
          else                { window.location.href = 'pages/modules.html'; }
        }, 1000);
      }).catch(function() {
        showAlertError('E-mail ou mot de passe incorrect.');
        btn.disabled = false; btn.innerHTML = 'Se connecter &nbsp;<i class="ti ti-arrow-right"></i>';
      });
    } else {
      showAlertError('E-mail ou mot de passe incorrect.');
    }
  }
}

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function showError(inputId, message) {
  var input = document.getElementById(inputId);
  if (!input) return;
  input.style.borderColor = '#C0392B';
  var group = input.closest('.form-group');
  var err = group ? group.querySelector('.field-error') : null;
  if (err) { err.textContent = message; err.classList.remove('hidden'); }
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(function(e){ e.classList.add('hidden'); });
  document.querySelectorAll('.form-control').forEach(function(i){ i.style.borderColor = ''; });
  var alert = document.getElementById('form-alert');
  if (alert) alert.classList.add('hidden');
}

function showAlertError(message) {
  var alert = document.getElementById('form-alert');
  if (!alert) return;
  alert.className = 'alert alert-error';
  alert.textContent = message;
  alert.classList.remove('hidden');
}

function showSuccess(message) {
  var alert = document.getElementById('form-alert');
  if (!alert) return;
  alert.className = 'alert alert-success';
  alert.textContent = message;
  alert.classList.remove('hidden');
}

function switchTab(tab) {
  var loginForm  = document.getElementById('login-form');
  var signupForm = document.getElementById('signup-form');
  document.querySelectorAll('.auth-tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelector('[data-tab="' + tab + '"]').classList.add('active');
  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  } else {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
  clearErrors();
}

function initPasswordToggles() {
  document.querySelectorAll('.toggle-password').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var targetId = btn.getAttribute('data-target');
      var input    = document.getElementById(targetId);
      if (!input) return;
      input.type   = (input.type === 'password') ? 'text' : 'password';
      var icon     = btn.querySelector('i');
      if (icon) icon.className = (input.type === 'password') ? 'ti ti-eye' : 'ti ti-eye-off';
    });
  });
}

function initProtections() {
  // Anti-copie (sauf inputs)
  document.addEventListener('copy', function(e) { e.preventDefault(); });
  document.addEventListener('cut', function(e) { e.preventDefault(); });
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('selectstart', function(e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
  });

  // Anti-raccourcis clavier (téléchargement, impression, sources, devtools, capture)
  function onKeyDown(e) {
    var k = e.key;
    if (k === 'F12') { e.preventDefault(); return; }
    if (e.metaKey && e.shiftKey && (k === 's' || k === 'S')) { e.preventDefault(); return; }
    if (e.ctrlKey || e.metaKey) {
      if (['s', 'p', 'u', 'S', 'P', 'U'].indexOf(k) !== -1) { e.preventDefault(); return; }
      if (e.shiftKey && ['i', 'j', 'c', 'I', 'J', 'C'].indexOf(k) !== -1) { e.preventDefault(); return; }
    }
  }
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('keydown', onKeyDown, true); // capture phase
}

initProtections();

document.addEventListener('DOMContentLoaded', function() {
  initPasswordToggles();
  var signupForm = document.getElementById('signup-form');
  var loginForm  = document.getElementById('login-form');
  if (signupForm) signupForm.addEventListener('submit', handleSignup);
  if (loginForm)  loginForm.addEventListener('submit', handleLogin);
});
