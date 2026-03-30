'use client';
import { usePlayer } from '@/context/PlayerContext';
import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { useToast } from './ToastProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const PlayIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>;
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export default function SongCard({ song, songs, liked: initialLiked, onLikeChange }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [liked, setLiked] = useState(initialLiked || false);
  const toast = useToast();
  const isCurrentSong = currentSong?.id === song.id;

  const coverUrl = song.cover_art_path ? `${API_URL}${song.cover_art_path}` : null;

  const handlePlay = useCallback((e) => {
    e.stopPropagation();
    playSong(song, songs || [song]);
  }, [song, songs, playSong]);

  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
    try {
      if (liked) {
        await api.unlikeSong(song.id);
        setLiked(false);
        toast?.('Removed from liked songs', 'success');
      } else {
        await api.likeSong(song.id);
        setLiked(true);
        toast?.('Added to liked songs ♥', 'success');
      }
      onLikeChange?.();
    } catch (err) {
      toast?.(err.message, 'error');
    }
  }, [liked, song.id, toast, onLikeChange]);

  return (
    <div className={`song-card ${isCurrentSong ? 'playing' : ''}`} onClick={() => playSong(song, songs || [song])}>
      <div style={{ position: 'relative' }}>
        {coverUrl ? (
          <img src={coverUrl} alt={song.title} className="song-card-cover" />
        ) : (
          <div className="song-card-cover-placeholder">🎵</div>
        )}
        <div className="song-card-play-overlay" onClick={handlePlay}>
          <PlayIcon />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="song-card-title" style={isCurrentSong ? { color: 'var(--accent)' } : {}}>{song.title}</div>
          <div className="song-card-artist">{song.artist}</div>
          {song.genre && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{song.genre}</div>}
        </div>
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <HeartIcon filled={liked} />
        </button>
      </div>
    </div>
  );
}
