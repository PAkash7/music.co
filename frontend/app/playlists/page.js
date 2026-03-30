'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const toast = useToast();

  const fetchPlaylists = useCallback(() => {
    api.getPlaylists().then(setPlaylists).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.createPlaylist({ name: newName.trim() });
      setNewName(''); setCreating(false);
      fetchPlaylists();
      toast('Playlist created!', 'success');
    } catch (err) { toast(err.message, 'error'); }
  };

  const deletePlaylist = async (id) => {
    if (!confirm('Delete this playlist?')) return;
    await api.deletePlaylist(id);
    fetchPlaylists();
    toast('Playlist deleted', 'success');
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>📋 Your Playlists</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>+ New Playlist</button>
      </div>

      {creating && (
        <div className="modal-overlay" onClick={() => setCreating(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Create New Playlist</div>
            <form onSubmit={createPlaylist}>
              <div className="form-group">
                <label className="form-label">Playlist Name</label>
                <input className="form-input" placeholder="My awesome playlist"
                  value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus required />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary">Create</button>
                <button type="button" className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎵</div>
          <div className="empty-state-title">No playlists yet</div>
          <div className="empty-state-sub">
            <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>Create your first playlist</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {playlists.map((pl) => (
            <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href={`/playlists/${pl.id}`} className="playlist-card" style={{ flex: 1 }}>
                <div className="playlist-cover-thumb">🎵</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{pl.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {pl.song_count || 0} {pl.song_count === 1 ? 'song' : 'songs'}
                  </div>
                </div>
              </Link>
              <button className="btn btn-secondary btn-sm" onClick={() => deletePlaylist(pl.id)}
                style={{ flexShrink: 0, color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
