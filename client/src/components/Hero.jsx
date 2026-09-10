import React from 'react';
import { ShieldCheck, Sparkles, MessageSquareShare, FileSpreadsheet, Star, ArrowRight } from 'lucide-react';

export default function Hero({ onStart }) {
  return (
    <section className="hero">
      <div className="hero-tag">
        <Sparkles size={16} />
        <span>Automated Clinic Reputation & Patient Feedback Suite</span>
      </div>

      <h1 className="hero-title">
        Turn Happy Patients Into <br />
        <span className="hero-gradient-text">5-Star Google Reviews</span> on Autopilot
      </h1>

      <p className="hero-subtitle">
        Connect your clinic's WhatsApp, pick doctor-tailored SEO templates, upload your patient Excel sheet, and let our intelligent Anti-Ban engine securely deliver personalized review requests.
      </p>

      <div className="hero-action-group">
        <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }} onClick={onStart}>
          <span>Launch 4-Step Review Generator</span>
          <ArrowRight size={18} />
        </button>
        <a href="#security" className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '15px' }}>
          <ShieldCheck size={18} style={{ color: '#06d6a0' }} />
          <span>How Anti-Ban Works</span>
        </a>
      </div>

      <div className="hero-highlights">
        <div className="highlight-item">
          <ShieldCheck size={18} className="highlight-icon" />
          <span>Smart Anti-Ban Jitter & Human Typing</span>
        </div>
        <div className="highlight-item">
          <Star size={18} className="highlight-icon" />
          <span>5 SEO-Optimized Clinic Templates</span>
        </div>
        <div className="highlight-item">
          <FileSpreadsheet size={18} className="highlight-icon" />
          <span>Instant Excel & CSV Auto-Detection</span>
        </div>
        <div className="highlight-item">
          <MessageSquareShare size={18} className="highlight-icon" />
          <span>Native Multi-Device QR Pairing</span>
        </div>
      </div>
    </section>
  );
}
