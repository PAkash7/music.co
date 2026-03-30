const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isAudio = file.fieldname === 'audio';
    cb(null, path.join(__dirname, '../uploads', isAudio ? 'audio' : 'covers'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      const allowed = ['.mp3', '.wav', '.flac', '.ogg', '.m4a'];
      if (!allowed.includes(path.extname(file.originalname).toLowerCase()))
        return cb(new Error('Invalid audio format'));
    }
    cb(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// GET all songs (with optional search)
router.get('/', (req, res) => {
  const { q, genre, artist } = req.query;
  let query = 'SELECT s.*, u.username as uploader FROM songs s LEFT JOIN users u ON s.uploaded_by = u.id WHERE 1=1';
  const params = [];

  if (q) {
    query += ' AND (s.title LIKE ? OR s.artist LIKE ? OR s.album LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (genre) { query += ' AND s.genre = ?'; params.push(genre); }
  if (artist) { query += ' AND s.artist LIKE ?'; params.push(`%${artist}%`); }

  query += ' ORDER BY s.created_at DESC';
  const songs = db.prepare(query).all(...params);
  res.json(songs);
});

// GET single song
router.get('/:id', (req, res) => {
  const song = db.prepare('SELECT s.*, u.username as uploader FROM songs s LEFT JOIN users u ON s.uploaded_by = u.id WHERE s.id = ?').get(req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });
  res.json(song);
});

// UPLOAD new song (authenticated)
router.post('/upload', authMiddleware, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]), (req, res) => {
  if (req.user.role !== 'composer') {
    return res.status(403).json({ error: 'Only composers can upload music' });
  }

  const { title, artist, album, genre, duration_sec } = req.body;
  if (!title || !artist) return res.status(400).json({ error: 'Title and artist are required' });
  if (!req.files?.audio) return res.status(400).json({ error: 'Audio file is required' });

  const audioFile = req.files.audio[0];
  const coverFile = req.files?.cover?.[0];

  const result = db.prepare(
    'INSERT INTO songs (title, artist, album, genre, duration_sec, file_path, cover_art_path, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(title, artist, album || null, genre || null, parseInt(duration_sec) || 0,
    `/uploads/audio/${audioFile.filename}`,
    coverFile ? `/uploads/covers/${coverFile.filename}` : null,
    req.user.id
  );

  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(song);
});

// DELETE a song (authenticated, owner only)
router.delete('/:id', authMiddleware, (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });
  if (song.uploaded_by !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
  res.json({ message: 'Song deleted' });
});

// Stream audio file
router.get('/:id/stream', (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });
  
  const filePath = path.join(__dirname, '..', song.file_path);
  
  const fs = require('fs');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Audio file not found on disk' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if(start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
      return;
    }
    
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, {start, end});
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

module.exports = router;
