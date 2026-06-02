const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { getDb, seedFromLocalStorage } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

var uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({
  origin: function(o, cb) { cb(null, true); },
  credentials: true
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/mail', require('./routes/mail'));

app.use(function(req, res, next) {
  if (req.path.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
}, express.static(path.join(__dirname, '..')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Route not found' });
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

async function start() {
  await getDb();
  await seedFromLocalStorage();
  app.listen(PORT, () => {
    console.log('J-Academy server running on http://localhost:' + PORT);
  });
}

start();
