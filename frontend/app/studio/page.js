'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function formatTime(sec) {
  if (!sec) return '0:00';
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export default function StudioPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'composer') {
      router.push('/');
      return;
    }
    if (user) {
      // Get all songs and filter by this user's uploads
      api.getSongs()
        .then((all) => setSongs(all.filter((s) => s.uploader === user.username)))
        .finally(() => setLoading(false));
    }
  }, [user, router]);

  if (!user || user.role !== 'composer') return null;
  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const totalDuration = songs.reduce((acc, s) => acc + s.duration_sec, 0);

  return (
    <div>
      <div className="page-hero" style={{ background: 'linear-gradient(180deg, rgba(255, 107, 43, 0.2) 0%, transparent 100%)' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Composer Studio</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>Your Tracks</h1>
        
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{songs.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploaded Tracks</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{formatTime(totalDuration)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Audio</div>
          </div>
        </div>
      </div>

      <div className="section-header" style={{ marginBottom: 20 }}>
        <h2 className="section-title">Discography</h2>
        <Link href="/upload" className="btn btn-primary btn-sm">+ Upload New</Link>
      </div>

      {songs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎹</div>
          <div className="empty-state-title">No tracks uploaded yet</div>
          <div className="empty-state-sub">
            <Link href="/upload" style={{ color: 'var(--accent)' }}>Upload your first masterpiece</Link>
          </div>
        </div>
      ) : (
        <div className="song-list">
          {songs.map((song, idx) => {
            const cover = song.cover_art_path ? `${API_URL}${song.cover_art_path}` : null;
            return (
              <div key={song.id} className="song-list-item" style={{ gridTemplateColumns: '48px 1fr 1fr 120px auto' }}>
                <div className="song-list-num">{idx + 1}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {cover ? (
                    <img src={cover} alt={song.title} className="song-list-cover" />
                  ) : (
                    <div className="song-list-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎵</div>
                  )}
                  <div className="song-list-info">
                    <div className="song-title">{song.title}</div>
                    <div className="song-artist">{song.artist}</div>
                  </div>
                </div>
                <div className="song-list-album">{song.album || '—'}</div>
                <div className="song-list-duration">{formatTime(song.duration_sec)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(song.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
