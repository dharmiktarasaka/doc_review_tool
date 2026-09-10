import React from 'react';
import logoImg from '../assets/logo.png';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: '#ffffff',
      padding: '40px 32px',
      fontSize: '14px',
      color: 'var(--text-muted)'
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
            <img src={logoImg} alt="RevU GEN Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '17px', letterSpacing: '-0.3px' }}>
            RevU <span style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '900' }}>GEN</span>
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>• Clinic Reputation Suite</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669' }}>
            <ShieldCheck size={16} />
            <span>Anti-Ban Protected</span>
          </span>
          <span>End-to-End Encrypted Session</span>
          <span>100% Client-Side Privacy</span>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
          © {new Date().getFullYear()} RevU GEN. Designed for healthcare practitioners.
        </div>
      </div>
    </footer>
  );
}
