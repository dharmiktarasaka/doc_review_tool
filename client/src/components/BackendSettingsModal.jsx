import React, { useState } from 'react';
import { Server, Check, X, Globe, AlertCircle, RefreshCw } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl } from '../config.js';

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
    setUrl('');
    setApiBaseUrl('');
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
      <div className="glass-panel" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '28px',
        background: '#0e1726',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(0, 180, 216, 0.2)', padding: '8px', borderRadius: '10px', color: '#00b4d8' }}>
              <Server size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: 0 }}>Backend Server Settings</h3>
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
              placeholder="e.g. https://docreview-backend.onrender.com"
              style={{ paddingLeft: '38px', fontSize: '14px' }}
            />
            <Globe size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '8px', lineHeight: '1.5' }}>
            When deployed on <b>GitHub Pages</b>, paste your live Render Web Service URL here (or leave blank if running both locally).
          </p>
        </div>

        {savedSuccess && (
          <div style={{
            background: 'rgba(6, 214, 160, 0.15)',
            border: '1px solid rgba(6, 214, 160, 0.3)',
            color: '#06d6a0',
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
            <span>Reset (Localhost)</span>
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
