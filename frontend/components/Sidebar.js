'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
);
const LibraryIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
);
const PlaylistIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h9v-2H3v2zm0-5h9v-2H3v2zm0-5h9V6H3v2zm13 0v8.55c-.94-.54-2.1-.75-3.33-.32-1.49.52-2.5 1.9-2.65 3.45C9.87 21.96 11.72 24 14 24c2.21 0 4-1.79 4-4V10h3V8h-5z"/></svg>
);
const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
);

const navItems = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/library', label: 'Library', Icon: LibraryIcon },
  { href: '/liked', label: 'Liked Songs', Icon: HeartIcon },
  { href: '/history', label: 'History', Icon: HistoryIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    api.getPlaylists().then(setPlaylists).catch(() => {});
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
        Resonance
      </div>

      {user?.role === 'composer' && (
        <>
          <div className="sidebar-section-title">Composer Studio</div>
          <Link href="/studio" className={`sidebar-item ${pathname === '/studio' ? 'active' : ''}`}>
            <span style={{ fontSize: 18 }}>🎹</span>
            Dashboard
          </Link>
          <Link href="/upload" className={`sidebar-item ${pathname === '/upload' ? 'active' : ''}`}>
            <UploadIcon />
            Upload New Track
          </Link>
        </>
      )}

      {navItems.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className={`sidebar-item ${pathname === href ? 'active' : ''}`}>
          <Icon />
          {label}
        </Link>
      ))}

      <div className="sidebar-section-title">Playlists</div>
      <Link href="/playlists" className={`sidebar-item ${pathname === '/playlists' ? 'active' : ''}`}>
        <PlaylistIcon />
        My Playlists
      </Link>
      {playlists.slice(0, 6).map((pl) => (
        <Link key={pl.id} href={`/playlists/${pl.id}`}
          className={`sidebar-item ${pathname === `/playlists/${pl.id}` ? 'active' : ''}`}
          style={{ paddingLeft: 24 }}
        >
          <span style={{ fontSize: 20 }}>🎵</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.name}</span>
        </Link>
      ))}

      <div style={{ flex: 1 }} />

      {user && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
          <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
            👤 {user.username}
          </div>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }} onClick={logout}>
            <LogoutIcon />
            Log out
          </button>
        </div>
      )}
    </aside>
  );
}
