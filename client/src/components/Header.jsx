import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo.png';
import { 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  HelpCircle, 
  Server, 
  ArrowRight, 
  QrCode, 
  LogOut, 
  Menu, 
  X, 
  Radio
} from 'lucide-react';

export default function Header({ waStatus, onLogout, onScrollToStudio, onOpenServerSettings }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isConnected = waStatus?.status === 'connected';
  const isWaitingQR = waStatus?.status === 'qrcode';
  const isConnecting = waStatus?.status === 'connecting';

  const handleNavClick = (e, callback) => {
    setMobileMenuOpen(false);
    if (callback) {
      e.preventDefault();
      callback();
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand Logo & Clinic Suite Badge */}
        <div className="nav-brand" onClick={onScrollToStudio} title="DocReview Pro - Automation Studio">
          <div className="brand-icon-wrapper">
            <div className="brand-icon" style={{ padding: '2px', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.12)' }}>
              <img 
                src={logoImg} 
                alt="DocReview Pro Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }} 
              />
            </div>
            <div className="brand-glow-fx"></div>
          </div>

          <div className="brand-meta">
            <div className="brand-title-row">
              <span className="brand-title">
                DocReview<span className="brand-title-accent">Pro</span>
              </span>
              <span className="brand-badge">
                <span className="badge-pulse-dot"></span>
                CLINIC SUITE
              </span>
            </div>
            <span className="brand-tagline">Automated Patient Feedback & Reputation</span>
          </div>
        </div>

        {/* Center Pill Navigation */}
        <nav className="nav-center">
          <ul className="nav-pill-group">
            <li>
              <a 
                className="nav-pill-item" 
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sparkles size={14} className="nav-item-icon" />
                <span>Features</span>
              </a>
            </li>
            <li>
              <a 
                className="nav-pill-item" 
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldCheck size={14} className="nav-item-icon" />
                <span>Anti-Ban Safety</span>
              </a>
            </li>
            <li>
              <a 
                className="nav-pill-item" 
                href="#studio" 
                onClick={(e) => handleNavClick(e, onScrollToStudio)}
              >
                <Layers size={14} className="nav-item-icon" />
                <span>Review Studio</span>
              </a>
            </li>
            <li>
              <a 
                className="nav-pill-item" 
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HelpCircle size={14} className="nav-item-icon" />
                <span>Doctor FAQs</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Right Actions: Status + Server Settings + CTA */}
        <div className="nav-actions">
          {/* WhatsApp Status Indicator */}
          {isConnected ? (
            <div className="status-pill status-connected" title="WhatsApp connected and ready">
              <span className="status-ping-container">
                <span className="status-ping-ring"></span>
                <span className="status-dot"></span>
              </span>
              <span className="status-text">
                +{waStatus.user?.phone ? waStatus.user.phone.slice(-10) : 'Connected'}
              </span>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onLogout(); 
                }} 
                title="Disconnect WhatsApp"
                className="btn-status-disconnect"
                aria-label="Disconnect WhatsApp"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : isWaitingQR ? (
            <div 
              className="status-pill status-waiting" 
              onClick={onScrollToStudio} 
              title="Click to scan QR code and authenticate WhatsApp"
            >
              <span className="status-ping-container">
                <span className="status-dot"></span>
              </span>
              <span className="status-text">Scan QR</span>
              <QrCode size={13} />
            </div>
          ) : isConnecting ? (
            <div className="status-pill status-connecting" title="Connecting to WhatsApp socket...">
              <span className="status-dot"></span>
              <span className="status-text">Connecting...</span>
            </div>
          ) : (
            <div 
              className="status-pill status-disconnected" 
              onClick={onScrollToStudio} 
              title="WhatsApp is offline. Click to connect in Review Studio."
            >
              <span className="status-dot"></span>
              <span className="status-text">WA Offline</span>
            </div>
          )}

          {/* Backend Server Settings Button */}
          <button 
            className="nav-btn-glass" 
            title="Configure Backend API Server URL" 
            onClick={onOpenServerSettings}
          >
            <Server size={14} />
            <span className="nav-btn-label">Server</span>
          </button>

          {/* High-Impact CTA Button */}
          <button className="nav-btn-cta" onClick={onScrollToStudio} title="Jump to Campaign Dispatcher">
            <span>Open Studio</span>
            <ArrowRight size={14} className="cta-arrow" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-links">
            <a 
              href="#features" 
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles size={16} />
              <span>Key Features</span>
            </a>
            <a 
              href="#security" 
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShieldCheck size={16} />
              <span>Anti-Ban Protection & Cooldown</span>
            </a>
            <a 
              href="#studio" 
              className="mobile-nav-item"
              onClick={(e) => handleNavClick(e, onScrollToStudio)}
            >
              <Layers size={16} />
              <span>Automation Review Studio</span>
            </a>
            <a 
              href="#faq" 
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle size={16} />
              <span>Doctor FAQs</span>
            </a>
          </div>

          <div className="mobile-nav-footer">
            <button 
              className="btn btn-secondary w-full"
              style={{ justifyContent: 'center', width: '100%' }}
              onClick={() => { setMobileMenuOpen(false); onOpenServerSettings(); }}
            >
              <Server size={15} />
              <span>Configure Server URL</span>
            </button>
            <button 
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', width: '100%', marginTop: '8px' }}
              onClick={(e) => handleNavClick(e, onScrollToStudio)}
            >
              <span>Launch Studio</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
