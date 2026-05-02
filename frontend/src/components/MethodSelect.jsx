import React from 'react';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const COLORS = {
  GET:    'var(--green)',
  POST:   'var(--accent)',
  PUT:    'var(--yellow)',
  DELETE: 'var(--red)',
  PATCH:  'var(--orange)',
};

export default function MethodSelect({ value, onChange, style }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: 'auto',
        minWidth: 90,
        color: COLORS[value] || 'var(--text)',
        fontWeight: 700,
        ...style,
      }}
    >
      {METHODS.map(m => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>
  );
}