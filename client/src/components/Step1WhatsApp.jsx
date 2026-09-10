import React from 'react';
import { QrCode, Smartphone, CheckCircle, RefreshCw, AlertCircle, LogOut, ArrowRight, Shield } from 'lucide-react';

export default function Step1WhatsApp({ waStatus, onConnect, onLogout, onNext }) {
  const isConnected = waStatus?.status === 'connected';
  const isWaitingQR = waStatus?.status === 'qrcode';
  const isConnecting = waStatus?.status === 'connecting';

  return (
    <div className="glass-panel" style={{ padding: '36px 32px' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'center' }}>
        
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(37, 211, 102, 0.15)', borderRadius: '50%', marginBottom: '16px', color: '#25d366' }}>
          <Smartphone size={32} />
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '10px' }}>
          Step 1: Connect Clinic WhatsApp
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>
          Pair your clinic's WhatsApp using official WhatsApp Web Multi-Device protocol. Your session is securely maintained locally.
        </p>

        {isConnected ? (
          <div style={{
            background: 'rgba(37, 211, 102, 0.08)',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
              <CheckCircle size={28} color="#25d366" />
              <h3 style={{ fontSize: '20px', color: 'var(--text-main)', margin: 0 }}>WhatsApp Linked Successfully!</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Your device is paired and authorized to dispatch review invitations.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '12px 24px',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Connected Number</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
                  +{waStatus.user?.phone || 'Verified Device'}
                </div>
              </div>
              <div style={{ height: '30px', width: '1px', background: '#e2e8f0' }}></div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Session State</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Active & Ready</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button className="btn btn-secondary" onClick={onLogout}>
                <LogOut size={16} />
                <span>Disconnect Device</span>
              </button>
              <button className="btn btn-primary" onClick={onNext} style={{ padding: '12px 28px' }}>
                <span>Continue to Step 2: Choose Templates</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {waStatus?.qrCode ? (
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '30px',
                display: 'inline-block',
                marginBottom: '28px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  background: '#ffffff',
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'inline-block',
                  boxShadow: '0 0 30px rgba(2, 132, 199, 0.12)'
                }}>
                  <img 
                    src={waStatus.qrCode} 
                    alt="Scan WhatsApp QR Code" 
                    style={{ width: '240px', height: '240px', display: 'block' }}
                  />
                </div>

                <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '320px', margin: '20px auto 0' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
                    How to link:
                  </div>
                  <ol style={{ fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '20px', lineHeight: '1.7' }}>
                    <li>Open WhatsApp on your phone</li>
                    <li>Tap <b>Menu</b> (⋮) or <b>Settings</b></li>
                    <li>Select <b>Linked Devices</b> &gt; <b>Link a Device</b></li>
                    <li>Point your phone at this QR code</li>
                  </ol>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button className="btn btn-secondary" onClick={onConnect}>
                    <RefreshCw size={15} />
                    <span>Regenerate QR</span>
                  </button>
                </div>
              </div>
            ) : isConnecting ? (
              <div style={{ padding: '40px 20px', marginBottom: '20px' }}>
                <div className="status-dot" style={{ width: '20px', height: '20px', margin: '0 auto 16px', background: '#0284c7' }}></div>
                <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>Generating WhatsApp QR Pairing Code...</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 16px', lineHeight: '1.6' }}>
                  Connecting to WhatsApp servers... If this takes longer than 15s on Render's free tier, click Retry below.
                </p>
                <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={onConnect}>
                  <RefreshCw size={14} />
                  <span>Retry / Force Fresh QR</span>
                </button>
              </div>
            ) : (
              <div style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '18px',
                padding: '36px',
                marginBottom: '28px',
                boxShadow: '0 4px 20px rgba(2, 132, 199, 0.05)'
              }}>
                <div style={{ marginBottom: '24px' }}>
                  <QrCode size={64} style={{ color: '#0284c7', opacity: 0.9 }} />
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Ready to Pair WhatsApp</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '460px', margin: '0 auto 24px' }}>
                  Click the button below to generate a real-time QR code and pair your clinic's WhatsApp account in seconds.
                </p>

                <button className="btn btn-whatsapp" onClick={onConnect} style={{ padding: '14px 32px', fontSize: '16px' }}>
                  <QrCode size={18} />
                  <span>Generate WhatsApp QR Code</span>
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-faint)', fontSize: '13px' }}>
              <Shield size={16} color="#06d6a0" />
              <span>Multi-device end-to-end encrypted session. No personal data stored remotely.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
