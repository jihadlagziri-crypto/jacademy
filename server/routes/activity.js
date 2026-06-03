const express = require('express');
const { getDb } = require('../database');

const router = express.Router();

router.get('/', async (req, res) => {
  const db = await getDb();
  const rows = await db.exec('SELECT id, message, type, createdAt FROM activity ORDER BY createdAt DESC LIMIT 50');
  if (!rows.length) return res.json([]);
  const cols = rows[0].columns;
  const items = rows[0].values.map(v => {
    const obj = {};
    cols.forEach((c, i) => { obj[c] = v[i]; });
    return obj;
  });
  res.json(items);
});

module.exports = router;
