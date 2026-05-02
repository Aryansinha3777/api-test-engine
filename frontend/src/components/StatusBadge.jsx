import React from 'react';

export default function StatusBadge({ code, responseTime }) {
  if (!code) return null;

  let cls = 'status-err';
  if (code >= 200 && code < 300) cls = 'status-2xx';
  else if (code >= 300 && code < 400) cls = 'status-3xx';
  else if (code >= 400 && code < 500) cls = 'status-4xx';
  else if (code >= 500) cls = 'status-5xx';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className={`status-badge ${cls}`}>{code}</span>
      {responseTime !== undefined && (
        <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{responseTime}ms</span>
      )}
    </div>
  );
}