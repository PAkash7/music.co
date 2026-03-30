'use client';
import { useAuth } from '@/context/AuthContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import ToastProvider from './ToastProvider';

const AUTH_PAGES = ['/login', '/register'];

export default function AppShell({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthPage || !user) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <PlayerProvider>
      <ToastProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">{children}</main>
          <PlayerBar />
        </div>
      </ToastProvider>
    </PlayerProvider>
  );
}
