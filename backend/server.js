require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directories exist
['uploads/audio', 'uploads/covers'].forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static serving for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/likes', require('./routes/likes'));
app.use('/api/history', require('./routes/history'));

// Root route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Music App API</title></head>
      <body style="font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #121212; color: #fff;">
        <div style="text-align: center;">
          <h1>🎵 Music App Backend API is Running</h1>
          <p>Version 1.0.0</p>
          <p>Available endpoints begin with <code>/api/</code>.</p>
          <p>Check <a href="/api/health" style="color: #4CAF50;">/api/health</a> for status.</p>
        </div>
      </body>
    </html>
  `);
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🎵 Music App API running on http://localhost:${PORT}`);
});

module.exports = app;
