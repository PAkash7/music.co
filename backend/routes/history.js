const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// GET play history for current user
router.get('/', authMiddleware, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const history = db.prepare(`
    SELECT s.*, ph.played_at FROM songs s
    JOIN play_history ph ON s.id = ph.song_id
    WHERE ph.user_id = ?
    ORDER BY ph.played_at DESC
    LIMIT ?
  `).all(req.user.id, limit);
  res.json(history);
});

// LOG a song play
router.post('/:songId', authMiddleware, (req, res) => {
  const song = db.prepare('SELECT id FROM songs WHERE id = ?').get(req.params.songId);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  db.prepare('INSERT INTO play_history (user_id, song_id) VALUES (?, ?)').run(req.user.id, req.params.songId);
  res.status(201).json({ message: 'Play logged' });
});

// CLEAR history
router.delete('/', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM play_history WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'History cleared' });
});

module.exports = router;
