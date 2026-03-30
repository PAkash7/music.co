'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import SongCard from '@/components/SongCard';

export default function LikedPage() {
  const [songs, setSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiked = useCallback(() => {
    Promise.all([api.getLikedSongs(), api.getSongs()])
      .then(([l, all]) => { setSongs(l); setAllSongs(all); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLiked(); }, [fetchLiked]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-hero" style={{ background: 'linear-gradient(180deg, rgba(100,40,200,0.25) 0%, transparent 100%)' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>❤️</div>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Liked Songs</h1>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          {songs.length} {songs.length === 1 ? 'song' : 'songs'}
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💔</div>
          <div className="empty-state-title">No liked songs yet</div>
          <div className="empty-state-sub">Click the ♥ on any song to like it</div>
        </div>
      ) : (
        <div className="song-grid">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} songs={songs} liked={true} onLikeChange={fetchLiked} />
          ))}
        </div>
      )}
    </div>
  );
}
