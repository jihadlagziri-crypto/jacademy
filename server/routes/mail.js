const express = require('express');
const { getDb } = require('../database');
const { sendMail, notificationEmail } = require('../services/mail');
const { mail } = require('../config');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ enabled: mail.enabled, host: mail.host || null, user: mail.user ? mail.user.replace(/./g, (c, i) => i > 3 && i < mail.user.indexOf('@') ? '*': c) : null });
});

router.post('/send', async (req, res) => {
  try {
    if (!mail.enabled) return res.status(400).json({ error: 'Mail non configuré' });
    var token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'Non autorisé' });
    var db = await getDb();
    var admin = db.exec('SELECT u.id FROM users u JOIN sessions s ON s.userId = u.id WHERE s.token = ? AND u.email = ?', [token, 'admin@jacademy.ma']);
    if (!admin.length || !admin[0].values.length) return res.status(403).json({ error: 'Admin seulement' });

    var { userIds, title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Titre et message requis' });

    var rows = db.exec('SELECT id, name, email FROM users WHERE banned = 0 AND email != \'admin@jacademy.ma\'' + (userIds && userIds.length ? ' AND id IN (' + userIds.join(',') + ')' : ''));
    if (!rows.length || !rows[0].values.length) return res.json({ sent: 0, total: 0 });

    var users = rows[0].values.filter(function(u){ return u[2]; });
    var emailData = notificationEmail(title, message);
    var sent = 0;
    for (var u of users) {
      if (!u[2]) continue;
      var check = db.exec('SELECT id FROM users WHERE id = ? AND banned = 0', [u[0]]);
      if (!check.length || !check[0].values.length) continue;
      var r = await sendMail(u[2], emailData.subject, emailData.html);
      if (r.sent) sent++;
      await new Promise(r => setTimeout(r, 200));
    }
    db.run('INSERT INTO activity (message, type) VALUES (?, ?)', ['Notification envoyée à ' + sent + '/' + users.length + ' utilisateurs : ' + title, 'mail']);
    res.json({ sent, total: users.length });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/welcome', async (req, res) => {
  try {
    var { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Champs requis' });
    var { sendMail, welcomeEmail } = require('../services/mail');
    var data = welcomeEmail(name);
    var r = await sendMail(email, data.subject, data.html);
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
