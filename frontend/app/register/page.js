'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await register(form.username, form.email, form.password, form.role); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🎵 Resonance</div>
        <div className="auth-subtitle">Create your free account</div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" placeholder="cooluser"
              value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="at least 8 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
          </div>
          <div className="form-group">
            <label className="form-label">I want to...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button type="button" 
                style={{ padding: '12px', border: `1px solid ${form.role==='user'?'var(--accent)':'var(--border)'}`, borderRadius: 8, background: form.role==='user'?'var(--accent-dim)':'var(--bg-card)', color: form.role==='user'?'var(--accent)':'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
                onClick={() => setForm({...form, role: 'user'})}>
                🎧 Listen to Music
              </button>
              <button type="button"
                style={{ padding: '12px', border: `1px solid ${form.role==='composer'?'var(--accent)':'var(--border)'}`, borderRadius: 8, background: form.role==='composer'?'var(--accent-dim)':'var(--bg-card)', color: form.role==='composer'?'var(--accent)':'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
                onClick={() => setForm({...form, role: 'composer'})}>
                🎹 Upload Music
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
