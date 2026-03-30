const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function getToken() {
  if (typeof window !== 'undefined') return localStorage.getItem('music_token');
  return null;
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  register: (data) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiFetch('/api/auth/me'),

  // Songs
  getSongs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/songs${q ? '?' + q : ''}`);
  },
  getSong: (id) => apiFetch(`/api/songs/${id}`),
  uploadSong: (formData) => apiFetch('/api/songs/upload', { method: 'POST', body: formData }),
  deleteSong: (id) => apiFetch(`/api/songs/${id}`, { method: 'DELETE' }),
  getStreamUrl: (id) => `${API_URL}/api/songs/${id}/stream`,

  // Playlists
  getPlaylists: () => apiFetch('/api/playlists'),
  createPlaylist: (data) => apiFetch('/api/playlists', { method: 'POST', body: JSON.stringify(data) }),
  getPlaylist: (id) => apiFetch(`/api/playlists/${id}`),
  addToPlaylist: (playlistId, songId) => apiFetch(`/api/playlists/${playlistId}/songs`, { method: 'POST', body: JSON.stringify({ song_id: songId }) }),
  removeFromPlaylist: (playlistId, songId) => apiFetch(`/api/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' }),
  deletePlaylist: (id) => apiFetch(`/api/playlists/${id}`, { method: 'DELETE' }),
  updatePlaylist: (id, data) => apiFetch(`/api/playlists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Likes
  getLikedSongs: () => apiFetch('/api/likes'),
  likeSong: (songId) => apiFetch(`/api/likes/${songId}`, { method: 'POST' }),
  unlikeSong: (songId) => apiFetch(`/api/likes/${songId}`, { method: 'DELETE' }),
  getLikeStatus: (songId) => apiFetch(`/api/likes/${songId}/status`),

  // History
  getHistory: (limit) => apiFetch(`/api/history${limit ? '?limit=' + limit : ''}`),
  logPlay: (songId) => apiFetch(`/api/history/${songId}`, { method: 'POST' }),
};

export default api;
