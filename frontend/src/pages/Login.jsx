import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function Login({ onSwitch }) {
  const { login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      toast('Email and password are required', 'error'); return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast(`Welcome back, ${data.user.name}!`, 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
    }}>
      <div style={{
        width: 360, background: 'var(--bg-2)',
        border: '1px solid var(--border)', borderRadius: 12, padding: 32,
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 6 }}>
          API Test Engine
        </h2>
        <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 28 }}>
          Sign in to your account
        </p>

        <div className="field" style={{ marginBottom: 14 }}>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>

        <div className="field" style={{ marginBottom: 24 }}>
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <><span className="spinner" />Signing in…</> : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>
          No account?{' '}
          <span
            onClick={onSwitch}
            style={{ color: 'var(--accent)', cursor: 'pointer' }}
          >
            Create one
          </span>
        </p>
      </div>
    </div>
  );
}