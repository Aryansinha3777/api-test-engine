import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function Register({ onSwitch }) {
  const { login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast('All fields are required', 'error'); return;
    }
    if (form.password.length < 6) {
      toast('Password must be at least 6 characters', 'error'); return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      toast(`Welcome, ${data.user.name}!`, 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Registration failed', 'error');
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
          Create Account
        </h2>
        <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 28 }}>
          Start testing APIs for free
        </p>

        <div className="field" style={{ marginBottom: 14 }}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="John Doe"
            autoFocus
          />
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
          />
        </div>

        <div className="field" style={{ marginBottom: 24 }}>
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="Min 6 characters"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <><span className="spinner" />Creating…</> : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <span
            onClick={onSwitch}
            style={{ color: 'var(--accent)', cursor: 'pointer' }}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}