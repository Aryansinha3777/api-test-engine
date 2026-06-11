import React, { useState } from 'react';
import { sendRequest, createSavedRequest } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import MethodSelect from '../components/MethodSelect.jsx';
import KeyValueEditor from '../components/KeyValueEditor.jsx';
import JsonViewer from '../components/JsonViewer.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const TABS = ['Body', 'Headers', 'Response'];

function kvToObj(pairs) {
  return pairs.reduce((acc, { key, value }) => {
    const trimmedKey = key.trim();
    const trimmedValue = value.trim();
    if (trimmedKey) acc[trimmedKey] = trimmedValue;
    return acc;
  }, {});
}

export default function ApiTester({ onLoadRequest, loadedRequest, onClearLoaded, activeEnv }) {
  const toast = useToast();

  const [url, setUrl]         = useState('');
  const [method, setMethod]   = useState('GET');
  const [headers, setHeaders] = useState([]);
  const [body, setBody]       = useState('');
  const [activeTab, setActiveTab] = useState('Body');

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const [saveModal, setSaveModal] = useState(false);
  const [saveName, setSaveName]   = useState('');

  
  React.useEffect(() => {
    if (loadedRequest) {
      setUrl(loadedRequest.url || '');
      setMethod(loadedRequest.method || 'GET');
      const h = loadedRequest.headers
        ? Object.entries(loadedRequest.headers instanceof Map
            ? Object.fromEntries(loadedRequest.headers)
            : loadedRequest.headers)
            .map(([key, value]) => ({ key, value }))
        : [];
      setHeaders(h);
      setBody(
        loadedRequest.body
          ? typeof loadedRequest.body === 'string'
            ? loadedRequest.body
            : JSON.stringify(loadedRequest.body, null, 2)
          : ''
      );
      setResponse(null);
      setActiveTab('Body');
      onClearLoaded();
      toast('Request loaded', 'info');
    }
  }, [loadedRequest]); 

  const handleSend = async () => {
    if (!url.trim()) { toast('Enter a URL first', 'error'); return; }

    setLoading(true);
    setResponse(null);
    setActiveTab('Response');

    try {
      let parsedBody;
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        try { parsedBody = JSON.parse(body); }
        catch { parsedBody = body; }
      }

      const { data } = await sendRequest({
        url: url.trim(),
        method,
        headers: kvToObj(headers),
        body: parsedBody,
        environment: activeEnv || null,
      });
      setResponse(data);
    } catch (err) {
      toast('Failed to send request — is the backend running?', 'error');
      setResponse({ error: true, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!saveName.trim()) { toast('Enter a name', 'error'); return; }
    try {
      let parsedBody;
      if (body.trim()) {
        try { parsedBody = JSON.parse(body); } catch { parsedBody = body; }
      }
      await createSavedRequest({
        name: saveName.trim(),
        url: url.trim(),
        method,
        headers: kvToObj(headers),
        body: parsedBody,
      });
      setSaveModal(false);
      setSaveName('');
      toast('Request saved!', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Save failed', 'error');
    }
  };

  const showBody = ['POST', 'PUT', 'PATCH'].includes(method);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* URL Bar */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 16px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
        background: 'var(--bg-2)'
      }}>
        <MethodSelect value={method} onChange={setMethod} />
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint or {{baseUrl}}/endpoint"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{ flex: 1 }}
        />
        {activeEnv && (
          <span style={{
            alignSelf: 'center', fontSize: 10, padding: '3px 8px',
            borderRadius: 4, background: 'var(--green)', color: '#fff',
            fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {activeEnv.name}
          </span>
        )}
        <button className="btn btn-primary" onClick={handleSend} disabled={loading}>
          {loading ? <><span className="spinner" />Sending</> : '▶ Send'}
        </button>
        <button className="btn btn-ghost" onClick={() => setSaveModal(true)} title="Save request">
          Save
        </button>
      </div>

      {/* Inner Tabs */}
      <div style={{
        display: 'flex', gap: 2, padding: '8px 16px 0',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
        background: 'var(--bg-2)'
      }}>
        {TABS.filter(t => t !== 'Body' || showBody).map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}>
            {t}
            {t === 'Response' && response && (
              <span style={{ marginLeft: 6 }}>
                <StatusBadge code={response.statusCode} />
              </span>
            )}
          </button>
        ))}
        {!showBody && activeTab === 'Body' && setActiveTab('Headers')}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16, background: 'var(--bg)' }}>
        {activeTab === 'Headers' && (
          <div>
            <label>Request Headers</label>
            <KeyValueEditor pairs={headers} onChange={setHeaders} />
          </div>
        )}

        {activeTab === 'Body' && showBody && (
          <div>
            <label>Request Body (JSON)</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder={'{\n  "key": "value"\n}'}
              style={{ minHeight: 200, fontFamily: 'var(--font-mono)' }}
            />
          </div>
        )}

        {activeTab === 'Response' && (
          <ResponsePanel response={response} loading={loading} />
        )}
      </div>

      {/* Save Modal */}
      {saveModal && (
        <Modal title="Save Request" onClose={() => setSaveModal(false)}>
          <div className="field">
            <label>Collection Name</label>
            <input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="e.g. Get User by ID"
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 }}>
            <button className="btn btn-ghost" onClick={() => setSaveModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ResponsePanel({ response, loading }) {
  const [view, setView] = useState('body'); // body | headers

  if (loading) {
    return (
      <div className="empty-state">
        <span className="spinner" style={{ width: 24, height: 24 }} />
        <p>Sending request...</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">◎</div>
        <p>Hit Send to see the response</p>
      </div>
    );
  }

  if (response.error && !response.statusCode) {
    return (
      <div>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <span className="status-badge status-err">Error</span>
          <span className="text-muted text-xs" style={{ alignSelf:'center' }}>
            {response.errorCode || 'Network Error'}
          </span>
        </div>
        <JsonViewer data={response} />
      </div>
    );
  }

  const headers = response.headers || {};
  const size = response.size
    ? response.size < 1024
      ? `${response.size} B`
      : `${(response.size / 1024).toFixed(1)} KB`
    : null;

  return (
    <div>
      {/* Meta bar */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12, flexWrap:'wrap' }}>
        <StatusBadge code={response.statusCode} responseTime={response.responseTime} />
        {size && <span className="text-xs text-muted">{size}</span>}
        <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
          {['body','headers'].map(v => (
            <button key={v} className={`tab-btn btn-sm ${view===v?'active':''}`}
              onClick={() => setView(v)} style={{ padding:'3px 10px', fontSize:11 }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'body' && <JsonViewer data={response.data} maxHeight={500} />}

      {view === 'headers' && (
        <div className="json-viewer" style={{ maxHeight: 500 }}>
          {Object.entries(headers).map(([k, v]) => (
            <div key={k} style={{ marginBottom:4 }}>
              <span className="json-key">{k}</span>
              <span style={{ color:'var(--text-3)' }}>: </span>
              <span className="json-str">"{v}"</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
    }}>
      <div className="panel" style={{ width:400, boxShadow:'var(--shadow)' }}>
        <div className="panel-header">
          <span className="panel-title">{title}</span>
          <button className="kv-delete" onClick={onClose} style={{ fontSize:20 }}>×</button>
        </div>
        <div className="panel-body">{children}</div>
      </div>
    </div>
  );
}