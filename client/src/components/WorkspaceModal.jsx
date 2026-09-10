import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  KeyRound, 
  PlusCircle, 
  ArrowRight, 
  X, 
  Smartphone, 
  Monitor, 
  Lock 
} from 'lucide-react';
import { getWorkspaceId, setWorkspaceId, resetToNewWorkspace } from '../services/sessionService.js';

export default function WorkspaceModal({ isOpen, onClose, onWorkspaceChanged }) {
  const [currentId, setCurrentId] = useState(() => getWorkspaceId());
  const [inputWorkspaceId, setInputWorkspaceId] = useState('');
  const [copied, setCopied] = useState(false);
  const [switchError, setSwitchError] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitch = (e) => {
    e?.preventDefault();
    const target = inputWorkspaceId.trim();
    if (!target) {
      setSwitchError('Please enter a valid Workspace ID');
      return;
    }
    if (target.length < 3) {
      setSwitchError('Workspace ID is too short');
      return;
    }

    const clean = setWorkspaceId(target);
    setCurrentId(clean);
    setInputWorkspaceId('');
    setSwitchError('');
    onWorkspaceChanged?.(clean);
    onClose?.();
  };

  const handleCreateNew = () => {
    if (window.confirm('Create a brand new private workspace? Your current workspace can always be re-accessed later using its ID.')) {
      const newId = resetToNewWorkspace();
      setCurrentId(newId);
      setInputWorkspaceId('');
      setSwitchError('');
      onWorkspaceChanged?.(newId);
      onClose?.();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div 
        className="glass-panel modal-responsive-card" 
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#0f172a' }}>
              Private Workspace & Security
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
              Isolated WhatsApp session & multi-device synchronization
            </p>
          </div>
        </div>

        {/* Current Active Workspace Box */}
        <div style={{
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              Your Active Workspace ID
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#059669'
            }}>
              <Lock size={10} /> 100% Private
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              flex: 1,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '10px 14px',
              fontFamily: 'monospace',
              fontSize: '15px',
              fontWeight: '600',
              color: '#0f172a',
              letterSpacing: '0.04em'
            }}>
              {currentId}
            </div>
            <button
              onClick={handleCopy}
              className="btn"
              style={{
                background: copied ? '#10b981' : '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>

          {/* Sync explanation */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid #e2e8f0',
            fontSize: '12.5px',
            color: '#475569',
            lineHeight: '1.45'
          }}>
            <div style={{ display: 'flex', gap: '4px', marginTop: '2px', color: '#0284c7' }}>
              <Monitor size={14} />
              <Smartphone size={14} />
            </div>
            <div>
              <strong>Multi-device sync:</strong> Use this ID on your laptop or phone to access the exact same WhatsApp connection and review campaigns. Other users on different IDs can never see your data.
            </div>
          </div>
        </div>

        {/* Switch / Login Section */}
        <form onSubmit={handleSwitch} style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            Switch to Another Workspace
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text"
                value={inputWorkspaceId}
                onChange={(e) => setInputWorkspaceId(e.target.value)}
                placeholder="Enter Workspace ID (e.g. doc_abc123)"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '10px',
                  border: switchError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Switch</span>
              <ArrowRight size={14} />
            </button>
          </div>
          {switchError && (
            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>
              {switchError}
            </div>
          )}
        </form>

        {/* Create New Workspace */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Need a fresh private session?</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Create a new separate workspace with 1 click.</div>
          </div>
          <button
            type="button"
            onClick={handleCreateNew}
            className="btn"
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={15} />
            <span>New Workspace</span>
          </button>
        </div>

      </div>
    </div>
  );
}
