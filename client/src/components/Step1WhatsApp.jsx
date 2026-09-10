import React from 'react';
import { QrCode, Smartphone, CheckCircle, RefreshCw, AlertCircle, LogOut, ArrowRight, Shield } from 'lucide-react';

export default function Step1WhatsApp({ waStatus, onConnect, onLogout, onNext }) {
  const isConnected = waStatus?.status === 'connected';
  const isWaitingQR = waStatus?.status === 'qrcode';
  const isConnecting = waStatus?.status === 'connecting';

  return (
    <div className="glass-panel step-panel">
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
            padding: '24px 16px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
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
              padding: '12px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center'
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

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={onLogout}>
                <LogOut size={16} />
                <span>Disconnect Device</span>
              </button>
              <button className="btn btn-primary" onClick={onNext} style={{ padding: '12px 24px' }}>
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
                padding: '24px 16px',
                display: 'inline-block',
                marginBottom: '28px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'inline-block',
                  boxShadow: '0 0 30px rgba(2, 132, 199, 0.12)',
                  maxWidth: '100%'
                }}>
                  <img 
                    src={waStatus.qrCode} 
                    alt="Scan WhatsApp QR Code" 
                    style={{ width: '220px', maxWidth: '100%', height: 'auto', aspectRatio: '1/1', display: 'block' }}
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

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary" onClick={onConnect}>
                    <RefreshCw size={15} />
                    <span>Regenerate QR</span>
                  </button>
                </div>
              </div>
            ) : isConnecting ? (
              <div style={{ padding: '36px 16px', marginBottom: '20px' }}>
                <div style={{
                  width: '48px', height: '48px', margin: '0 auto 20px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#0284c7',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>Connecting to WhatsApp Servers...</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 8px', lineHeight: '1.6' }}>
                  Generating your QR pairing code. This may take <b>30-60 seconds</b> on Render's free tier as the server wakes up.
                </p>
                <p style={{ color: '#0284c7', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>
                  ⏳ Please wait — do not close this page
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
                padding: '30px 18px',
                marginBottom: '28px',
                boxShadow: '0 4px 20px rgba(2, 132, 199, 0.05)',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <QrCode size={56} style={{ color: '#0284c7', opacity: 0.9 }} />
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Ready to Pair WhatsApp</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '460px', margin: '0 auto 24px' }}>
                  Click the button below to generate a real-time QR code and pair your clinic's WhatsApp account in seconds.
                </p>

                <button className="btn btn-whatsapp" onClick={onConnect} style={{ padding: '12px 28px', fontSize: '15px', maxWidth: '100%' }}>
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
