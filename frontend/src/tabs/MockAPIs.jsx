import React, { useState, useEffect, useCallback } from 'react';
import { getMockAPIs, createMockAPI, updateMockAPI, deleteMockAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import MethodSelect from '../components/MethodSelect';
import JsonViewer from '../components/JsonViewer';

const STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 422, 429, 500, 502, 503];

const BLANK = {
  endpointPath: '',
  method: 'GET',
  responseBody: '{\n  "message": "Hello from mock!"\n}',
  statusCode: 200,
  description: '',
};

export default function MockAPIs({ onLoad }) {
  const toast = useToast();
  const [mocks, setMocks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null); 
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const [selected, setSelected] = useState(null); 

  const load = useCallback(async () => {
    try {
      const { data } = await getMockAPIs();
      setMocks(data.data || []);
    } catch {
      toast('Failed to load mock APIs', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(BLANK);
    setShowForm(true);
  };

  const openEdit = (mock) => {
    setEditing(mock);
    setForm({
      endpointPath: mock.endpointPath,
      method: mock.method,
      responseBody: typeof mock.responseBody === 'string'
        ? mock.responseBody
        : JSON.stringify(mock.responseBody, null, 2),
      statusCode: mock.statusCode,
      description: mock.description || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.endpointPath.trim()) { toast('Endpoint path is required', 'error'); return; }

    let parsedBody;
    try {
      parsedBody = JSON.parse(form.responseBody);
    } catch {
      toast('Response body must be valid JSON', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        endpointPath: form.endpointPath.trim().replace(/^\/+/, ''),
        method: form.method,
        responseBody: parsedBody,
        statusCode: Number(form.statusCode),
        description: form.description,
      };

      if (editing) {
        await updateMockAPI(editing._id, payload);
        toast('Mock updated!', 'success');
      } else {
        await createMockAPI(payload);
        toast('Mock created!', 'success');
      }

      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to save mock', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this mock endpoint?')) return;
    try {
      await deleteMockAPI(id);
      toast('Mock deleted', 'success');
      if (selected?._id === id) setSelected(null);
      load();
    } catch {
      toast('Delete failed', 'error');
    }
  };

  const copyUrl = (path, e) => {
    e.stopPropagation();
    const url = `${window.location.protocol}//${window.location.hostname}:5000/mock/${path}`;
    navigator.clipboard.writeText(url).then(() => toast('URL copied!', 'success'));
  };

  if (loading) return (
    <div className="empty-state" style={{ marginTop: 60 }}>
      <span className="spinner" style={{ width:24, height:24 }} />
      <p>Loading mocks...</p>
    </div>
  );

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* Left: list */}
      <div style={{
        width: 340, flexShrink:0,
        borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        <div style={{
          padding:'12px 16px', borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          background: 'var(--bg-2)', flexShrink:0,
        }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13 }}>
            Mock Endpoints
            <span style={{ color:'var(--text-3)', fontWeight:400, marginLeft:8 }}>
              ({mocks.length})
            </span>
          </span>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ New</button>
        </div>

        <div style={{ flex:1, overflow:'auto' }}>
          {mocks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⬡</div>
              <p>No mock endpoints yet</p>
              <button className="btn btn-ghost btn-sm" onClick={openCreate}>Create one</button>
            </div>
          ) : mocks.map(mock => (
            <div
              key={mock._id}
              onClick={() => setSelected(mock)}
              style={{
                padding:'10px 16px',
                borderBottom:'1px solid var(--border)',
                cursor:'pointer',
                background: selected?._id === mock._id ? 'var(--bg-3)' : 'transparent',
                transition:'background 0.1s',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span className={`method-badge method-${mock.method}`}>{mock.method}</span>
                <span style={{ color:'var(--text)', fontSize:12, flex:1 }} className="truncate">
                  /{mock.endpointPath}
                </span>
                <span style={{
                  fontSize:10, padding:'1px 6px', borderRadius:4,
                  background:'var(--bg-4)', color:'var(--text-3)'
                }}>{mock.statusCode}</span>
              </div>
              {mock.description && (
                <div className="truncate text-xs" style={{ color:'var(--text-3)' }}>
                  {mock.description}
                </div>
              )}
              <div style={{ display:'flex', gap:4, marginTop:6 }}>
                <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); openEdit(mock); }}>
                  Edit
                </button>
                <button className="btn btn-ghost btn-sm" onClick={e => copyUrl(mock.endpointPath, e)}>
                  Copy URL
                </button>
                <button className="btn btn-danger btn-sm" onClick={e => handleDelete(mock._id, e)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: preview or form */}
      <div style={{ flex:1, overflow:'auto', padding:20 }}>
        {showForm ? (
          <MockForm
            form={form} setForm={setForm}
            editing={editing} saving={saving}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        ) : selected ? (
          <MockDetail
            mock={selected}
            onEdit={() => openEdit(selected)}
            onTest={() => {
              onLoad({
                url: `${window.location.protocol}//${window.location.hostname}:5000/mock/${selected.endpointPath}`,
                method: selected.method,
                headers: {},
                body: null,
              });
            }}
          />
        ) : (
          <div className="empty-state" style={{ marginTop:60 }}>
            <div className="empty-state-icon">◈</div>
            <p>Select a mock to preview, or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MockForm({ form, setForm, editing, saving, onSubmit, onCancel }) {
  const f = (field) => ({
    value: form[field],
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
  });

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, marginBottom:20 }}>
        {editing ? 'Edit Mock Endpoint' : 'New Mock Endpoint'}
      </h2>

      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'flex', gap:8 }}>
          <div className="field" style={{ width:110 }}>
            <label>Method</label>
            <MethodSelect value={form.method} onChange={v => setForm(p => ({ ...p, method: v }))} />
          </div>
          <div className="field" style={{ flex:1 }}>
            <label>Endpoint Path</label>
            <input {...f('endpointPath')} placeholder="users/profile" />
          </div>
        </div>

        <div className="field">
          <label>Status Code</label>
          <select value={form.statusCode} onChange={e => setForm(p => ({ ...p, statusCode: e.target.value }))}>
            {STATUS_CODES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Response Body (JSON)</label>
          <textarea
            {...f('responseBody')}
            style={{ minHeight:180, fontFamily:'var(--font-mono)', fontSize:12 }}
            placeholder={'{\n  "key": "value"\n}'}
          />
        </div>

        <div className="field">
          <label>Description (optional)</label>
          <input {...f('description')} placeholder="What does this mock simulate?" />
        </div>

        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={saving}>
            {saving ? <><span className="spinner" />Saving…</> : editing ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MockDetail({ mock, onEdit, onTest }) {
  const baseUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
  const fullUrl = `${baseUrl}/mock/${mock.endpointPath}`;

  return (
    <div style={{ maxWidth:600 }}>
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:20 }}>
        <span className={`method-badge method-${mock.method}`}>{mock.method}</span>
        <span style={{ fontSize:15, fontWeight:600, color:'var(--text)' }}>/{mock.endpointPath}</span>
        <button className="btn btn-success btn-sm" onClick={onTest} style={{ marginLeft:'auto' }}>
          ▶ Test in Tester
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onEdit}>
          Edit
        </button>
      </div>

      {mock.description && (
        <p style={{ color:'var(--text-2)', marginBottom:16, fontSize:12 }}>{mock.description}</p>
      )}

      <div className="panel" style={{ marginBottom:16 }}>
        <div className="panel-header">
          <span className="panel-title">Mock URL</span>
          <span style={{
            fontSize:10, padding:'2px 8px', borderRadius:4,
            background:'var(--bg-4)', color:'var(--text-3)'
          }}>
            Status: {mock.statusCode} · Hits: {mock.hitCount}
          </span>
        </div>
        <div className="panel-body">
          <code style={{
            display:'block', padding:'10px 12px', background:'var(--bg)',
            borderRadius:'var(--radius)', color:'var(--accent)',
            fontSize:12, wordBreak:'break-all'
          }}>
            {fullUrl}
          </code>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><span className="panel-title">Response Body</span></div>
        <div className="panel-body" style={{ padding:0 }}>
          <JsonViewer data={mock.responseBody} maxHeight={300} />
        </div>
      </div>
    </div>
  );
}