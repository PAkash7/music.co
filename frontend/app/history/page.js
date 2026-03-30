'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import SongCard from '@/components/SongCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function formatTime(sec) {
  if (!sec) return '';
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHistory(50).then(setHistory).finally(() => setLoading(false));
  }, []);

  const clear = async () => {
    if (!confirm('Clear all play history?')) return;
    await api.clearHistory?.() || fetch(`${API_URL}/api/history`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('music_token')}` } });
    setHistory([]);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>⏱️ Play History</h1>
        {history.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={clear}>Clear History</button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏱️</div>
          <div className="empty-state-title">No history yet</div>
          <div className="empty-state-sub">Songs you play will appear here</div>
        </div>
      ) : (
        <div className="song-list">
          {history.map((song, idx) => {
            const cover = song.cover_art_path ? `${API_URL}${song.cover_art_path}` : null;
            return (
              <div key={`${song.id}-${idx}`} className="song-list-item">
                <div className="song-list-num">{idx + 1}</div>
                {cover
                  ? <img src={cover} alt={song.title} className="song-list-cover" />
                  : <div className="song-list-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎵</div>
                }
                <div className="song-list-info">
                  <div className="song-title">{song.title}</div>
                  <div className="song-artist">{song.artist}</div>
                </div>
                <div className="song-list-album">{song.album || '—'}</div>
                <div className="song-list-duration">{formatTime(song.duration_sec)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
