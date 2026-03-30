'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('music_token');
    if (token) {
      api.getMe()
        .then(setUser)
        .catch(() => { localStorage.removeItem('music_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('music_token', data.token);
    setUser(data.user);
    router.push('/');
  };

  const register = async (username, email, password, role) => {
    const data = await api.register({ username, email, password, role });
    localStorage.setItem('music_token', data.token);
    setUser(data.user);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('music_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
