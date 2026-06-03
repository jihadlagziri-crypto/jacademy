const express = require('express');
const { getDb, saveDb } = require('../database');

const router = express.Router();

function requireAdmin(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Non autorisé' });
  next();
}

router.get('/', async (req, res) => {
  const db = await getDb();
  const { matiere, niveau, type, visible } = req.query;
  let sql = 'SELECT * FROM content WHERE 1=1';
  const params = [];
  if (matiere) { sql += ' AND matiere = ?'; params.push(matiere); }
  if (niveau) { sql += ' AND niveau = ?'; params.push(niveau); }
  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (visible === '1') { sql += ' AND visible = 1'; }
  sql += ' ORDER BY createdAt DESC';
  const rows = await db.exec(sql, params);
  if (!rows.length) return res.json([]);
  const cols = rows[0].columns;
  const items = rows[0].values.map(v => {
    const obj = {};
    cols.forEach((c, i) => { obj[c] = v[i]; });
    obj.visible = !!obj.visible;
    return obj;
  });
  res.json(items);
});

router.post('/', requireAdmin, async (req, res) => {
  const { niveau, matiere, type, titre, lien, duree } = req.body;
  if (!niveau || !matiere || !type || !titre) return res.status(400).json({ error: 'Champs requis' });
  const db = await getDb();
  await db.run('INSERT INTO content (niveau, matiere, type, titre, lien, duree) VALUES (?, ?, ?, ?, ?, ?)',
    [niveau, matiere, type, titre, lien || null, duree || null]
  );
  await saveDb();
  const row = await db.exec('SELECT * FROM content ORDER BY id DESC LIMIT 1');
  if (row.length && row[0].values.length) {
    const cols = row[0].columns;
    const obj = {};
    cols.forEach((c, i) => { obj[c] = row[0].values[0][i]; });
    obj.visible = !!obj.visible;
    await logActivity('Contenu ajouté : ' + titre, 'content');
    res.json(obj);
  } else {
    res.json({ ok: true });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { titre, lien, duree } = req.body;
  const db = await getDb();
  await db.run('UPDATE content SET titre = ?, lien = ?, duree = ? WHERE id = ?',
    [titre, lien, duree, req.params.id]
  );
  await saveDb();
  res.json({ ok: true });
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM content WHERE id = ?', [req.params.id]);
  await saveDb();
  await logActivity('Contenu supprimé (id:' + req.params.id + ')', 'content');
  res.json({ ok: true });
});

router.put('/:id/toggle', requireAdmin, async (req, res) => {
  const db = await getDb();
  const row = await db.exec('SELECT visible FROM content WHERE id = ?', [req.params.id]);
  if (row.length && row[0].values.length) {
    const current = row[0].values[0][0];
    await db.run('UPDATE content SET visible = ? WHERE id = ?', [current ? 0 : 1, req.params.id]);
    await saveDb();
  }
  res.json({ ok: true });
});

router.post('/seed', requireAdmin, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items requis' });
  const db = await getDb();
  let count = 0;
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (!item.titre || !item.matiere) continue;
    var existing = await db.exec('SELECT id FROM content WHERE titre = ? AND matiere = ?', [item.titre, item.matiere]);
    if (!existing.length || !existing[0].values.length) {
      await db.run('INSERT INTO content (niveau, matiere, type, titre, lien, duree, visible, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [item.niveau || 'all', item.matiere, item.type || 'video', item.titre, item.lien || null, item.duree || null, item.visible !== false ? 1 : 0, item.createdAt || new Date().toISOString().split('T')[0]]);
      count++;
    }
  }
  await saveDb();
  await logActivity('Import : ' + count + ' contenus synchronisés', 'content');
  res.json({ seeded: count });
});

async function logActivity(message, type) {
  const db = await getDb();
  await db.run('INSERT INTO activity (message, type) VALUES (?, ?)', [message, type || 'info']);
  await saveDb();
}

module.exports = router;
