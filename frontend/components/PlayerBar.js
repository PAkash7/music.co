'use client';
import { usePlayer } from '@/context/PlayerContext';
import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PlayIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const PrevIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>;
const NextIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>;
const ShuffleIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>;
const RepeatIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>;
const RepeatOneIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>;
const VolumeIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>;

const Visualizer = () => (
  <div className="visualizer">
    {[16, 10, 18, 12, 8].map((h, i) => (
      <div key={i} className="visualizer-bar" style={{ height: h }}/>
    ))}
  </div>
);

export default function PlayerBar() {
  const { currentSong, isPlaying, progress, duration, volume, isShuffle, repeatMode,
    togglePlay, handleNext, handlePrev, seek, changeVolume, setIsShuffle, setRepeatMode } = usePlayer();

  const [isDragging, setIsDragging] = useState(false);

  const toggleRepeat = () => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  const handleProgressClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  }, [duration, seek]);

  const coverUrl = currentSong?.cover_art_path
    ? `${API_URL}${currentSong.cover_art_path}`
    : null;

  return (
    <div className="player-bar">
      {/* Song Info */}
      <div className="player-song-info">
        {coverUrl ? (
          <img src={coverUrl} alt="cover" className="player-cover" />
        ) : (
          <div className="player-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {currentSong ? '🎵' : '🎧'}
          </div>
        )}
        <div className="player-song-text">
          <div className="player-song-title">{currentSong?.title || 'Nothing playing'}</div>
          <div className="player-song-artist">{currentSong?.artist || '—'}</div>
        </div>
        {isPlaying && <Visualizer />}
      </div>

      {/* Controls */}
      <div className="player-controls">
        <div className="player-buttons">
          <button className={`player-btn ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)} title="Shuffle">
            <ShuffleIcon />
          </button>
          <button className="player-btn" onClick={handlePrev} title="Previous">
            <PrevIcon />
          </button>
          <button className="player-btn player-play-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="player-btn" onClick={handleNext} title="Next">
            <NextIcon />
          </button>
          <button className={`player-btn ${repeatMode !== 'none' ? 'active' : ''}`} onClick={toggleRepeat} title="Repeat">
            {repeatMode === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
          </button>
        </div>

        <div className="player-progress">
          <span className="player-time">{formatTime(progress)}</span>
          <div className="progress-bar-container" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }} />
          </div>
          <span className="player-time" style={{ textAlign: 'right' }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="player-right">
        <div className="volume-control">
          <VolumeIcon />
          <input
            type="range" min="0" max="1" step="0.01"
            value={volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            style={{ width: 100, '--value': `${volume * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
