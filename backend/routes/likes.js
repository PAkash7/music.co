const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// GET all liked songs for current user
router.get('/', authMiddleware, (req, res) => {
  const songs = db.prepare(`
    SELECT s.*, ls.liked_at FROM songs s
    JOIN liked_songs ls ON s.id = ls.song_id
    WHERE ls.user_id = ?
    ORDER BY ls.liked_at DESC
  `).all(req.user.id);
  res.json(songs);
});

// LIKE a song
router.post('/:songId', authMiddleware, (req, res) => {
  const song = db.prepare('SELECT id FROM songs WHERE id = ?').get(req.params.songId);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  try {
    db.prepare('INSERT INTO liked_songs (user_id, song_id) VALUES (?, ?)').run(req.user.id, req.params.songId);
    res.status(201).json({ message: 'Song liked' });
  } catch (e) {
    res.status(409).json({ error: 'Song already liked' });
  }
});

// UNLIKE a song
router.delete('/:songId', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM liked_songs WHERE user_id = ? AND song_id = ?').run(req.user.id, req.params.songId);
  res.json({ message: 'Song unliked' });
});

// CHECK if song is liked
router.get('/:songId/status', authMiddleware, (req, res) => {
  const liked = db.prepare('SELECT id FROM liked_songs WHERE user_id = ? AND song_id = ?').get(req.user.id, req.params.songId);
  res.json({ liked: !!liked });
});

module.exports = router;
