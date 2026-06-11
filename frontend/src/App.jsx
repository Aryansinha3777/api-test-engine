import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import ApiTester from './tabs/ApiTester';
import MockAPIs from './tabs/MockAPIs';
import SavedRequests from './tabs/SavedRequests';
import History from './tabs/History';
import Environments from './tabs/Environments';

const TABS = [
  { id: 'tester',       label: '⬡ API Tester' },
  { id: 'mock',         label: '◈ Mock APIs' },
  { id: 'saved',        label: '◎ Collections' },
  { id: 'history',      label: '⟳ History' },
  { id: 'environments', label: '⚙ Environments' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('tester');
  const [loadedRequest, setLoadedRequest] = useState(null);
  const [activeEnv, setActiveEnv] = useState(null);
  
  
  const handleLoadRequest = (req) => {
    setLoadedRequest(req);
    setActiveTab('tester');
  };

  return (
    <ToastProvider>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-logo">
            API<span>TEST</span>
            <span style={{ color:'var(--text-3)', fontWeight:400, fontSize:12, marginLeft:8 }}>
              ENGINE
            </span>
          </div>

          <nav className="header-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ color:'var(--text-3)', fontSize:11 }}>localhost:5000</span>
            <div className="header-dot" title="Backend connected" />
          </div>
        </header>

        {/* Main Content */}
        <main className="main">
          {activeTab === 'tester' && (
            <ApiTester
              loadedRequest={loadedRequest}
              onClearLoaded={() => setLoadedRequest(null)}
              activeEnv={activeEnv}
            />
          )}
          {activeTab === 'mock' && <MockAPIs onLoad={handleLoadRequest} />}
          {activeTab === 'saved' && <SavedRequests onLoad={handleLoadRequest} />}
          {activeTab === 'history' && <History onLoad={handleLoadRequest} />}
          {activeTab === 'environments' && (
            <Environments
              activeEnvId={activeEnv?._id}
              onActivate={(env) => setActiveEnv(env)}
            />
          )}
        </main>
      </div>
    </ToastProvider>
  );
}