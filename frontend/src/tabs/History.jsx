import React, { useState, useEffect, useCallback } from 'react';
import { getHistory, clearHistory } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';

export default function History({ onLoad }) {
  const toast = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await getHistory();
      setEntries(data.data || []);
    } catch {
      toast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleClear = async () => {
    if (!window.confirm('Clear all request history?')) return;
    setClearing(true);
    try {
      await clearHistory();
      setEntries([]);
      setSelected(null);
      toast('History cleared', 'success');
    } catch {
      toast('Failed to clear history', 'error');
    } finally {
      setClearing(false);
    }
  };

  const handleLoad = (entry) => {
    // Shape it like a SavedRequest so ApiTester can consume it
    onLoad({
      url: entry.url,
      method: entry.method,
      headers: entry.headers || {},
      body: entry.body || null,
    });
    toast('Loaded into API Tester', 'info');
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${date} · ${time}`;
  };

  const formatSize = (bytes) => {
    if (!bytes) return null;
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  if (loading) return (
    <div className="empty-state" style={{ marginTop: 60 }}>
      <span className="spinner" style={{ width: 24, height: 24 }} />
      <p>Loading history...</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: 340, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-2)', flexShrink: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
            Request History
            <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: 8 }}>
              ({entries.length})
            </span>
          </span>
          {entries.length > 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleClear}
              disabled={clearing}
            >
              {clearing ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {entries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">◎</div>
              <p>No history yet</p>
              <p style={{ fontSize: 11 }}>Requests you send will appear here</p>
            </div>
          ) : entries.map(entry => (
            <div
              key={entry._id}
              onClick={() => setSelected(entry)}
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                background: selected?._id === entry._id ? 'var(--bg-3)' : 'transparent',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className={`method-badge method-${entry.method}`}>{entry.method}</span>
                {entry.success && entry.statusCode ? (
                  <StatusBadge code={entry.statusCode} />
                ) : (
                  <span className="status-badge status-err" style={{ fontSize: 10 }}>ERR</span>
                )}
                {entry.responseTime != null && (
                  <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>
                    {entry.responseTime}ms
                  </span>
                )}
              </div>
              <div className="truncate" style={{ color: 'var(--text)', fontSize: 11, marginBottom: 3 }}>
                {entry.url}
              </div>
              <div style={{ color: 'var(--text-3)', fontSize: 10 }}>
                {formatTime(entry.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {selected ? (
          <div style={{ maxWidth: 600 }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className={`method-badge method-${selected.method}`}>{selected.method}</span>
              {selected.statusCode && <StatusBadge code={selected.statusCode} responseTime={selected.responseTime} />}
              {formatSize(selected.responseSize) && (
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {formatSize(selected.responseSize)}
                </span>
              )}
              <button
                className="btn btn-success btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={() => handleLoad(selected)}
              >
                ↗ Load into Tester
              </button>
            </div>

            {/* URL */}
            <div className="panel" style={{ marginBottom: 12 }}>
              <div className="panel-header"><span className="panel-title">URL</span></div>
              <div className="panel-body">
                <code style={{
                  display: 'block', padding: '8px 12px',
                  background: 'var(--bg)', borderRadius: 'var(--radius)',
                  color: 'var(--accent)', fontSize: 12, wordBreak: 'break-all',
                }}>
                  {selected.url}
                </code>
              </div>
            </div>

            {/* Error info if failed */}
            {!selected.success && selected.errorMessage && (
              <div className="panel" style={{ marginBottom: 12, borderColor: 'var(--red)' }}>
                <div className="panel-header">
                  <span className="panel-title" style={{ color: 'var(--red)' }}>Error</span>
                </div>
                <div className="panel-body">
                  <code style={{ fontSize: 12, color: 'var(--red)' }}>{selected.errorMessage}</code>
                </div>
              </div>
            )}

            {/* Headers */}
            {selected.headers && Object.keys(selected.headers).length > 0 && (
              <div className="panel" style={{ marginBottom: 12 }}>
                <div className="panel-header"><span className="panel-title">Request Headers</span></div>
                <div className="panel-body">
                  {Object.entries(selected.headers).map(([k, v]) => (
                    <div key={k} style={{ marginBottom: 4, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: 'var(--accent)' }}>{k}</span>
                      <span style={{ color: 'var(--text-3)' }}>: </span>
                      <span style={{ color: 'var(--text-2)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Body */}
            {selected.body && (
              <div className="panel" style={{ marginBottom: 12 }}>
                <div className="panel-header"><span className="panel-title">Request Body</span></div>
                <div className="panel-body">
                  <pre style={{
                    margin: 0, fontSize: 12, fontFamily: 'var(--font-mono)',
                    color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {typeof selected.body === 'string'
                      ? selected.body
                      : JSON.stringify(selected.body, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 8 }}>
              {formatTime(selected.createdAt)}
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <div className="empty-state-icon">◎</div>
            <p>Select an entry to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}