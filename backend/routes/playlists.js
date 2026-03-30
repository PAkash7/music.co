const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// GET all playlists for logged-in user
router.get('/', authMiddleware, (req, res) => {
  const playlists = db.prepare(`
    SELECT p.*, COUNT(ps.song_id) as song_count
    FROM playlists p
    LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
    WHERE p.created_by = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all(req.user.id);
  res.json(playlists);
});

// CREATE playlist
router.post('/', authMiddleware, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Playlist name is required' });

  const result = db.prepare(
    'INSERT INTO playlists (name, description, created_by) VALUES (?, ?, ?)'
  ).run(name, description || null, req.user.id);

  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(playlist);
});

// GET playlist with songs
router.get('/:id', authMiddleware, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ? AND created_by = ?').get(req.params.id, req.user.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  const songs = db.prepare(`
    SELECT s.*, ps.position FROM songs s
    JOIN playlist_songs ps ON s.id = ps.song_id
    WHERE ps.playlist_id = ?
    ORDER BY ps.position ASC
  `).all(req.params.id);

  res.json({ ...playlist, songs });
});

// ADD song to playlist
router.post('/:id/songs', authMiddleware, (req, res) => {
  const { song_id } = req.body;
  if (!song_id) return res.status(400).json({ error: 'song_id is required' });

  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ? AND created_by = ?').get(req.params.id, req.user.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  const maxPos = db.prepare('SELECT MAX(position) as m FROM playlist_songs WHERE playlist_id = ?').get(req.params.id);
  const position = (maxPos.m ?? -1) + 1;

  try {
    db.prepare('INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)').run(req.params.id, song_id, position);
    res.status(201).json({ message: 'Song added to playlist' });
  } catch (e) {
    res.status(409).json({ error: 'Song already in playlist' });
  }
});

// REMOVE song from playlist
router.delete('/:id/songs/:songId', authMiddleware, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ? AND created_by = ?').get(req.params.id, req.user.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  db.prepare('DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?').run(req.params.id, req.params.songId);
  res.json({ message: 'Song removed from playlist' });
});

// DELETE playlist
router.delete('/:id', authMiddleware, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ? AND created_by = ?').get(req.params.id, req.user.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  db.prepare('DELETE FROM playlists WHERE id = ?').run(req.params.id);
  res.json({ message: 'Playlist deleted' });
});

// UPDATE playlist name/description
router.patch('/:id', authMiddleware, (req, res) => {
  const { name, description } = req.body;
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ? AND created_by = ?').get(req.params.id, req.user.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  db.prepare('UPDATE playlists SET name = ?, description = ? WHERE id = ?').run(
    name || playlist.name, description ?? playlist.description, req.params.id
  );
  res.json(db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id));
});

module.exports = router;
