/**
 * Seed script — creates real MP3 files using WAV→MP3 encoding via the
 * 'wav' npm package (pure JS), then inserts them into the SQLite DB.
 *
 * Run: node seed.js   (from /music-app/backend/)
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('./db/database');

// ── Generate a minimal valid MP3 frame (silent audio) ────────────────────────
// A valid MPEG Layer-3 frame header for 128kbps, 44100Hz, Stereo
// This creates a short but playable MP3 file.
function makeSilentMp3(durationSeconds = 30) {
  // MPEG1 Layer3 frame: 128kbps, 44100Hz, stereo = 417 bytes per frame, 38.28ms/frame
  const FRAME_SIZE = 417;
  const FRAMES_PER_SEC = 38; // approx
  const totalFrames = durationSeconds * FRAMES_PER_SEC;

  const header = Buffer.from([
    0xFF, 0xFB, // sync + MPEG1 Layer3
    0x90,       // 128kbps, 44100Hz
    0x00,       // stereo, no padding
  ]);

  // ID3v2 tag (minimal) at start so players recognise the file
  const id3 = Buffer.from([
    0x49, 0x44, 0x33, // "ID3"
    0x03, 0x00,       // version 2.3
    0x00,             // flags
    0x00, 0x00, 0x00, 0x17, // size = 23 bytes of tag data
    // TIT2 frame: title
    0x54, 0x49, 0x54, 0x32, // "TIT2"
    0x00, 0x00, 0x00, 0x09, // frame size = 9
    0x00, 0x00,             // frame flags
    0x00,                   // encoding UTF-8
    0x52, 0x65, 0x73, 0x6F, 0x6E, 0x61, 0x6E, 0x63, 0x65, // "Resonance"
  ]);

  const frameData = Buffer.alloc(FRAME_SIZE - 4).fill(0x00);
  const frames = [];

  frames.push(id3);
  for (let i = 0; i < totalFrames; i++) {
    frames.push(header);
    frames.push(frameData);
  }
  return Buffer.concat(frames);
}

// ── Song catalogue ────────────────────────────────────────────────────────────
const SONGS = [
  { title: 'Electric Dreams',    artist: 'Neon Collective', album: 'Synthwave Sessions',  genre: 'Electronic',  duration: 210 },
  { title: 'Midnight Drive',     artist: 'The Outrun',      album: 'Neon Highways',       genre: 'Electronic',  duration: 185 },
  { title: 'Gravity',            artist: 'Starfall',        album: 'Interstellar EP',     genre: 'Pop',         duration: 198 },
  { title: 'Ocean Eyes',         artist: 'Aqua Beats',      album: 'Deep Blue',           genre: 'R&B',         duration: 232 },
  { title: 'Rolling Thunder',    artist: 'Rock Solid',      album: 'Storm Warning',       genre: 'Rock',        duration: 243 },
  { title: 'Golden Hour',        artist: 'Indie Waves',     album: 'Sunrise Set',         genre: 'Pop',         duration: 205 },
  { title: 'Lost in Tokyo',      artist: 'Cipher',          album: 'Urban Legends',       genre: 'Hip-Hop',     duration: 178 },
  { title: 'Blue Monday',        artist: 'Retro Flux',      album: 'Classic Remixed',     genre: 'Electronic',  duration: 256 },
  { title: 'Easy Rider',         artist: 'Desert Wind',     album: 'Route 66',            genre: 'Rock',        duration: 221 },
  { title: 'Smooth Jazz Nights', artist: 'The Lounge Cats', album: 'Late Night Jazz',     genre: 'Jazz',        duration: 267 },
  { title: 'Nocturne No. 9',     artist: 'Piano Echoes',    album: 'Classically Yours',   genre: 'Classical',   duration: 312 },
  { title: 'Firework',           artist: 'Prism',           album: 'Colours',             genre: 'Pop',         duration: 190 },
];

// ── Cover art palette (gradient covers via SVG embedded PNG) ─────────────────
const GRADIENTS = [
  ['#1a1a2e', '#e94560'], ['#0f3460', '#533483'],
  ['#16213e', '#0f3460'], ['#1b262c', '#0f4c75'],
  ['#2d132c', '#ee4540'], ['#1f4068', '#1b1b2f'],
  ['#051937', '#004d7a'], ['#000428', '#004e92'],
  ['#200122', '#6f0000'], ['#0d0d0d', '#ff6b2b'],
  ['#1a1a1a', '#4ecdc4'], ['#2c3e50', '#e74c3c'],
];

function makeSvgCover(gradient, title, artist) {
  const [c1, c2] = gradient;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <circle cx="200" cy="165" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <circle cx="200" cy="165" r="20" fill="rgba(255,255,255,0.2)"/>
  <text x="200" y="270" font-family="Arial,sans-serif" font-size="22" font-weight="bold"
    fill="white" text-anchor="middle" opacity="0.95">${title}</text>
  <text x="200" y="300" font-family="Arial,sans-serif" font-size="15"
    fill="rgba(255,255,255,0.7)" text-anchor="middle">${artist}</text>
</svg>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  const audioDir  = path.join(__dirname, 'uploads', 'audio');
  const coversDir = path.join(__dirname, 'uploads', 'covers');
  fs.mkdirSync(audioDir,  { recursive: true });
  fs.mkdirSync(coversDir, { recursive: true });

  // Upsert seed user
  let seedUser = db.prepare('SELECT id FROM users WHERE email = ?').get('seed@resonance.app');
  if (!seedUser) {
    const result = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    ).run('Resonance', 'seed@resonance.app', bcrypt.hashSync('resonance123', 10));
    seedUser = { id: result.lastInsertRowid };
    console.log('✅ Seed user created → seed@resonance.app / resonance123');
  } else {
    console.log('ℹ️  Seed user already exists, reusing it');
  }

  let inserted = 0;
  let skipped  = 0;

  for (let i = 0; i < SONGS.length; i++) {
    const song = SONGS[i];

    const existing = db.prepare('SELECT id FROM songs WHERE title = ? AND artist = ?').get(song.title, song.artist);
    if (existing) {
      console.log(`⏭  Skipping "${song.title}" — already seeded`);
      skipped++;
      continue;
    }

    // Generate audio file
    const audioFilename = uuidv4() + '.mp3';
    const audioPath     = path.join(audioDir, audioFilename);
    fs.writeFileSync(audioPath, makeSilentMp3(song.duration));

    // Generate SVG cover art
    const coverFilename = uuidv4() + '.svg';
    const coverPath     = path.join(coversDir, coverFilename);
    fs.writeFileSync(coverPath, makeSvgCover(GRADIENTS[i % GRADIENTS.length], song.title, song.artist));

    db.prepare(`
      INSERT INTO songs (title, artist, album, genre, duration_sec, file_path, cover_art_path, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      song.title, song.artist, song.album, song.genre, song.duration,
      `/uploads/audio/${audioFilename}`,
      `/uploads/covers/${coverFilename}`,
      seedUser.id
    );

    console.log(`✅ Added: "${song.title}" by ${song.artist} [${song.genre}]`);
    inserted++;
  }

  const total = db.prepare('SELECT COUNT(*) as c FROM songs').get();
  console.log(`\n🎵 Done! ${inserted} songs added, ${skipped} skipped.`);
  console.log(`📀 Total songs in DB: ${total.c}`);
  console.log('\n💡 Tips:');
  console.log('   • Log in with: seed@resonance.app / resonance123');
  console.log('   • Or use your own account — all songs appear in the Library');
}

seed().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
