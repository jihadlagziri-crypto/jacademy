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
    var admin = await db.exec('SELECT u.id FROM users u JOIN sessions s ON s.userId = u.id WHERE s.token = ? AND u.email = ?', [token, 'admin@jacademy.ma']);
    if (!admin.length || !admin[0].values.length) return res.status(403).json({ error: 'Admin seulement' });

    var { userIds, title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Titre et message requis' });

    var rows = await db.exec('SELECT id, name, email FROM users WHERE banned = 0 AND email != \'admin@jacademy.ma\'' + (userIds && userIds.length ? ' AND id IN (' + userIds.join(',') + ')' : ''));
    if (!rows.length || !rows[0].values.length) return res.json({ sent: 0, total: 0 });

    var users = rows[0].values.filter(function(u){ return u[2]; });
    var emailData = notificationEmail(title, message);
    var sent = 0, failed = 0, reason = '';
    // Send first email synchronously (with 8s timeout) so we can report back
    var first = users[0];
    if (first && first[2]) {
      var r = await sendMail(first[2], emailData.subject, emailData.html);
      if (r && r.sent) { sent++; console.log('Mail sent to', first[2]); }
      else { failed++; reason = r && r.reason || 'Erreur inconnue'; console.error('Mail failed for', first[2], ':', reason); }
    }
    // Send rest in background with logging
    for (var i = 1; i < users.length; i++) {
      var u = users[i];
      if (!u || !u[2]) continue;
      (function(email, sub, html) {
        sendMail(email, sub, html).then(function(r2) {
          if (r2 && r2.sent) console.log('Mail sent to', email);
          else console.error('Mail failed for', email, ':', r2 && r2.reason);
        }).catch(function(e) { console.error('Mail error for', email, ':', e.message); });
      })(u[2], emailData.subject, emailData.html);
    }
    await db.run('INSERT INTO activity (message, type) VALUES (?, ?)', [(failed ? '[' + reason + '] ' : '') + 'Notification "' + title + '" : ' + sent + ' envoyé(s), ' + failed + ' échec(s) sur ' + users.length + ' destinataire(s)', 'mail']);
    res.json({ sent: sent, total: users.length, failed: failed, reason: reason });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/test', async (req, res) => {
  try {
    if (!mail.enabled) return res.status(400).json({ error: 'Mail non configuré' });
    var { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });
    var r = await sendMail(email, 'Test J-Academy', '<h1>Test</h1><p>Cet email confirme que la configuration SMTP fonctionne correctement.</p>');
    res.json(r);
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
