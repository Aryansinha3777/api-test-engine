import React from 'react';

export default function KeyValueEditor({ pairs, onChange, placeholder = ['Key', 'Value'] }) {
  const update = (i, field, val) => {
    const next = pairs.map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    onChange(next);
  };

  const remove = (i) => onChange(pairs.filter((_, idx) => idx !== i));

  const add = () => onChange([...pairs, { key: '', value: '' }]);

  return (
    <div>
      {pairs.map((p, i) => (
        <div className="kv-row" key={i}>
          <input
            value={p.key}
            onChange={e => update(i, 'key', e.target.value)}
            placeholder={placeholder[0]}
          />
          <input
            value={p.value}
            onChange={e => update(i, 'value', e.target.value)}
            placeholder={placeholder[1]}
          />
          <button className="kv-delete" onClick={() => remove(i)} title="Remove">×</button>
        </div>
      ))}
      <button className="btn btn-ghost btn-sm" onClick={add} style={{ marginTop: 4 }}>
        + Add Row
      </button>
    </div>
  );
}