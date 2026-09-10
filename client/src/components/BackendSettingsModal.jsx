import React, { useState } from 'react';
import { Server, Check, X, Globe, AlertCircle, RefreshCw } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, DEFAULT_PRODUCTION_API_URL } from '../config.js';

export default function BackendSettingsModal({ isOpen, onClose, onSaved }) {
  const [url, setUrl] = useState(getApiBaseUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiBaseUrl(url);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved();
      onClose();
      // Reload page to re-initialize socket connection
      window.location.reload();
    }, 600);
  };

  const handleReset = () => {
    setUrl(DEFAULT_PRODUCTION_API_URL);
    setApiBaseUrl(DEFAULT_PRODUCTION_API_URL);
    setSavedSuccess(true);
    setTimeout(() => {
      onSaved();
      onClose();
      window.location.reload();
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="glass-panel modal-responsive-card">
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '10px', color: '#0284c7' }}>
              <Server size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Backend Server Settings</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Configure your Render backend endpoint</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="input-label" style={{ fontSize: '12px' }}>
            Render Backend API URL
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input-field"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://rewgenrator.onrender.com"
              style={{ paddingLeft: '38px', fontSize: '14px' }}
            />
            <Globe size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '8px', lineHeight: '1.5' }}>
            Default production endpoint: <b>https://rewgenrator.onrender.com</b>. You can customize it if you host your own backend.
          </p>
        </div>

        {savedSuccess && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#059669',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={16} />
            <span>Saved! Reconnecting to backend...</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
          <button className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 14px' }} onClick={handleReset}>
            <RefreshCw size={14} />
            <span>Reset to Default</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 20px' }} onClick={handleSave}>
              Save & Connect
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
