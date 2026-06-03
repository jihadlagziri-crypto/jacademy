var ADMIN_EMAIL    = 'admin@jacademy.ma';
var ADMIN_PASSWORD = 'admin1234';
var ADMIN_KEY      = 'jacademy_admin_session';

function adminLogin(email, password) {
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return Promise.resolve(false);
  }
  localStorage.setItem(ADMIN_KEY, JSON.stringify({ email: email }));
  if (window.API) {
    API.login(email, password).then(function(r) { setToken(r.token); }).catch(function(){});
  }
  return Promise.resolve(true);
}

function getAdminSession() {
  return JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null');
}

function adminLogout() {
  API.logout().catch(function(){});
  localStorage.removeItem(ADMIN_KEY);
  window.location.href = 'admin-login.html';
}

function requireAdmin() {
  if (!getAdminSession()) {
    window.location.href = 'admin-login.html';
  }
}

function getContent() {
  var defaults = [
    // Maths
    { id:100, niveau:'all', matiere:'maths', type:'video',    titre:'Introduction — Les fonctions',          lien:'', duree:'28 min', visible:true, createdAt:'2026-01-01' },
    { id:101, niveau:'all', matiere:'maths', type:'video',    titre:'Limites et continuité',                  lien:'', duree:'41 min', visible:true, createdAt:'2026-01-01' },
    { id:102, niveau:'all', matiere:'maths', type:'video',    titre:'Dérivation — cours complet',             lien:'', duree:'55 min', visible:true, createdAt:'2026-01-01' },
    { id:103, niveau:'all', matiere:'maths', type:'video',    titre:'Intégration — bases',                    lien:'', duree:'48 min', visible:true, createdAt:'2026-01-01' },
    { id:104, niveau:'all', matiere:'maths', type:'video',    titre:'Probabilités et statistiques',           lien:'', duree:'36 min', visible:true, createdAt:'2026-01-01' },
    { id:105, niveau:'all', matiere:'maths', type:'resume',   titre:'Résumé — Les fonctions',                 lien:'', duree:'8 pages', visible:true, createdAt:'2026-01-01' },
    { id:106, niveau:'all', matiere:'maths', type:'resume',   titre:'Fiche mémo — Dérivation',                lien:'', duree:'4 pages', visible:true, createdAt:'2026-01-01' },
    { id:107, niveau:'all', matiere:'maths', type:'resume',   titre:'Résumé — Intégration',                   lien:'', duree:'6 pages', visible:true, createdAt:'2026-01-01' },
    { id:108, niveau:'all', matiere:'maths', type:'exercice', titre:'Série 1 — Fonctions et limites',         lien:'', duree:'12 exercices', visible:true, createdAt:'2026-01-01' },
    { id:109, niveau:'all', matiere:'maths', type:'exercice', titre:'Série 2 — Dérivation appliquée',         lien:'', duree:'10 exercices', visible:true, createdAt:'2026-01-01' },
    { id:110, niveau:'all', matiere:'maths', type:'exercice', titre:'Annales corrigées 2023',                 lien:'', duree:'20 exercices', visible:true, createdAt:'2026-01-01' },
    { id:111, niveau:'all', matiere:'maths', type:'quiz',     titre:'Quiz — Les fonctions',                   lien:'', duree:'20 questions', visible:true, createdAt:'2026-01-01' },
    { id:112, niveau:'all', matiere:'maths', type:'quiz',     titre:'Quiz — Dérivation',                      lien:'', duree:'15 questions', visible:true, createdAt:'2026-01-01' },
    // Physique
    { id:200, niveau:'all', matiere:'physique', type:'video',    titre:'Mécanique — Les forces',             lien:'', duree:'35 min', visible:true, createdAt:'2026-01-01' },
    { id:201, niveau:'all', matiere:'physique', type:'video',    titre:'Thermodynamique — cours 1',          lien:'', duree:'44 min', visible:true, createdAt:'2026-01-01' },
    { id:202, niveau:'all', matiere:'physique', type:'video',    titre:'Électricité — circuits RLC',         lien:'', duree:'52 min', visible:true, createdAt:'2026-01-01' },
    { id:203, niveau:'all', matiere:'physique', type:'video',    titre:'Ondes et vibrations',                lien:'', duree:'38 min', visible:true, createdAt:'2026-01-01' },
    { id:204, niveau:'all', matiere:'physique', type:'resume',   titre:'Résumé — Mécanique',                 lien:'', duree:'7 pages', visible:true, createdAt:'2026-01-01' },
    { id:205, niveau:'all', matiere:'physique', type:'resume',   titre:'Résumé — Électricité',               lien:'', duree:'5 pages', visible:true, createdAt:'2026-01-01' },
    { id:206, niveau:'all', matiere:'physique', type:'exercice', titre:'Série 1 — Forces et mouvement',      lien:'', duree:'10 exercices', visible:true, createdAt:'2026-01-01' },
    { id:207, niveau:'all', matiere:'physique', type:'exercice', titre:'Annales Physique 2023',              lien:'', duree:'18 exercices', visible:true, createdAt:'2026-01-01' },
    { id:208, niveau:'all', matiere:'physique', type:'quiz',     titre:'Quiz — Mécanique',                   lien:'', duree:'15 questions', visible:true, createdAt:'2026-01-01' },
    // SVT
    { id:300, niveau:'all', matiere:'svt', type:'video',    titre:'Les cellules — cours complet',           lien:'', duree:'44 min', visible:true, createdAt:'2026-01-01' },
    { id:301, niveau:'all', matiere:'svt', type:'video',    titre:'La reproduction — mécanismes',            lien:'', duree:'38 min', visible:true, createdAt:'2026-01-01' },
    { id:302, niveau:'all', matiere:'svt', type:'video',    titre:'Génétique — ADN et chromosomes',          lien:'', duree:'42 min', visible:true, createdAt:'2026-01-01' },
    { id:303, niveau:'all', matiere:'svt', type:'resume',   titre:'Résumé — La cellule',                     lien:'', duree:'6 pages', visible:true, createdAt:'2026-01-01' },
    { id:304, niveau:'all', matiere:'svt', type:'resume',   titre:'Fiche — Génétique',                       lien:'', duree:'4 pages', visible:true, createdAt:'2026-01-01' },
    { id:305, niveau:'all', matiere:'svt', type:'exercice', titre:'Série 1 — Biologie cellulaire',           lien:'', duree:'12 exercices', visible:true, createdAt:'2026-01-01' },
    { id:306, niveau:'all', matiere:'svt', type:'exercice', titre:'Série 2 — Génétique',                     lien:'', duree:'10 exercices', visible:true, createdAt:'2026-01-01' },
    { id:307, niveau:'all', matiere:'svt', type:'quiz',     titre:'Quiz — SVT révision',                    lien:'', duree:'20 questions', visible:true, createdAt:'2026-01-01' },
    // Français
    { id:400, niveau:'all', matiere:'francais', type:'video',    titre:'Grammaire — Les temps du passé',     lien:'', duree:'32 min', visible:true, createdAt:'2026-01-01' },
    { id:401, niveau:'all', matiere:'francais', type:'video',    titre:'Littérature — Les courants littéraires',lien:'', duree:'45 min', visible:true, createdAt:'2026-01-01' },
    { id:402, niveau:'all', matiere:'francais', type:'video',    titre:'Méthodologie — La dissertation',      lien:'', duree:'50 min', visible:true, createdAt:'2026-01-01' },
    { id:403, niveau:'all', matiere:'francais', type:'resume',   titre:'Résumé — Conjugaison',                lien:'', duree:'5 pages', visible:true, createdAt:'2026-01-01' },
    { id:404, niveau:'all', matiere:'francais', type:'resume',   titre:'Fiche — Figures de style',            lien:'', duree:'3 pages', visible:true, createdAt:'2026-01-01' },
    { id:405, niveau:'all', matiere:'francais', type:'exercice', titre:'Exercices — Analyse de texte',        lien:'', duree:'8 exercices', visible:true, createdAt:'2026-01-01' },
    { id:406, niveau:'all', matiere:'francais', type:'exercice', titre:'Sujets de dissertation',              lien:'', duree:'6 sujets', visible:true, createdAt:'2026-01-01' },
    { id:407, niveau:'all', matiere:'francais', type:'quiz',     titre:'Quiz — Culture littéraire',           lien:'', duree:'15 questions', visible:true, createdAt:'2026-01-01' },
    // Anglais
    { id:500, niveau:'all', matiere:'anglais', type:'video',    titre:'Grammar — Tenses overview',            lien:'', duree:'30 min', visible:true, createdAt:'2026-01-01' },
    { id:501, niveau:'all', matiere:'anglais', type:'video',    titre:'Vocabulary — Academic words',          lien:'', duree:'25 min', visible:true, createdAt:'2026-01-01' },
    { id:502, niveau:'all', matiere:'anglais', type:'video',    titre:'Writing — Essay structure',            lien:'', duree:'35 min', visible:true, createdAt:'2026-01-01' },
    { id:503, niveau:'all', matiere:'anglais', type:'resume',   titre:'Summary — English tenses',             lien:'', duree:'4 pages', visible:true, createdAt:'2026-01-01' },
    { id:504, niveau:'all', matiere:'anglais', type:'resume',   titre:'Vocabulary list — Key terms',          lien:'', duree:'3 pages', visible:true, createdAt:'2026-01-01' },
    { id:505, niveau:'all', matiere:'anglais', type:'exercice', titre:'Exercises — Grammar practice',         lien:'', duree:'15 exercices', visible:true, createdAt:'2026-01-01' },
    { id:506, niveau:'all', matiere:'anglais', type:'exercice', titre:'Reading comprehension',                lien:'', duree:'5 texts', visible:true, createdAt:'2026-01-01' },
    { id:507, niveau:'all', matiere:'anglais', type:'quiz',     titre:'Quiz — English skills',                lien:'', duree:'20 questions', visible:true, createdAt:'2026-01-01' },
    // Histoire-Géo
    { id:600, niveau:'all', matiere:'histoire', type:'video',    titre:'Histoire — La Guerre Froide',        lien:'', duree:'48 min', visible:true, createdAt:'2026-01-01' },
    { id:601, niveau:'all', matiere:'histoire', type:'video',    titre:'Géographie — Les grands ensembles',  lien:'', duree:'42 min', visible:true, createdAt:'2026-01-01' },
    { id:602, niveau:'all', matiere:'histoire', type:'video',    titre:'Histoire — Le Monde après 1945',     lien:'', duree:'55 min', visible:true, createdAt:'2026-01-01' },
    { id:603, niveau:'all', matiere:'histoire', type:'resume',   titre:'Résumé — Guerre Froide',              lien:'', duree:'6 pages', visible:true, createdAt:'2026-01-01' },
    { id:604, niveau:'all', matiere:'histoire', type:'resume',   titre:'Fiche — Repères chronologiques',      lien:'', duree:'4 pages', visible:true, createdAt:'2026-01-01' },
    { id:605, niveau:'all', matiere:'histoire', type:'exercice', titre:'Série — Analyse de documents',        lien:'', duree:'8 exercices', visible:true, createdAt:'2026-01-01' },
    { id:606, niveau:'all', matiere:'histoire', type:'exercice', titre:'Croquis géographiques',               lien:'', duree:'5 sujets', visible:true, createdAt:'2026-01-01' },
    { id:607, niveau:'all', matiere:'histoire', type:'quiz',     titre:'Quiz — Histoire-Géo',                 lien:'', duree:'20 questions', visible:true, createdAt:'2026-01-01' },
    // Philo
    { id:700, niveau:'all', matiere:'philo', type:'video',    titre:'Introduction — La conscience',          lien:'', duree:'40 min', visible:true, createdAt:'2026-01-01' },
    { id:701, niveau:'all', matiere:'philo', type:'video',    titre:'La liberté — cours complet',            lien:'', duree:'48 min', visible:true, createdAt:'2026-01-01' },
    { id:702, niveau:'all', matiere:'philo', type:'video',    titre:'Morale et éthique',                     lien:'', duree:'36 min', visible:true, createdAt:'2026-01-01' },
    { id:703, niveau:'all', matiere:'philo', type:'resume',   titre:'Résumé — Notions clés',                 lien:'', duree:'5 pages', visible:true, createdAt:'2026-01-01' },
    { id:704, niveau:'all', matiere:'philo', type:'resume',   titre:'Méthode — La dissertation philo',       lien:'', duree:'4 pages', visible:true, createdAt:'2026-01-01' },
    { id:705, niveau:'all', matiere:'philo', type:'exercice', titre:'Sujets — La conscience',                 lien:'', duree:'5 sujets', visible:true, createdAt:'2026-01-01' },
    { id:706, niveau:'all', matiere:'philo', type:'exercice', titre:'Sujets — La liberté',                   lien:'', duree:'5 sujets', visible:true, createdAt:'2026-01-01' },
    { id:707, niveau:'all', matiere:'philo', type:'quiz',     titre:'Quiz — Notions philosophiques',         lien:'', duree:'15 questions', visible:true, createdAt:'2026-01-01' },
    // Informatique
    { id:800, niveau:'all', matiere:'info', type:'video',    titre:'Algorithmique — Bases',                  lien:'', duree:'35 min', visible:true, createdAt:'2026-01-01' },
    { id:801, niveau:'all', matiere:'info', type:'video',    titre:'Programmation — Python',                 lien:'', duree:'50 min', visible:true, createdAt:'2026-01-01' },
    { id:802, niveau:'all', matiere:'info', type:'video',    titre:'Web — HTML et CSS',                      lien:'', duree:'42 min', visible:true, createdAt:'2026-01-01' },
    { id:803, niveau:'all', matiere:'info', type:'resume',   titre:'Résumé — Algorithmique',                 lien:'', duree:'6 pages', visible:true, createdAt:'2026-01-01' },
    { id:804, niveau:'all', matiere:'info', type:'resume',   titre:'Fiche — Python',                         lien:'', duree:'4 pages', visible:true, createdAt:'2026-01-01' },
    { id:805, niveau:'all', matiere:'info', type:'exercice', titre:'Exercices — Algorithmes',                lien:'', duree:'12 exercices', visible:true, createdAt:'2026-01-01' },
    { id:806, niveau:'all', matiere:'info', type:'exercice', titre:'TP — Développement web',                 lien:'', duree:'8 exercices', visible:true, createdAt:'2026-01-01' },
    { id:807, niveau:'all', matiere:'info', type:'quiz',     titre:'Quiz — Informatique',                   lien:'', duree:'20 questions', visible:true, createdAt:'2026-01-01' },
  ];
  var stored = localStorage.getItem('jacademy_content');
  if (!stored) return defaults;
  var list = JSON.parse(stored);
  var seen = {};
  var cleaned = list.filter(function(c) {
    var key = c.titre + '|' + c.matiere + '|' + (c.niveau || 'all');
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
  if (cleaned.length < list.length) {
    localStorage.setItem('jacademy_content', JSON.stringify(cleaned));
  }
  return cleaned;
}

function saveContent(list) {
  localStorage.setItem('jacademy_content', JSON.stringify(list));
}

function addContent(item) {
  var list = getContent();
  item.id = Date.now();
  item.createdAt = new Date().toISOString().split('T')[0];
  item.visible = true;
  list.unshift(item);
  saveContent(list);
  logActivity('Contenu ajouté : ' + item.titre, 'content');
}

function updateContent(id, updates) {
  var list = getContent();
  var idx  = list.findIndex(function(c){ return c.id == id; });
  if (idx !== -1) { Object.assign(list[idx], updates); saveContent(list); }
}

function deleteContent(id) {
  var list = getContent().filter(function(c){ return c.id != id; });
  saveContent(list);
  logActivity('Contenu supprimé (id:' + id + ')', 'content');
}

function toggleVisible(id) {
  var list = getContent();
  var idx  = list.findIndex(function(c){ return c.id == id; });
  if (idx !== -1) { list[idx].visible = !list[idx].visible; saveContent(list); }
}

function logActivity(message, type) {
  var acts = JSON.parse(localStorage.getItem('jacademy_activity') || '[]');
  acts.unshift({ message: message, type: type || 'info', at: new Date().toISOString() });
  if (acts.length > 50) acts = acts.slice(0, 50);
  localStorage.setItem('jacademy_activity', JSON.stringify(acts));
}

function getActivity() {
  return JSON.parse(localStorage.getItem('jacademy_activity') || '[]');
}

function getAllUsers() {
  return JSON.parse(localStorage.getItem('jacademy_users') || '[]');
}

function banUser(id) {
  var users = getAllUsers();
  var idx   = users.findIndex(function(u){ return u.id == id; });
  if (idx !== -1) {
    users[idx].banned = !users[idx].banned;
    localStorage.setItem('jacademy_users', JSON.stringify(users));
    logActivity('Utilisateur ' + (users[idx].banned ? 'banni' : 'réactivé') + ' : ' + users[idx].name, 'users');
  }
}

function deleteUser(id) {
  var users = getAllUsers().filter(function(u){ return u.id != id; });
  localStorage.setItem('jacademy_users', JSON.stringify(users));
  logActivity('Compte supprimé (id:' + id + ')', 'users');
}

function timeAgo(isoStr) {
  var diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (diff < 60)   return 'il y a ' + diff + 's';
  if (diff < 3600) return 'il y a ' + Math.floor(diff/60) + 'min';
  if (diff < 86400)return 'il y a ' + Math.floor(diff/3600) + 'h';
  return 'il y a ' + Math.floor(diff/86400) + 'j';
}

var NIVEAU_LABELS  = { all:'Tous les niveaux', college:'Collège', college1:'1ère année Collège', college2:'2ème année Collège', college3:'3ème année Collège', tronc:'Tronc commun', bac1:'1ère Bac', bac2:'2ème Bac' };
var MATIERE_LABELS = { maths:'Mathématiques', physique:'Physique-Chimie', svt:'SVT', francais:'Français', anglais:'Anglais', histoire:'Histoire-Géo', philo:'Philosophie', informatique:'Informatique', info:'Informatique' };
var TYPE_LABELS    = { video:'Vidéo', resume:'Résumé PDF', exercice:'Exercices', quiz:'Quiz' };
