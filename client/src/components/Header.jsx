import React from 'react';
import { Activity, ShieldCheck, QrCode, LogOut, CheckCircle2, AlertCircle, Server } from 'lucide-react';

export default function Header({ waStatus, onLogout, onScrollToStudio, onOpenServerSettings }) {
  const isConnected = waStatus?.status === 'connected';
  const isWaitingQR = waStatus?.status === 'qrcode';
  const isConnecting = waStatus?.status === 'connecting';

  return (
    <header className="navbar">
      <div className="nav-brand" onClick={onScrollToStudio}>
        <div className="brand-icon">
          <Activity size={24} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">DocReview Pro</span>
            <span className="brand-badge">Clinic Suite</span>
          </div>
        </div>
      </div>

      <ul className="nav-links">
        <li><a className="nav-link" href="#features">Features</a></li>
        <li><a className="nav-link" href="#security">Anti-Ban Protection</a></li>
        <li><a className="nav-link" href="#studio" onClick={onScrollToStudio}>Automation Studio</a></li>
        <li><a className="nav-link" href="#faq">Doctor FAQs</a></li>
      </ul>

      <div className="nav-actions">
        {isConnected ? (
          <div className="status-pill status-connected">
            <span className="status-dot"></span>
            <span>Connected: +{waStatus.user?.phone || 'Online'}</span>
            <button 
              onClick={onLogout} 
              title="Disconnect WhatsApp"
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <LogOut size={15} style={{ marginLeft: 6 }} />
            </button>
          </div>
        ) : isWaitingQR ? (
          <div className="status-pill status-waiting" onClick={onScrollToStudio} style={{ cursor: 'pointer' }}>
            <span className="status-dot"></span>
            <span>Scan QR Code</span>
            <QrCode size={15} />
          </div>
        ) : isConnecting ? (
          <div className="status-pill status-waiting">
            <span className="status-dot"></span>
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="status-pill status-disconnected" onClick={onScrollToStudio} style={{ cursor: 'pointer' }}>
            <span className="status-dot"></span>
            <span>WhatsApp Offline</span>
          </div>
        )}

        <button 
          className="btn btn-secondary" 
          title="Backend Server Settings" 
          style={{ padding: '8px 12px', fontSize: '13px' }}
          onClick={onOpenServerSettings}
        >
          <Server size={15} />
          <span>Server URL</span>
        </button>

        <button className="btn btn-primary" onClick={onScrollToStudio}>
          Open Review Studio
        </button>
      </div>
    </header>
  );
}
