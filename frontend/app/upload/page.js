'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useAuth } from '@/context/AuthContext';

const GENRES = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Other'];

export default function UploadPage() {
  const toast = useToast();
  const audioRef = useRef(null);
  const [form, setForm] = useState({ title: '', artist: '', album: '', genre: '' });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'composer') {
      router.push('/');
    }
  }, [user]);

  if (!user || user.role !== 'composer') return null;

  const handleAudioChange = (file) => {
    if (!file) return;
    setAudioFile(file);
    // Auto-fill title from filename
    const name = file.name.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
    setForm((f) => ({ ...f, title: f.title || name }));
    // Get duration
    const url = URL.createObjectURL(file);
    const a = new Audio(url);
    a.onloadedmetadata = () => { setDuration(Math.round(a.duration)); URL.revokeObjectURL(url); };
  };

  const handleCoverChange = (file) => {
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) { toast('Please select an audio file', 'error'); return; }
    if (!form.title || !form.artist) { toast('Title and artist are required', 'error'); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append('audio', audioFile);
    if (coverFile) fd.append('cover', coverFile);
    fd.append('title', form.title);
    fd.append('artist', form.artist);
    if (form.album) fd.append('album', form.album);
    if (form.genre) fd.append('genre', form.genre);
    fd.append('duration_sec', duration);

    try {
      await api.uploadSong(fd);
      toast('🎵 Song uploaded successfully!', 'success');
      setForm({ title: '', artist: '', album: '', genre: '' });
      setAudioFile(null); setCoverFile(null); setCoverPreview(null); setDuration(0);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5, marginBottom: 32 }}>Upload Music</h1>

      <form onSubmit={handleSubmit}>
        {/* Audio File Zone */}
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => audioRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleAudioChange(e.dataTransfer.files[0]); }}
          style={{ marginBottom: 24 }}
        >
          <input ref={audioRef} type="file" accept=".mp3,.wav,.flac,.ogg,.m4a" style={{ display: 'none' }}
            onChange={(e) => handleAudioChange(e.target.files[0])} />
          <div className="upload-zone-icon">{audioFile ? '✅' : '🎵'}</div>
          <div className="upload-zone-title">
            {audioFile ? audioFile.name : 'Drop your audio file here'}
          </div>
          <div className="upload-zone-sub">
            {audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB • ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}` : 'MP3, WAV, FLAC, OGG, M4A up to 50MB'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Cover Art */}
          <div>
            <label className="form-label">Cover Art (optional)</label>
            <div
              onClick={() => document.getElementById('cover-input').click()}
              style={{
                width: '100%', aspectRatio: '1', background: coverPreview ? 'transparent' : 'var(--bg-card)',
                borderRadius: 12, border: '1px dashed var(--border-hover)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', transition: 'border-color 0.15s',
              }}
            >
              {coverPreview
                ? <img src={coverPreview} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 40 }}>🖼️</span>
              }
            </div>
            <input id="cover-input" type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => handleCoverChange(e.target.files[0])} />
          </div>

          {/* Metadata */}
          <div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Song title" required />
            </div>
            <div className="form-group">
              <label className="form-label">Artist *</label>
              <input className="form-input" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} placeholder="Artist name" required />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Album</label>
            <input className="form-input" value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })} placeholder="Album name" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Genre</label>
            <select className="form-input" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}
              style={{ cursor: 'pointer' }}>
              <option value="">Select genre…</option>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={uploading} style={{ minWidth: 160, justifyContent: 'center' }}>
          {uploading ? '⏳ Uploading…' : '⬆️ Upload Song'}
        </button>
      </form>
    </div>
  );
}
