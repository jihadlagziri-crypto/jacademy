const path = require('path');
const fs = require('fs');

var mailConfig = { enabled: false };

// Priorité 1 : variables d'environnement (Render)
if (process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS) {
  mailConfig = {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM || 'J-Academy <noreply@jacademy.ma>',
    enabled: true
  };
} else {
  // Priorité 2 : fichier mail-config.json
  var configPath = path.join(__dirname, 'mail-config.json');
  try {
    if (fs.existsSync(configPath)) {
      mailConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      mailConfig.enabled = !!(mailConfig.host && mailConfig.user && mailConfig.pass);
    }
  } catch (e) { /* use defaults */ }
}

module.exports = { mail: mailConfig };
