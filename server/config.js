const path = require('path');
const fs = require('fs');

var configPath = path.join(__dirname, 'mail-config.json');
var mailConfig = { enabled: false };

try {
  if (fs.existsSync(configPath)) {
    mailConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    mailConfig.enabled = !!(mailConfig.host && mailConfig.user && mailConfig.pass);
  }
} catch (e) { /* use defaults */ }

module.exports = { mail: mailConfig };
