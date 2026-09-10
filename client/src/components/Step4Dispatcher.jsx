import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Play, 
  Pause, 
  RotateCcw, 
  Square, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sliders, 
  Terminal, 
  Sparkles, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export default function Step4Dispatcher({
  campaignState,
  onStartCampaign,
  onPauseCampaign,
  onResumeCampaign,
  onStopCampaign,
  contactsData,
  selectedTemplates,
  clinicConfig,
  onBack
}) {
  const [settings, setSettings] = useState({
    minDelaySeconds: 15,
    maxDelaySeconds: 30,
    batchSize: 15,
    batchPauseSeconds: 90,
    simulateTyping: true,
    typingSeconds: 3
  });

  const [showSettings, setShowSettings] = useState(false);

  const stats = campaignState?.stats || {
    total: contactsData?.contacts?.length || 0,
    sent: 0,
    failed: 0,
    pending: contactsData?.contacts?.length || 0,
    status: 'idle',
    cooldownRemaining: 0
  };

  const isRunning = campaignState?.isRunning;
  const isPaused = campaignState?.isPaused;
  const logs = campaignState?.logs || [];

  const total = stats.total || contactsData?.contacts?.length || 1;
  const completedCount = (stats.sent || 0) + (stats.failed || 0);
  const progressPercent = Math.min(100, Math.round((completedCount / total) * 100));

  const handleStart = () => {
    onStartCampaign({
      contacts: contactsData.contacts,
      templates: selectedTemplates,
      clinicConfig,
      settings
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '36px 32px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 32px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(58, 134, 255, 0.15)', borderRadius: '50%', marginBottom: '14px', color: '#3a86ff' }}>
          <ShieldCheck size={30} />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>
          Step 4: Launch Anti-Ban Review Campaign
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Review your safety guardrails, monitor live delivery progress, and watch real-time patient interactions in the secure terminal.
        </p>
      </div>

      {/* Anti-Ban Protection Banner */}
      <div className="security-banner">
        <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '12px', color: '#0284c7' }}>
          <ShieldCheck size={28} />
        </div>
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
              WhatsApp Anti-Ban Security Engine Active
            </h4>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '5px 12px', fontSize: '12px' }}
              onClick={() => setShowSettings(!showSettings)}
            >
              <Sliders size={13} />
              <span>{showSettings ? 'Hide Settings' : 'Customize Delays'}</span>
            </button>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            🛡️ <b>Randomized Template Cycling:</b> Each patient receives 1 of {selectedTemplates.length} selected templates with dynamic spintax.<br />
            ⏳ <b>Human Typing Simulation:</b> Active ({settings.typingSeconds}s "typing..." presence before each dispatch).<br />
            🕒 <b>Delay Jitter:</b> Randomized between {settings.minDelaySeconds}s and {settings.maxDelaySeconds}s per message to simulate organic human behavior.
          </p>
        </div>
      </div>

      {/* Optional Customizable Delays Drawer */}
      {showSettings && (
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'left',
          boxShadow: '0 4px 16px rgba(2, 132, 199, 0.06)'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0284c7', marginBottom: '16px' }}>
            Advanced Anti-Ban Parameters
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label className="input-label">Min Delay (seconds)</label>
              <input
                type="number"
                className="input-field"
                value={settings.minDelaySeconds}
                disabled={isRunning}
                onChange={(e) => setSettings({ ...settings, minDelaySeconds: Number(e.target.value) })}
                min={8}
                max={60}
              />
            </div>
            <div>
              <label className="input-label">Max Delay (seconds)</label>
              <input
                type="number"
                className="input-field"
                value={settings.maxDelaySeconds}
                disabled={isRunning}
                onChange={(e) => setSettings({ ...settings, maxDelaySeconds: Number(e.target.value) })}
                min={12}
                max={120}
              />
            </div>
            <div>
              <label className="input-label">Batch Cool-Down (Every N messages)</label>
              <input
                type="number"
                className="input-field"
                value={settings.batchSize}
                disabled={isRunning}
                onChange={(e) => setSettings({ ...settings, batchSize: Number(e.target.value) })}
                min={5}
                max={50}
              />
            </div>
            <div>
              <label className="input-label">Cool-Down Rest Pause (seconds)</label>
              <input
                type="number"
                className="input-field"
                value={settings.batchPauseSeconds}
                disabled={isRunning}
                onChange={(e) => setSettings({ ...settings, batchPauseSeconds: Number(e.target.value) })}
                min={30}
                max={300}
              />
            </div>
          </div>
        </div>
      )}

      {/* Progress & Stat Counters */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Campaign Progress</span>
            {stats.status === 'running' && (
              <span className="status-pill status-connected" style={{ padding: '2px 10px', fontSize: '11px' }}>
                <span className="status-dot"></span>
                <span>Dispatching...</span>
              </span>
            )}
            {stats.status === 'cooling_down' && (
              <span className="status-pill status-waiting" style={{ padding: '2px 10px', fontSize: '11px' }}>
                <span className="status-dot"></span>
                <span>Anti-Ban Cool-Down ({stats.cooldownRemaining}s)</span>
              </span>
            )}
            {stats.status === 'paused' && (
              <span className="status-pill status-waiting" style={{ padding: '2px 10px', fontSize: '11px' }}>
                <span>Paused</span>
              </span>
            )}
            {stats.status === 'completed' && (
              <span className="status-pill status-connected" style={{ padding: '2px 10px', fontSize: '11px' }}>
                <span>Completed</span>
              </span>
            )}
          </div>
          <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#0284c7' }}>
            {progressPercent}%
          </span>
        </div>

        <div className="progress-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-number" style={{ color: 'var(--text-main)' }}>{stats.total || contactsData?.contacts?.length || 0}</div>
          <div className="stat-label">Total Recipients</div>
        </div>
        <div className="stat-box">
          <div className="stat-number" style={{ color: '#4ade80' }}>{stats.sent}</div>
          <div className="stat-label">Delivered Successfully</div>
        </div>
        <div className="stat-box">
          <div className="stat-number" style={{ color: '#f87171' }}>{stats.failed}</div>
          <div className="stat-label">Failed / Invalid</div>
        </div>
        <div className="stat-box">
          <div className="stat-number" style={{ color: '#fbbf24' }}>
            {stats.status === 'completed' ? 0 : Math.max(0, (stats.total || contactsData?.contacts?.length || 0) - (stats.sent + stats.failed))}
          </div>
          <div className="stat-label">Pending In Queue</div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {!isRunning ? (
          <button 
            className="btn btn-primary" 
            onClick={handleStart} 
            disabled={!contactsData?.contacts?.length || selectedTemplates.length === 0}
            style={{ padding: '14px 36px', fontSize: '16px' }}
          >
            <Play size={18} />
            <span>{stats.status === 'completed' ? 'Restart Anti-Ban Campaign' : 'Start WhatsApp Campaign'}</span>
          </button>
        ) : (
          <>
            {isPaused ? (
              <button className="btn btn-primary" onClick={onResumeCampaign} style={{ padding: '12px 28px' }}>
                <Play size={16} />
                <span>Resume Dispatching</span>
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={onPauseCampaign} style={{ padding: '12px 28px' }}>
                <Pause size={16} />
                <span>Pause Delivery</span>
              </button>
            )}

            <button className="btn btn-danger" onClick={onStopCampaign} style={{ padding: '12px 28px' }}>
              <Square size={16} />
              <span>Stop Campaign</span>
            </button>
          </>
        )}
      </div>

      {/* Live Terminal Log */}
      <div className="terminal-window">
        <div className="terminal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="terminal-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Real-Time Anti-Ban Dispatch Console
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-faint)' }}>
            <Terminal size={14} />
            <span>live stream</span>
          </div>
        </div>

        <div className="terminal-body">
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-faint)', margin: 'auto', textAlign: 'center' }}>
              <Clock size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <div>Ready for launch. Click "Start WhatsApp Campaign" to initiate sending.</div>
            </div>
          ) : (
            logs.map((item) => (
              <div key={item.id} className="log-row">
                <span className="log-time">[{item.timestamp}]</span>
                <span className={`log-type-${item.type}`}>
                  {item.type === 'security' && '🛡️ [SECURITY] '}
                  {item.type === 'success' && '✓ [DELIVERED] '}
                  {item.type === 'error' && '✕ [ERROR] '}
                  {item.type === 'warning' && '⚠ [PAUSED] '}
                  {item.type === 'info' && 'ℹ [PROGRESS] '}
                  {item.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
        <button className="btn btn-secondary" onClick={onBack} disabled={isRunning}>
          <ArrowLeft size={16} />
          <span>Back to Excel Contacts</span>
        </button>

        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {selectedTemplates.length} templates active • {contactsData?.contacts?.length || 0} contacts queued
        </div>
      </div>

    </div>
  );
}
