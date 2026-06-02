const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../database');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom invalide' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Email invalide' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Mot de passe trop court' });

    const db = await getDb();
    const existing = db.exec('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length && existing[0].values.length) return res.status(409).json({ error: 'Email déjà utilisé' });

    const hashed = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email.toLowerCase(), hashed]
    );
    saveDb();

    const row = db.exec('SELECT id, name, email, level, banned, createdAt FROM users WHERE email = ?', [email.toLowerCase()]);
    const user = row[0].values[0];
    const token = uuidv4();
    db.run('INSERT INTO sessions (userId, token) VALUES (?, ?)', [user[0], token]);
    saveDb();

    res.json({
      token,
      user: { id: user[0], name: user[1], email: user[2], level: user[3], banned: !!user[4], createdAt: user[5] }
    });

    // Email de bienvenue (best-effort)
    try {
      var { sendMail, welcomeEmail } = require('../services/mail');
      var w = welcomeEmail(user[1]);
      sendMail(user[2], w.subject, w.html);
    } catch (_) {}
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Champs requis' });

    const db = await getDb();
    const row = db.exec('SELECT id, name, email, password, level, banned, createdAt FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!row.length || !row[0].values.length) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const u = row[0].values[0];
    const match = await bcrypt.compare(password, u[3]);
    if (!match) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const token = uuidv4();
    db.run('INSERT INTO sessions (userId, token) VALUES (?, ?)', [u[0], token]);
    saveDb();

    res.json({
      token,
      user: { id: u[0], name: u[1], email: u[2], level: u[4], banned: !!u[5], createdAt: u[6] }
    });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/logout', async (req, res) => {
  const { token } = req.body;
  if (token) {
    const db = await getDb();
    db.run('DELETE FROM sessions WHERE token = ?', [token]);
    saveDb();
  }
  res.json({ ok: true });
});

router.get('/session', async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.json({ user: null });

  const db = await getDb();
  const row = db.exec(
    'SELECT u.id, u.name, u.email, u.level, u.banned, u.createdAt FROM sessions s JOIN users u ON s.userId = u.id WHERE s.token = ?',
    [token]
  );
  if (!row.length || !row[0].values.length) return res.json({ user: null });

  const u = row[0].values[0];
  res.json({ user: { id: u[0], name: u[1], email: u[2], level: u[3], banned: !!u[4], createdAt: u[5] } });
});

router.put('/user/level', async (req, res) => {
  const token = req.headers.authorization;
  const { level } = req.body;
  if (!token || !level) return res.status(400).json({ error: 'Requis' });

  const db = await getDb();
  const row = db.exec('SELECT userId FROM sessions WHERE token = ?', [token]);
  if (!row.length || !row[0].values.length) return res.status(401).json({ error: 'Non connecté' });

  db.run('UPDATE users SET level = ? WHERE id = ?', [level, row[0].values[0][0]]);
  saveDb();
  res.json({ ok: true });
});

module.exports = router;
