import React, { useState, useEffect, useCallback } from 'react';
import { getEnvironments, createEnvironment, updateEnvironment, deleteEnvironment } from '../services/api';
import { useToast } from '../context/ToastContext';

const EMPTY_FORM = { name: '', variables: [{ key: '', value: '' }] };

export default function Environments({ activeEnvId, onActivate }) {
  const toast = useToast();
  const [envs, setEnvs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing]   = useState(null); // env being edited
  const [form, setForm]         = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await getEnvironments();
      setEnvs(data.data || []);
    } catch {
      toast('Failed to load environments', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (env) => {
    setEditing(env);
    setForm({
      name: env.name,
      variables: env.variables.length > 0
        ? [...env.variables.map(v => ({ key: v.key, value: v.value })), { key: '', value: '' }]
        : [{ key: '', value: '' }],
    });
    setShowForm(true);
  };

  const handleVarChange = (idx, field, val) => {
    const updated = form.variables.map((v, i) => i === idx ? { ...v, [field]: val } : v);
    // Auto-add empty row when typing in last row
    const last = updated[updated.length - 1];
    if (last.key || last.value) updated.push({ key: '', value: '' });
    setForm(f => ({ ...f, variables: updated }));
  };

  const removeVar = (idx) => {
    if (form.variables.length <= 1) return;
    setForm(f => ({ ...f, variables: f.variables.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast('Environment name is required', 'error'); return; }
    setSaving(true);
    try {
      const cleanVars = form.variables.filter(v => v.key.trim());
      const payload = { name: form.name.trim(), variables: cleanVars };

      if (editing) {
        await updateEnvironment(editing._id, payload);
        toast('Environment updated', 'success');
      } else {
        await createEnvironment(payload);
        toast('Environment created', 'success');
      }
      setShowForm(false);
      load();
    } catch {
      toast('Failed to save environment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this environment?')) return;
    try {
      await deleteEnvironment(id);
      if (selected?._id === id) setSelected(null);
      if (activeEnvId === id) onActivate(null);
      toast('Deleted', 'success');
      load();
    } catch {
      toast('Delete failed', 'error');
    }
  };

  if (loading) return (
    <div className="empty-state" style={{ marginTop: 60 }}>
      <span className="spinner" style={{ width: 24, height: 24 }} />
      <p>Loading environments...</p>
    </div>
  );

  if (showForm) {
    return (
      <div style={{ maxWidth: 560, padding: 24 }}>
        <h3 style={{ marginBottom: 20, fontFamily: 'var(--font-display)', fontSize: 15 }}>
          {editing ? 'Edit Environment' : 'New Environment'}
        </h3>

        <div className="field" style={{ marginBottom: 16 }}>
          <label>Environment Name</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Development, Production, Staging"
            autoFocus
          />
        </div>

        <div className="field">
          <label style={{ marginBottom: 8, display: 'block' }}>
            Variables
            <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 11, marginLeft: 8 }}>
              Use {'{{variableName}}'} in URLs and headers
            </span>
          </label>

          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 28px', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text-3)', padding: '0 4px' }}>KEY</span>
            <span style={{ fontSize: 10, color: 'var(--text-3)', padding: '0 4px' }}>VALUE</span>
            <span />
          </div>

          {form.variables.map((v, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 28px', gap: 6, marginBottom: 6 }}>
              <input
                value={v.key}
                onChange={e => handleVarChange(idx, 'key', e.target.value)}
                placeholder="baseUrl"
                style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}
              />
              <input
                value={v.value}
                onChange={e => handleVarChange(idx, 'value', e.target.value)}
                placeholder="http://localhost:3000"
                style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}
              />
              <button
                className="kv-delete"
                onClick={() => removeVar(idx)}
                style={{ opacity: form.variables.length <= 1 ? 0.2 : 1 }}
                disabled={form.variables.length <= 1}
              >×</button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <><span className="spinner" />Saving…</> : editing ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: 280, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-2)', flexShrink: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
            Environments
          </span>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ New</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {envs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⬡</div>
              <p>No environments yet</p>
              <button className="btn btn-ghost btn-sm" onClick={openCreate}>Create one</button>
            </div>
          ) : envs.map(env => (
            <div
              key={env._id}
              onClick={() => setSelected(env)}
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                background: selected?._id === env._id ? 'var(--bg-3)' : 'transparent',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Active indicator dot */}
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: activeEnvId === env._id ? 'var(--green)' : 'var(--bg-4)',
                  border: '1px solid var(--border)',
                  transition: 'background 0.2s',
                }} />
                <span style={{ fontWeight: 600, fontSize: 13, flex: 1, color: 'var(--text)' }}>
                  {env.name}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  {env.variables.length} var{env.variables.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {selected ? (
          <div style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>
                {selected.name}
              </span>
              {activeEnvId === selected._id ? (
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 4,
                  background: 'var(--green)', color: '#fff', fontWeight: 600,
                }}>ACTIVE</span>
              ) : (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => { onActivate(selected); toast(`"${selected.name}" is now active`, 'success'); }}
                >
                  Set Active
                </button>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(selected)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={e => handleDelete(selected._id, e)}>Delete</button>
              </div>
            </div>

            {/* Variables table */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Variables</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  Use as {'{{variableName}}'} in API Tester
                </span>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                {selected.variables.length === 0 ? (
                  <div style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>
                    No variables defined
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '6px 16px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 500 }}>KEY</th>
                        <th style={{ padding: '6px 16px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 500 }}>VALUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.variables.map((v, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 16px', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                            {`{{${v.key}}}`}
                          </td>
                          <td style={{ padding: '8px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>
                            {v.value || <span style={{ color: 'var(--text-3)' }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <div className="empty-state-icon">⬡</div>
            <p>Select an environment to view its variables</p>
          </div>
        )}
      </div>
    </div>
  );
}