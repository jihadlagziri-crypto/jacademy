const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const types = /mp4|webm|ogg|avi|mov|mkv|pdf|png|jpg|jpeg/;
    const ok = types.test(path.extname(file.originalname).toLowerCase());
    cb(null, ok);
  }
});

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });
  res.json({
    url: '/uploads/' + req.file.filename,
    name: req.file.originalname,
    size: req.file.size
  });
});

module.exports = router;
