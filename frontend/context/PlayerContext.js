'use client';
import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from './AuthContext';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none | one | all
  const audioRef = useRef(null);

  const currentSong = queue[currentIndex] || null;

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => handleNext();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentIndex, queue, isShuffle, repeatMode]);

  const playSong = useCallback((song, songList = null) => {
    const list = songList || (queue.length ? queue : [song]);
    const idx = list.findIndex((s) => s.id === song.id);
    setQueue(list);
    setCurrentIndex(idx >= 0 ? idx : 0);
    const audio = audioRef.current;
    audio.src = api.getStreamUrl(song.id);
    audio.play().then(() => setIsPlaying(true)).catch(console.error);
    // Log play
    if (user) api.logPlay(song.id).catch(() => {});
  }, [queue, user]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().then(() => setIsPlaying(true)).catch(console.error); }
  }, [isPlaying, currentSong]);

  const handleNext = useCallback(() => {
    if (!queue.length) return;
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = currentIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeatMode === 'all') nextIdx = 0;
        else { setIsPlaying(false); return; }
      }
    }
    setCurrentIndex(nextIdx);
    const audio = audioRef.current;
    audio.src = api.getStreamUrl(queue[nextIdx].id);
    audio.play().then(() => setIsPlaying(true)).catch(console.error);
  }, [queue, currentIndex, isShuffle, repeatMode]);

  const handlePrev = useCallback(() => {
    if (!queue.length) return;
    const audio = audioRef.current;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    const prevIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(prevIdx);
    audio.src = api.getStreamUrl(queue[prevIdx].id);
    audio.play().then(() => setIsPlaying(true)).catch(console.error);
  }, [queue, currentIndex]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (audio) { audio.currentTime = time; setProgress(time); }
  }, []);

  const changeVolume = useCallback((vol) => {
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentSong, queue, isPlaying, progress, duration, volume,
      isShuffle, repeatMode,
      playSong, togglePlay, handleNext, handlePrev,
      seek, changeVolume,
      setIsShuffle, setRepeatMode,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
