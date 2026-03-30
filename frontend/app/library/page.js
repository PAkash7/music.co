'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import SongCard from '@/components/SongCard';

const GENRES = ['All', 'Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Other'];

export default function LibraryPage() {
  const [songs, setSongs] = useState([]);
  const [liked, setLiked] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchAll = () => {
    Promise.all([api.getSongs(), api.getLikedSongs()])
      .then(([s, l]) => { setSongs(s); setLiked(l); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const likedIds = new Set(liked.map((s) => s.id));

  const filtered = songs.filter((s) => {
    const q = search.toLowerCase();
    const matchQ = !q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || (s.album || '').toLowerCase().includes(q);
    const matchG = genre === 'All' || s.genre === genre;
    return matchQ && matchG;
  });

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: 24, fontSize: 32, fontWeight: 800 }}>Your Library</h1>

      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input className="search-input" placeholder="Search songs, artists, albums…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="chip-row">
        {GENRES.map((g) => (
          <button key={g} className={`chip ${genre === g ? 'active' : ''}`} onClick={() => setGenre(g)}>{g}</button>
        ))}
      </div>

      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
        {filtered.length} {filtered.length === 1 ? 'song' : 'songs'}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No songs found</div>
          <div className="empty-state-sub">Try adjusting your search or filters</div>
        </div>
      ) : (
        <div className="song-grid">
          {filtered.map((song) => (
            <SongCard key={song.id} song={song} songs={filtered} liked={likedIds.has(song.id)} onLikeChange={fetchAll} />
          ))}
        </div>
      )}
    </div>
  );
}
