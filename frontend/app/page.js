'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import SongCard from '@/components/SongCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [songs, setSongs] = useState([]);
  const [history, setHistory] = useState([]);
  const [liked, setLiked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    Promise.all([
      api.getSongs(),
      api.getHistory(10),
      api.getLikedSongs(),
    ]).then(([s, h, l]) => {
      setSongs(s);
      setHistory(h);
      setLiked(l);
    }).finally(() => setLoading(false));
  }, [user]);

  const likedIds = new Set(liked.map((s) => s.id));

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const recentSongs = history.slice(0, 6);
  const newSongs = [...songs].slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.username} 👋
        </h1>
      </div>

      {/* Recently Played */}
      {recentSongs.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div className="section-header">
            <h2 className="section-title">Recently Played</h2>
            <Link href="/history" className="see-all-link">See all</Link>
          </div>
          <div className="song-grid">
            {recentSongs.map((song) => (
              <SongCard key={song.id} song={song} songs={songs} liked={likedIds.has(song.id)} />
            ))}
          </div>
        </section>
      )}

      {/* All Songs */}
      <section style={{ marginBottom: 40 }}>
        <div className="section-header">
          <h2 className="section-title">All Songs</h2>
          <Link href="/library" className="see-all-link">See all</Link>
        </div>
        {newSongs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎶</div>
            <div className="empty-state-title">No songs yet</div>
            <div className="empty-state-sub">
              {user?.role === 'composer' ? (
                <Link href="/upload" style={{ color: 'var(--accent)' }}>Upload your first song</Link>
              ) : (
                <span>Check back later for new music!</span>
              )}
            </div>
          </div>
        ) : (
          <div className="song-grid">
            {newSongs.map((song) => (
              <SongCard key={song.id} song={song} songs={songs} liked={likedIds.has(song.id)} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Quick Access</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { href: '/liked', emoji: '❤️', label: 'Liked Songs', bg: '#1a0a1a' },
            { href: '/playlists', emoji: '📋', label: 'Playlists', bg: '#0a1a0a' },
            { href: '/history', emoji: '⏱️', label: 'History', bg: '#0a0a1a' },
            ...(user?.role === 'composer' ? [{ href: '/studio', emoji: '🎹', label: 'Studio', bg: '#1a1a0a' }] : []),
          ].map(({ href, emoji, label, bg }) => (
            <Link key={href} href={href} style={{
              background: bg, border: '1px solid var(--border)', borderRadius: 12,
              padding: '20px 16px', textDecoration: 'none', color: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600, fontSize: 14,
              transition: 'all 0.15s', cursor: 'pointer',
            }}>
              <span style={{ fontSize: 24 }}>{emoji}</span>{label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
