const express = require('express');
const { getDb, saveDb } = require('../database');

const router = express.Router();

router.get('/', async (req, res) => {
  const db = await getDb();
  const rows = await db.exec('SELECT id, name, email, level, banned, createdAt FROM users ORDER BY createdAt DESC');
  if (!rows.length) return res.json([]);
  const cols = rows[0].columns;
  const items = rows[0].values.map(v => {
    const obj = {};
    cols.forEach((c, i) => { obj[c] = v[i]; });
    obj.banned = !!obj.banned;
    return obj;
  });
  res.json(items);
});

router.put('/:id/ban', async (req, res) => {
  const db = await getDb();
  const row = await db.exec('SELECT banned, name FROM users WHERE id = ?', [req.params.id]);
  if (row.length && row[0].values.length) {
    const current = row[0].values[0][0];
    const name = row[0].values[0][1];
    await db.run('UPDATE users SET banned = ? WHERE id = ?', [current ? 0 : 1, req.params.id]);
    await saveDb();
    await db.run('INSERT INTO activity (message, type) VALUES (?, ?)',
      ['Utilisateur ' + (current ? 'réactivé' : 'banni') + ' : ' + name, 'users']
    );
    await saveDb();
  }
  res.json({ ok: true });
});

router.post('/seed', async (req, res) => {
  const { users } = req.body;
  if (!Array.isArray(users)) return res.status(400).json({ error: 'users requis' });
  const db = await getDb();
  const bcrypt = require('bcryptjs');
  let count = 0;
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (!u.email || u.email === 'admin@jacademy.ma') continue;
    var existing = await db.exec('SELECT id FROM users WHERE email = ?', [u.email]);
    if (!existing.length || !existing[0].values.length) {
      var hash = bcrypt.hashSync(u.password || 'password', 10);
      await db.run('INSERT INTO users (name, email, password, level, banned, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [u.name || u.email, u.email, hash, u.level || null, u.banned ? 1 : 0, u.createdAt || new Date().toISOString()]);
      count++;
    }
  }
  await saveDb();
  res.json({ seeded: count });
});

router.delete('/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
  try { await saveDb(); } catch(e) { return res.status(500).json({ error: 'Erreur sauvegarde' }); }
  await db.run('INSERT INTO activity (message, type) VALUES (?, ?)',
    ['Compte supprimé (id:' + req.params.id + ')', 'users']
  );
  try { await saveDb(); } catch(e) {}
  await db.run('DELETE FROM sessions WHERE userId = ?', [req.params.id]);
  try { await saveDb(); } catch(e) {}
  res.json({ ok: true });
});

module.exports = router;
