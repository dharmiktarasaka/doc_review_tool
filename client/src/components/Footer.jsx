import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: 'rgba(8, 12, 20, 0.95)',
      padding: '40px 32px',
      fontSize: '14px',
      color: 'var(--text-muted)'
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
            <Activity size={18} />
          </div>
          <span style={{ fontWeight: '700', color: '#ffffff', fontSize: '17px' }}>DocReview Pro</span>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>• Clinic Reputation Suite</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#06d6a0' }}>
            <ShieldCheck size={16} />
            <span>Anti-Ban Protected</span>
          </span>
          <span>End-to-End Encrypted Session</span>
          <span>100% Client-Side Privacy</span>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
          © {new Date().getFullYear()} DocReview Pro. Designed for healthcare practitioners.
        </div>
      </div>
    </footer>
  );
}
