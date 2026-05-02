import React, { useState, useEffect, useCallback } from 'react';
import { getSavedRequests, deleteSavedRequest } from '../services/api';
import { useToast } from '../context/ToastContext';
import JsonViewer from '../components/JsonViewer';

export default function SavedRequests({ onLoad }) {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await getSavedRequests();
      setRequests(data.data || []);
    } catch {
      toast('Failed to load saved requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this saved request?')) return;
    try {
      await deleteSavedRequest(id);
      toast('Deleted', 'success');
      if (selected?._id === id) setSelected(null);
      load();
    } catch {
      toast('Delete failed', 'error');
    }
  };

  const handleLoad = (req) => {
    onLoad(req);
    toast('Loaded into API Tester', 'info');
  };

  const METHOD_COLORS = {
    GET: 'var(--green)', POST: 'var(--accent)',
    PUT: 'var(--yellow)', DELETE: 'var(--red)', PATCH: 'var(--orange)',
  };

  const filtered = requests.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.url.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  };

  if (loading) return (
    <div className="empty-state" style={{ marginTop:60 }}>
      <span className="spinner" style={{ width:24, height:24 }} />
      <p>Loading...</p>
    </div>
  );

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width:340, flexShrink:0,
        borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        <div style={{
          padding:'12px 16px', borderBottom:'1px solid var(--border)',
          background:'var(--bg-2)', flexShrink:0
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13 }}>
              Saved Requests
              <span style={{ color:'var(--text-3)', fontWeight:400, marginLeft:8 }}>
                ({requests.length})
              </span>
            </span>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            style={{ fontSize:12 }}
          />
        </div>

        <div style={{ flex:1, overflow:'auto' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">◎</div>
              <p>{search ? 'No matches found' : 'No saved requests yet'}</p>
              {!search && <p style={{ fontSize:11 }}>Use the API Tester's Save button</p>}
            </div>
          ) : filtered.map(req => (
            <div
              key={req._id}
              onClick={() => setSelected(req)}
              style={{
                padding:'10px 16px',
                borderBottom:'1px solid var(--border)',
                cursor:'pointer',
                background: selected?._id === req._id ? 'var(--bg-3)' : 'transparent',
                transition:'background 0.1s',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span className={`method-badge method-${req.method}`}>{req.method}</span>
                <span style={{ fontWeight:600, fontSize:12, flex:1, color:'var(--text)' }} className="truncate">
                  {req.name}
                </span>
              </div>
              <div className="truncate" style={{ color:'var(--text-3)', fontSize:11, marginBottom:6 }}>
                {req.url}
              </div>
              <div style={{ display:'flex', gap:4 }}>
                <button className="btn btn-success btn-sm"
                  onClick={e => { e.stopPropagation(); handleLoad(req); }}>
                  ↗ Load
                </button>
                <button className="btn btn-danger btn-sm" onClick={e => handleDelete(req._id, e)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex:1, overflow:'auto', padding:20 }}>
        {selected ? (
          <div style={{ maxWidth:600 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <span className={`method-badge method-${selected.method}`}>{selected.method}</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700 }}>
                {selected.name}
              </span>
              <button className="btn btn-success btn-sm" style={{ marginLeft:'auto' }}
                onClick={() => handleLoad(selected)}>
                ↗ Load into Tester
              </button>
            </div>

            <div className="panel" style={{ marginBottom:12 }}>
              <div className="panel-header"><span className="panel-title">URL</span></div>
              <div className="panel-body">
                <code style={{
                  display:'block', padding:'8px 12px', background:'var(--bg)',
                  borderRadius:'var(--radius)', color:'var(--accent)', fontSize:12,
                  wordBreak:'break-all'
                }}>
                  {selected.url}
                </code>
              </div>
            </div>

            {selected.headers && Object.keys(selected.headers).length > 0 && (
              <div className="panel" style={{ marginBottom:12 }}>
                <div className="panel-header"><span className="panel-title">Headers</span></div>
                <div className="panel-body" style={{ padding:0 }}>
                  <JsonViewer data={selected.headers} maxHeight={200} />
                </div>
              </div>
            )}

            {selected.body && (
              <div className="panel" style={{ marginBottom:12 }}>
                <div className="panel-header"><span className="panel-title">Body</span></div>
                <div className="panel-body" style={{ padding:0 }}>
                  <JsonViewer data={selected.body} maxHeight={200} />
                </div>
              </div>
            )}

            <div style={{ color:'var(--text-3)', fontSize:11, marginTop:12 }}>
              Saved {formatDate(selected.createdAt)}
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop:60 }}>
            <div className="empty-state-icon">◎</div>
            <p>Select a request to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}