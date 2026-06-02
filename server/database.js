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
}

module.exports = { getDb, saveDb, seedFromLocalStorage };
