import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Step1WhatsApp from './components/Step1WhatsApp.jsx';
import Step2Templates from './components/Step2Templates.jsx';
import Step3ExcelUpload from './components/Step3ExcelUpload.jsx';
import Step4Dispatcher from './components/Step4Dispatcher.jsx';
import Features from './components/Features.jsx';
import FAQSection from './components/FAQSection.jsx';
import Footer from './components/Footer.jsx';
import BackendSettingsModal from './components/BackendSettingsModal.jsx';
import { getApiBaseUrl } from './config.js';
import { Smartphone, Sparkles, FileSpreadsheet, Send, ShieldCheck, Check } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const studioRef = useRef(null);

  // WhatsApp connection state
  const [waStatus, setWaStatus] = useState({
    status: 'disconnected',
    qrCode: null,
    user: null
  });

  // Templates
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([1, 2, 3]);

  // Clinic details
  const [clinicConfig, setClinicConfig] = useState({
    clinic_name: 'CareWell Multispecialty Clinic',
    doctor_name: 'Dr. Aryan Mehta, MD',
    review_link: 'https://g.page/r/your-google-review-link',
    default_country_code: '91'
  });

  // Excel Contacts
  const [contactsData, setContactsData] = useState(null);

  // Campaign State
  const [campaignState, setCampaignState] = useState({
    isRunning: false,
    isPaused: false,
    stats: {
      total: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      status: 'idle',
      cooldownRemaining: 0
    },
    logs: []
  });

  // Socket.io & Polling initialization
  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    const socket = baseUrl 
      ? io(baseUrl, { 
          transports: ['polling', 'websocket'],
          reconnectionAttempts: 10,
          timeout: 10000
        }) 
      : io({ transports: ['polling', 'websocket'] });

    socket.on('wa_status', (data) => {
      setWaStatus(data);
    });

    socket.on('campaign_update', (data) => {
      setCampaignState((prev) => ({
        ...prev,
        stats: data.stats,
        isRunning: data.isRunning,
        isPaused: data.isPaused
      }));
    });

    socket.on('campaign_log', (entry) => {
      setCampaignState((prev) => ({
        ...prev,
        logs: [entry, ...prev.logs.slice(0, 150)]
      }));
    });

    // Active polling fallback for WhatsApp status every 2.5s (critical for cloud deployments like Render & Vercel)
    const pollInterval = setInterval(() => {
      fetch(`${baseUrl}/api/whatsapp/status`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setWaStatus((prev) => {
              if (prev.status !== data.status || prev.qrCode !== data.qrCode || prev.user?.phone !== data.user?.phone) {
                return {
                  status: data.status,
                  qrCode: data.qrCode,
                  user: data.user
                };
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 2500);

    // Fetch initial templates
    fetch(`${baseUrl}/api/templates`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.templates) {
          setTemplates(data.templates);
        }
      })
      .catch((err) => console.error('Error fetching templates:', err));

    // Fetch initial campaign state
    fetch(`${baseUrl}/api/campaign/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCampaignState((prev) => ({
            ...prev,
            stats: data.stats,
            isRunning: data.isRunning,
            isPaused: data.isPaused,
            logs: data.logs || []
          }));
        }
      })
      .catch(() => {});

    return () => {
      clearInterval(pollInterval);
      socket.disconnect();
    };
  }, []);

  // WhatsApp Handlers
  const handleConnectWA = async () => {
    const baseUrl = getApiBaseUrl();

    // Prompt user if on live Vercel but hasn't entered Render backend URL yet
    if (!baseUrl && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setIsSettingsOpen(true);
      alert('⚠️ Please set your Render Backend Server URL first! Click "Server URL" in the top navigation bar.');
      return;
    }

    try {
      setWaStatus((prev) => ({ ...prev, status: 'connecting' }));
      const res = await fetch(`${baseUrl}/api/whatsapp/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true })
      });
      const data = await res.json();
      if (data.success) {
        setWaStatus(data);
      }
    } catch (err) {
      console.error('Error connecting WhatsApp:', err);
      alert('Could not reach the backend server. Note: On Render free tier, the server sleeps when inactive and takes ~30-45 seconds to wake up. Please wait a moment and click "Retry / Force Fresh QR".');
      setWaStatus((prev) => ({ ...prev, status: 'disconnected' }));
    }
  };

  const handleLogoutWA = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/whatsapp/logout`, { method: 'POST' });
      setWaStatus({ status: 'disconnected', qrCode: null, user: null });
    } catch (err) {
      console.error('Error logging out WhatsApp:', err);
    }
  };

  // Template Handlers
  const handleToggleTemplate = (id) => {
    setSelectedTemplateIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 5) return prev; // max 5
        return [...prev, id];
      }
    });
  };

  const handleUpdateTemplateText = (id, newText) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );
  };

  const handleChangeClinicConfig = (field, value) => {
    setClinicConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Excel Handlers
  const handleContactsUploaded = (data) => {
    setContactsData(data);
  };

  const handleClearContacts = () => {
    setContactsData(null);
  };

  // Campaign Handlers
  const handleStartCampaign = async (payload) => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/campaign/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to start campaign.');
      }
    } catch (err) {
      alert(`Error starting campaign: ${err.message}`);
    }
  };

  const handlePauseCampaign = async () => {
    const baseUrl = getApiBaseUrl();
    await fetch(`${baseUrl}/api/campaign/pause`, { method: 'POST' });
  };

  const handleResumeCampaign = async () => {
    const baseUrl = getApiBaseUrl();
    await fetch(`${baseUrl}/api/campaign/resume`, { method: 'POST' });
  };

  const handleStopCampaign = async () => {
    if (window.confirm('Are you sure you want to stop this campaign?')) {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/campaign/stop`, { method: 'POST' });
    }
  };

  const scrollToStudio = () => {
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectedTemplates = templates.filter((t) => selectedTemplateIds.includes(t.id));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        waStatus={waStatus}
        onLogout={handleLogoutWA}
        onScrollToStudio={scrollToStudio}
        onOpenServerSettings={() => setIsSettingsOpen(true)}
      />

      <BackendSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {}}
      />

      <Hero onStart={scrollToStudio} />

      {/* Main Automation Studio Container */}
      <section ref={studioRef} id="studio" className="wizard-container">
        
        {/* Step Navigation Bar */}
        <div className="steps-bar">
          <button
            className={`step-nav-btn ${currentStep === 1 ? 'active' : ''} ${waStatus?.status === 'connected' ? 'completed' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            <div className="step-number">
              {waStatus?.status === 'connected' ? <Check size={14} /> : '1'}
            </div>
            <Smartphone size={16} />
            <span>1. WhatsApp Connect</span>
          </button>

          <span className="step-arrow">→</span>

          <button
            className={`step-nav-btn ${currentStep === 2 ? 'active' : ''} ${selectedTemplateIds.length > 0 ? 'completed' : ''}`}
            onClick={() => setCurrentStep(2)}
          >
            <div className="step-number">
              {selectedTemplateIds.length > 0 ? <Check size={14} /> : '2'}
            </div>
            <Sparkles size={16} />
            <span>2. Doctor Templates ({selectedTemplateIds.length}/5)</span>
          </button>

          <span className="step-arrow">→</span>

          <button
            className={`step-nav-btn ${currentStep === 3 ? 'active' : ''} ${contactsData ? 'completed' : ''}`}
            onClick={() => setCurrentStep(3)}
          >
            <div className="step-number">
              {contactsData ? <Check size={14} /> : '3'}
            </div>
            <FileSpreadsheet size={16} />
            <span>3. Upload Excel {contactsData ? `(${contactsData.validContacts})` : ''}</span>
          </button>

          <span className="step-arrow">→</span>

          <button
            className={`step-nav-btn ${currentStep === 4 ? 'active' : ''} ${campaignState.isRunning ? 'active' : ''}`}
            onClick={() => setCurrentStep(4)}
          >
            <div className="step-number">4</div>
            <Send size={16} />
            <span>4. Anti-Ban Dispatcher</span>
          </button>
        </div>

        {/* Step 1: WhatsApp Connect */}
        {currentStep === 1 && (
          <div className="step-content">
            <Step1WhatsApp
              waStatus={waStatus}
              onConnect={handleConnectWA}
              onLogout={handleLogoutWA}
              onNext={() => setCurrentStep(2)}
            />
          </div>
        )}

        {/* Step 2: Templates & Clinic Details */}
        {currentStep === 2 && (
          <div className="step-content">
            <Step2Templates
              templates={templates}
              selectedTemplateIds={selectedTemplateIds}
              onToggleTemplate={handleToggleTemplate}
              clinicConfig={clinicConfig}
              onChangeClinicConfig={handleChangeClinicConfig}
              onUpdateTemplateText={handleUpdateTemplateText}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          </div>
        )}

        {/* Step 3: Excel Upload */}
        {currentStep === 3 && (
          <div className="step-content">
            <Step3ExcelUpload
              contactsData={contactsData}
              onContactsUploaded={handleContactsUploaded}
              onClearContacts={handleClearContacts}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          </div>
        )}

        {/* Step 4: Dispatcher & Anti-Ban Control */}
        {currentStep === 4 && (
          <div className="step-content">
            <Step4Dispatcher
              campaignState={campaignState}
              onStartCampaign={handleStartCampaign}
              onPauseCampaign={handlePauseCampaign}
              onResumeCampaign={handleResumeCampaign}
              onStopCampaign={handleStopCampaign}
              contactsData={contactsData}
              selectedTemplates={selectedTemplates}
              clinicConfig={clinicConfig}
              onBack={() => setCurrentStep(3)}
            />
          </div>
        )}

      </section>

      <Features />

      <section id="security" style={{ padding: '40px 32px', maxWidth: '1240px', margin: '0 auto' }}>
        <div className="security-banner" style={{ padding: '36px' }}>
          <div style={{ background: 'rgba(6, 214, 160, 0.2)', padding: '16px', borderRadius: '16px', color: '#06d6a0' }}>
            <ShieldCheck size={40} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
              Why DocReview Pro Guarantees WhatsApp Anti-Ban Safety
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', maxWidth: '900px' }}>
              Meta's anti-spam detection flags accounts based on three triggers: (1) identical message content sent repeatedly, (2) inhuman sending speeds (less than 5 seconds), and (3) missing presence updates. DocReview Pro addresses all three: our engine introduces random jitter delays (15-30s), sends authentic "typing..." presence updates, and randomly shuffles between your chosen 1-5 templates with variable spintax greetings.
            </p>
          </div>
        </div>
      </section>

      <FAQSection />

      <Footer />
    </div>
  );
}
