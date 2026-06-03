const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'jacademy.db');
let db = null;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  db.run('PRAGMA journal_mode=WAL');
  db.run('PRAGMA foreign_keys=ON');
  initTables();
  saveDb();
  return db;
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function initTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      level TEXT,
      banned INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      niveau TEXT NOT NULL,
      matiere TEXT NOT NULL,
      type TEXT NOT NULL,
      titre TEXT NOT NULL,
      lien TEXT,
      duree TEXT,
      pages TEXT,
      visible INTEGER DEFAULT 1,
      file_path TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);
}

var DEFAULT_CONTENT = [
  {niveau:'all',matiere:'maths',type:'video',titre:'Introduction — Les fonctions',lien:'',duree:'28 min'},
  {niveau:'all',matiere:'maths',type:'video',titre:'Limites et continuité',lien:'',duree:'41 min'},
  {niveau:'all',matiere:'maths',type:'video',titre:'Dérivation — cours complet',lien:'',duree:'55 min'},
  {niveau:'all',matiere:'maths',type:'video',titre:'Intégration — bases',lien:'',duree:'48 min'},
  {niveau:'all',matiere:'maths',type:'video',titre:'Probabilités et statistiques',lien:'',duree:'36 min'},
  {niveau:'all',matiere:'maths',type:'resume',titre:'Résumé — Les fonctions',lien:'',duree:'8 pages'},
  {niveau:'all',matiere:'maths',type:'resume',titre:'Fiche mémo — Dérivation',lien:'',duree:'4 pages'},
  {niveau:'all',matiere:'maths',type:'resume',titre:'Résumé — Intégration',lien:'',duree:'6 pages'},
  {niveau:'all',matiere:'maths',type:'exercice',titre:'Série 1 — Fonctions et limites',lien:'',duree:'12 exercices'},
  {niveau:'all',matiere:'maths',type:'exercice',titre:'Série 2 — Dérivation appliquée',lien:'',duree:'10 exercices'},
  {niveau:'all',matiere:'maths',type:'exercice',titre:'Annales corrigées 2023',lien:'',duree:'20 exercices'},
  {niveau:'all',matiere:'maths',type:'quiz',titre:'Quiz — Les fonctions',lien:'',duree:'20 questions'},
  {niveau:'all',matiere:'maths',type:'quiz',titre:'Quiz — Dérivation',lien:'',duree:'15 questions'},
  {niveau:'all',matiere:'physique',type:'video',titre:'Mécanique — Les forces',lien:'',duree:'35 min'},
  {niveau:'all',matiere:'physique',type:'video',titre:'Thermodynamique — cours 1',lien:'',duree:'44 min'},
  {niveau:'all',matiere:'physique',type:'video',titre:'Électricité — circuits RLC',lien:'',duree:'52 min'},
  {niveau:'all',matiere:'physique',type:'video',titre:'Ondes et vibrations',lien:'',duree:'38 min'},
  {niveau:'all',matiere:'physique',type:'resume',titre:'Résumé — Mécanique',lien:'',duree:'7 pages'},
  {niveau:'all',matiere:'physique',type:'resume',titre:'Résumé — Électricité',lien:'',duree:'5 pages'},
  {niveau:'all',matiere:'physique',type:'exercice',titre:'Série 1 — Forces et mouvement',lien:'',duree:'10 exercices'},
  {niveau:'all',matiere:'physique',type:'exercice',titre:'Annales Physique 2023',lien:'',duree:'18 exercices'},
  {niveau:'all',matiere:'physique',type:'quiz',titre:'Quiz — Mécanique',lien:'',duree:'15 questions'},
  {niveau:'all',matiere:'svt',type:'video',titre:'Les cellules — cours complet',lien:'',duree:'44 min'},
  {niveau:'all',matiere:'svt',type:'video',titre:'La reproduction — mécanismes',lien:'',duree:'38 min'},
  {niveau:'all',matiere:'svt',type:'video',titre:'Génétique — ADN et chromosomes',lien:'',duree:'42 min'},
  {niveau:'all',matiere:'svt',type:'resume',titre:'Résumé — La cellule',lien:'',duree:'6 pages'},
  {niveau:'all',matiere:'svt',type:'resume',titre:'Fiche — Génétique',lien:'',duree:'4 pages'},
  {niveau:'all',matiere:'svt',type:'exercice',titre:'Série 1 — Biologie cellulaire',lien:'',duree:'12 exercices'},
  {niveau:'all',matiere:'svt',type:'exercice',titre:'Série 2 — Génétique',lien:'',duree:'10 exercices'},
  {niveau:'all',matiere:'svt',type:'quiz',titre:'Quiz — SVT révision',lien:'',duree:'20 questions'},
  {niveau:'all',matiere:'francais',type:'video',titre:'Grammaire — Les temps du passé',lien:'',duree:'32 min'},
  {niveau:'all',matiere:'francais',type:'video',titre:'Littérature — Les courants littéraires',lien:'',duree:'45 min'},
  {niveau:'all',matiere:'francais',type:'video',titre:'Méthodologie — La dissertation',lien:'',duree:'50 min'},
  {niveau:'all',matiere:'francais',type:'resume',titre:'Résumé — Conjugaison',lien:'',duree:'5 pages'},
  {niveau:'all',matiere:'francais',type:'resume',titre:'Fiche — Figures de style',lien:'',duree:'3 pages'},
  {niveau:'all',matiere:'francais',type:'exercice',titre:'Exercices — Analyse de texte',lien:'',duree:'8 exercices'},
  {niveau:'all',matiere:'francais',type:'exercice',titre:'Sujets de dissertation',lien:'',duree:'6 sujets'},
  {niveau:'all',matiere:'francais',type:'quiz',titre:'Quiz — Culture littéraire',lien:'',duree:'15 questions'},
  {niveau:'all',matiere:'anglais',type:'video',titre:'Grammar — Tenses overview',lien:'',duree:'30 min'},
  {niveau:'all',matiere:'anglais',type:'video',titre:'Vocabulary — Academic words',lien:'',duree:'25 min'},
  {niveau:'all',matiere:'anglais',type:'video',titre:'Writing — Essay structure',lien:'',duree:'35 min'},
  {niveau:'all',matiere:'anglais',type:'resume',titre:'Summary — English tenses',lien:'',duree:'4 pages'},
  {niveau:'all',matiere:'anglais',type:'resume',titre:'Vocabulary list — Key terms',lien:'',duree:'3 pages'},
  {niveau:'all',matiere:'anglais',type:'exercice',titre:'Exercises — Grammar practice',lien:'',duree:'15 exercices'},
  {niveau:'all',matiere:'anglais',type:'exercice',titre:'Reading comprehension',lien:'',duree:'5 texts'},
  {niveau:'all',matiere:'anglais',type:'quiz',titre:'Quiz — English skills',lien:'',duree:'20 questions'},
  {niveau:'all',matiere:'histoire',type:'video',titre:'Histoire — La Guerre Froide',lien:'',duree:'48 min'},
  {niveau:'all',matiere:'histoire',type:'video',titre:'Géographie — Les grands ensembles',lien:'',duree:'42 min'},
  {niveau:'all',matiere:'histoire',type:'video',titre:'Histoire — Le Monde après 1945',lien:'',duree:'55 min'},
  {niveau:'all',matiere:'histoire',type:'resume',titre:'Résumé — Guerre Froide',lien:'',duree:'6 pages'},
  {niveau:'all',matiere:'histoire',type:'resume',titre:'Fiche — Repères chronologiques',lien:'',duree:'4 pages'},
  {niveau:'all',matiere:'histoire',type:'exercice',titre:'Série — Analyse de documents',lien:'',duree:'8 exercices'},
  {niveau:'all',matiere:'histoire',type:'exercice',titre:'Croquis géographiques',lien:'',duree:'5 sujets'},
  {niveau:'all',matiere:'histoire',type:'quiz',titre:'Quiz — Histoire-Géo',lien:'',duree:'20 questions'},
  {niveau:'all',matiere:'philo',type:'video',titre:'Introduction — La conscience',lien:'',duree:'40 min'},
  {niveau:'all',matiere:'philo',type:'video',titre:'La liberté — cours complet',lien:'',duree:'48 min'},
  {niveau:'all',matiere:'philo',type:'video',titre:'Morale et éthique',lien:'',duree:'36 min'},
  {niveau:'all',matiere:'philo',type:'resume',titre:'Résumé — Notions clés',lien:'',duree:'5 pages'},
  {niveau:'all',matiere:'philo',type:'resume',titre:'Méthode — La dissertation philo',lien:'',duree:'4 pages'},
  {niveau:'all',matiere:'philo',type:'exercice',titre:'Sujets — La conscience',lien:'',duree:'5 sujets'},
  {niveau:'all',matiere:'philo',type:'exercice',titre:'Sujets — La liberté',lien:'',duree:'5 sujets'},
  {niveau:'all',matiere:'philo',type:'quiz',titre:'Quiz — Notions philosophiques',lien:'',duree:'15 questions'},
  {niveau:'all',matiere:'info',type:'video',titre:'Algorithmique — Bases',lien:'',duree:'35 min'},
  {niveau:'all',matiere:'info',type:'video',titre:'Programmation — Python',lien:'',duree:'50 min'},
  {niveau:'all',matiere:'info',type:'video',titre:'Web — HTML et CSS',lien:'',duree:'42 min'},
  {niveau:'all',matiere:'info',type:'resume',titre:'Résumé — Algorithmique',lien:'',duree:'6 pages'},
  {niveau:'all',matiere:'info',type:'resume',titre:'Fiche — Python',lien:'',duree:'4 pages'},
  {niveau:'all',matiere:'info',type:'exercice',titre:'Exercices — Algorithmes',lien:'',duree:'12 exercices'},
  {niveau:'all',matiere:'info',type:'exercice',titre:'TP — Développement web',lien:'',duree:'8 exercices'},
  {niveau:'all',matiere:'info',type:'quiz',titre:'Quiz — Informatique',lien:'',duree:'20 questions'}
];

async function seedFromLocalStorage() {
  const db = await getDb();

  var adminRow = db.exec('SELECT id FROM users WHERE email = ?', ['admin@jacademy.ma']);
  if (!adminRow.length || !adminRow[0].values.length) {
    const bcrypt = require('bcryptjs');
    var hash = bcrypt.hashSync('admin1234', 10);
    db.run('INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Administrateur', 'admin@jacademy.ma', hash]
    );
    saveDb();
  }

  // Seed default content if DB is empty
  var contentRow = db.exec('SELECT COUNT(*) as cnt FROM content');
  if (!contentRow.length || !contentRow[0].values.length || contentRow[0].values[0][0] === 0) {
    DEFAULT_CONTENT.forEach(function(item) {
      db.run('INSERT OR IGNORE INTO content (niveau, matiere, type, titre, lien, duree, visible) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [item.niveau, item.matiere, item.type, item.titre, item.lien || null, item.duree || null]
      );
    });
    saveDb();
    console.log('Seeded ' + DEFAULT_CONTENT.length + ' default content items');
  }
}

module.exports = { getDb, saveDb, seedFromLocalStorage };
