'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function formatTime(sec) {
  if (!sec) return '—';
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const { playSong, currentSong, isPlaying } = usePlayer();
  const toast = useToast();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allSongs, setAllSongs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchPlaylist = useCallback(() => {
    Promise.all([api.getPlaylist(id), api.getSongs()])
      .then(([pl, all]) => { setPlaylist(pl); setAllSongs(all); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchPlaylist(); }, [fetchPlaylist]);

  const removeFromPlaylist = async (songId) => {
    await api.removeFromPlaylist(id, songId);
    fetchPlaylist();
    toast('Removed from playlist', 'success');
  };

  const addToPlaylist = async (songId) => {
    try {
      await api.addToPlaylist(id, songId);
      fetchPlaylist();
      toast('Added to playlist', 'success');
    } catch (err) { toast(err.message, 'error'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!playlist) return <div className="empty-state"><div className="empty-state-title">Playlist not found</div></div>;

  const songs = playlist.songs || [];
  const songIds = new Set(songs.map((s) => s.id));
  const availableSongs = allSongs.filter((s) => !songIds.has(s.id));

  return (
    <div>
      {/* Playlist Header */}
      <div className="page-hero" style={{ background: 'linear-gradient(180deg, rgba(29,100,200,0.25) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
          <div style={{ width: 140, height: 140, background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, flexShrink: 0, boxShadow: 'var(--shadow-md)' }}>
            🎵
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Playlist</div>
            <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>{playlist.name}</h1>
            {playlist.description && <div style={{ color: 'var(--text-secondary)' }}>{playlist.description}</div>}
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {songs.length > 0 && (
          <button className="btn btn-primary" onClick={() => playSong(songs[0], songs)}>
            ▶ Play All
          </button>
        )}
        <button className="btn btn-secondary" onClick={() => setShowAddModal(true)}>
          + Add Songs
        </button>
        <Link href="/playlists" className="btn btn-secondary">← Playlists</Link>
      </div>

      {/* Add Songs Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '70vh' }}>
            <div className="modal-title">Add Songs to "{playlist.name}"</div>
            {availableSongs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>All songs are already in this playlist</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {availableSongs.map((song) => (
                  <div key={song.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{song.artist}</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => addToPlaylist(song.id)}>Add</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Song List */}
      {songs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">This playlist is empty</div>
          <div className="empty-state-sub">
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>Add some songs</button>
          </div>
        </div>
      ) : (
        <div className="song-list">
          {songs.map((song, idx) => {
            const cover = song.cover_art_path ? `${API_URL}${song.cover_art_path}` : null;
            const isCurrent = currentSong?.id === song.id;
            return (
              <div key={song.id} className={`song-list-item ${isCurrent ? 'playing' : ''}`}
                onClick={() => playSong(song, songs)}>
                <div className="song-list-num">{isCurrent && isPlaying ? '♫' : idx + 1}</div>
                {cover
                  ? <img src={cover} alt={song.title} className="song-list-cover" />
                  : <div className="song-list-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎵</div>
                }
                <div className="song-list-info">
                  <div className="song-title" style={isCurrent ? { color: 'var(--accent)' } : {}}>{song.title}</div>
                  <div className="song-artist">{song.artist}</div>
                </div>
                <div className="song-list-album">{song.album || '—'}</div>
                <div className="song-list-duration">{formatTime(song.duration_sec)}</div>
                <button className="btn btn-secondary btn-sm" style={{ color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }}
                  onClick={(e) => { e.stopPropagation(); removeFromPlaylist(song.id); }}>
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
