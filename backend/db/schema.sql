-- ==============================================================================
-- RESONANCE MUSIC APP SCHEMA
-- Comprehensive, Production-Grade SQLite Database
-- Features: Strict foreign keys, CHECK constraints, triggers, and indices.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'composer', 'admin')),
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ------------------------------------------------------------------------------
-- 2. SONGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  genre TEXT,
  duration_sec INTEGER NOT NULL DEFAULT 0 CHECK (duration_sec >= 0),
  file_path TEXT NOT NULL,
  cover_art_path TEXT,
  uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  play_count INTEGER NOT NULL DEFAULT 0 CHECK (play_count >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_uploaded_by ON songs(uploaded_by);

-- ------------------------------------------------------------------------------
-- 3. PLAYLISTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS playlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT 1 CHECK (is_public IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_playlists_created_by ON playlists(created_by);

-- ------------------------------------------------------------------------------
-- 4. PLAYLIST_SONGS (Join Table)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS playlist_songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(playlist_id, song_id)
);

CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON playlist_songs(song_id);

-- ------------------------------------------------------------------------------
-- 5. LIKED_SONGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS liked_songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, song_id)
);

CREATE INDEX IF NOT EXISTS idx_liked_songs_user_id ON liked_songs(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_songs_song_id ON liked_songs(song_id);

-- ------------------------------------------------------------------------------
-- 6. PLAY_HISTORY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS play_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  played_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_play_history_user_id_played_at ON play_history(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_play_history_song_id ON play_history(song_id);

-- ------------------------------------------------------------------------------
-- 7. TRIGGERS (Auto-Updating `updated_at`)
-- ------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS updated_at_users 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS updated_at_songs 
AFTER UPDATE ON songs
FOR EACH ROW
BEGIN
  UPDATE songs SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS updated_at_playlists 
AFTER UPDATE ON playlists
FOR EACH ROW
BEGIN
  UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;
