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
import WorkspaceModal from './components/WorkspaceModal.jsx';
import PatientReviewPortal from './components/PatientReviewPortal.jsx';
import { getApiBaseUrl } from './config.js';
import { getWorkspaceId, fetchWithSession } from './services/sessionService.js';
import { DEFAULT_GOOGLE_REVIEWS } from './data/defaultReviews.js';
import { Smartphone, Sparkles, FileSpreadsheet, Send, ShieldCheck, Check } from 'lucide-react';

export default function App() {
  // Check if patient opened a smart review link (e.g. ?review=1)
  const isPatientReviewUrl = typeof window !== 'undefined' && 
    (new URLSearchParams(window.location.search).get('review') === '1' || 
     new URLSearchParams(window.location.search).get('r') === '1');

  if (isPatientReviewUrl) {
    return <PatientReviewPortal />;
  }

  const [currentStep, setCurrentStep] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [workspaceId, setWorkspaceIdState] = useState(() => getWorkspaceId());

  const studioRef = useRef(null);
  const connectingStartedAtRef = useRef(0);

  // WhatsApp connection state (strictly scoped to active workspace)
  const [waStatus, setWaStatus] = useState({
    status: 'disconnected',
    qrCode: null,
    user: null
  });

  // WhatsApp Message Templates (Rotation)
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([1, 2, 3]);

  // 10 Pre-Crafted Google Reviews (saved per workspace)
  const [googleReviews, setGoogleReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(`docreview_reviews_${getWorkspaceId()}`);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_GOOGLE_REVIEWS;
  });

  // Clinic details (saved per workspace)
  const [clinicConfig, setClinicConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(`docreview_clinic_${getWorkspaceId()}`);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      clinic_name: 'CareWell Multispecialty Clinic',
      doctor_name: 'Dr. Aryan Mehta, MD',
      review_link: 'https://g.page/r/your-google-review-link',
      default_country_code: '91',
      use_smart_bridge: true
    };
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

  // Save clinic config changes to localStorage for this specific workspace
  const handleChangeClinicConfig = (field, value) => {
    setClinicConfig((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem(`docreview_clinic_${workspaceId}`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Update a single Google review template
  const handleUpdateGoogleReview = (id, newText) => {
    setGoogleReviews((prev) => {
      const updated = prev.map((r) => r.id === id ? { ...r, text: newText } : r);
      try {
        localStorage.setItem(`docreview_reviews_${workspaceId}`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Reset 10 Google reviews back to defaults
  const handleResetGoogleReviews = () => {
    if (window.confirm('Reset all 10 reviews back to standard doctor/clinic templates?')) {
      setGoogleReviews(DEFAULT_GOOGLE_REVIEWS);
      try {
        localStorage.setItem(`docreview_reviews_${workspaceId}`, JSON.stringify(DEFAULT_GOOGLE_REVIEWS));
      } catch (_) {}
    }
  };

  // Switch Workspace Handler (Multi-Device Sync / Isolation)
  const handleWorkspaceChanged = (newWorkspaceId) => {
    setWorkspaceIdState(newWorkspaceId);

    // Reset local UI states so previous workspace data is not leaked
    setWaStatus({ status: 'disconnected', qrCode: null, user: null });
    setContactsData(null);
    setCampaignState({
      isRunning: false,
      isPaused: false,
      stats: { total: 0, sent: 0, failed: 0, pending: 0, status: 'idle', cooldownRemaining: 0 },
      logs: []
    });

    // Load clinicConfig for the new workspace if saved
    try {
      const savedClinic = localStorage.getItem(`docreview_clinic_${newWorkspaceId}`);
      if (savedClinic) {
        setClinicConfig(JSON.parse(savedClinic));
      } else {
        setClinicConfig({
          clinic_name: 'CareWell Multispecialty Clinic',
          doctor_name: 'Dr. Aryan Mehta, MD',
          review_link: 'https://g.page/r/your-google-review-link',
          default_country_code: '91',
          use_smart_bridge: true
        });
      }

      const savedReviews = localStorage.getItem(`docreview_reviews_${newWorkspaceId}`);
      if (savedReviews) {
        setGoogleReviews(JSON.parse(savedReviews));
      } else {
        setGoogleReviews(DEFAULT_GOOGLE_REVIEWS);
      }
    } catch (_) {}
  };

  // Socket.io & Polling initialization, reactive to workspaceId
  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    const socketOptions = {
      transports: ['polling', 'websocket'],
      auth: { sessionId: workspaceId, workspaceId },
      query: { sessionId: workspaceId, workspaceId },
      reconnectionAttempts: 10,
      timeout: 10000
    };

    const socket = baseUrl ? io(baseUrl, socketOptions) : io(socketOptions);

    socket.on('wa_status', (data) => {
      // Ensure this update belongs to our active workspace
      if (data.sessionId && data.sessionId !== workspaceId) return;

      setWaStatus((prev) => {
        const isRecentlyConnecting = prev.status === 'connecting' && (Date.now() - connectingStartedAtRef.current < 45000);
        if (isRecentlyConnecting && data.status === 'disconnected' && !data.qrCode) {
          return prev;
        }
        if (data.status === 'connected' || data.status === 'qrcode') {
          connectingStartedAtRef.current = 0;
        }
        return data;
      });
    });

    socket.on('campaign_update', (data) => {
      if (data.sessionId && data.sessionId !== workspaceId) return;
      setCampaignState((prev) => ({
        ...prev,
        stats: data.stats,
        isRunning: data.isRunning,
        isPaused: data.isPaused
      }));
    });

    socket.on('campaign_log', (entry) => {
      if (entry.sessionId && entry.sessionId !== workspaceId) return;
      setCampaignState((prev) => ({
        ...prev,
        logs: [entry, ...prev.logs.slice(0, 150)]
      }));
    });

    // Active polling fallback for WhatsApp status every 2.5s
    const pollInterval = setInterval(() => {
      fetchWithSession(`${baseUrl}/api/whatsapp/status`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setWaStatus((prev) => {
              const isRecentlyConnecting = prev.status === 'connecting' && (Date.now() - connectingStartedAtRef.current < 45000);
              if (isRecentlyConnecting && data.status === 'disconnected' && !data.qrCode) {
                return prev;
              }

              if (prev.status !== data.status || prev.qrCode !== data.qrCode || prev.user?.phone !== data.user?.phone) {
                if (data.status === 'connected' || data.status === 'qrcode') {
                  connectingStartedAtRef.current = 0;
                }
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
    fetchWithSession(`${baseUrl}/api/templates`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.templates) {
          setTemplates(data.templates);
        }
      })
      .catch((err) => console.error('Error fetching templates:', err));

    // Fetch initial campaign state for this workspace
    fetchWithSession(`${baseUrl}/api/campaign/status`)
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
  }, [workspaceId]);

  // WhatsApp Handlers (Session Scoped)
  const handleConnectWA = async () => {
    const baseUrl = getApiBaseUrl();
    connectingStartedAtRef.current = Date.now();

    try {
      setWaStatus((prev) => ({ ...prev, status: 'connecting' }));
      const res = await fetchWithSession(`${baseUrl}/api/whatsapp/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true })
      });
      const data = await res.json();
      if (data.success) {
        if (data.qrCode || data.status === 'connected') {
          connectingStartedAtRef.current = 0;
          setWaStatus(data);
        } else {
          console.log('QR not ready in initial HTTP window. Background polling will deliver it...');
        }
      }
    } catch (err) {
      console.error('Error connecting WhatsApp:', err);
      alert('Could not reach backend server. On free tier, the server sleeps when inactive and takes ~30-45 seconds to wake up. Please wait a moment and try again.');
      connectingStartedAtRef.current = 0;
      setWaStatus((prev) => ({ ...prev, status: 'disconnected' }));
    }
  };

  const handleLogoutWA = async () => {
    try {
      connectingStartedAtRef.current = 0;
      const baseUrl = getApiBaseUrl();
      await fetchWithSession(`${baseUrl}/api/whatsapp/logout`, { method: 'POST' });
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

  // Excel Handlers
  const handleContactsUploaded = (data) => {
    setContactsData(data);
  };

  const handleClearContacts = () => {
    setContactsData(null);
  };

  // Campaign Handlers (Session Scoped)
  const handleStartCampaign = async (payload) => {
    try {
      const baseUrl = getApiBaseUrl();
      const finalConfig = { ...payload.clinicConfig };

      // If smart bridge enabled, rewrite review_link to point to the smart auto-fill page
      if (finalConfig.use_smart_bridge !== false && typeof window !== 'undefined') {
        const origin = window.location.origin;
        const path = window.location.pathname;
        const clinic = encodeURIComponent(finalConfig.clinic_name || 'CareWell Multispecialty Clinic');
        const doc = encodeURIComponent(finalConfig.doctor_name || 'Dr. Aryan Mehta, MD');
        const target = encodeURIComponent(finalConfig.review_link || 'https://search.google.com/local/writereview');
        const ws = encodeURIComponent(workspaceId);
        finalConfig.review_link = `${origin}${path}?review=1&ws=${ws}&clinic=${clinic}&doc=${doc}&target=${target}`;
      }

      const res = await fetchWithSession(`${baseUrl}/api/campaign/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          clinicConfig: finalConfig
        })
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
    await fetchWithSession(`${baseUrl}/api/campaign/pause`, { method: 'POST' });
  };

  const handleResumeCampaign = async () => {
    const baseUrl = getApiBaseUrl();
    await fetchWithSession(`${baseUrl}/api/campaign/resume`, { method: 'POST' });
  };

  const handleStopCampaign = async () => {
    if (window.confirm('Are you sure you want to stop this campaign?')) {
      const baseUrl = getApiBaseUrl();
      await fetchWithSession(`${baseUrl}/api/campaign/stop`, { method: 'POST' });
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
        workspaceId={workspaceId}
        onLogout={handleLogoutWA}
        onScrollToStudio={scrollToStudio}
        onOpenServerSettings={() => setIsSettingsOpen(true)}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
      />

      <BackendSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {}}
      />

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onWorkspaceChanged={handleWorkspaceChanged}
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
            <span>2. Review Templates</span>
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
            <span>3. Import Patients</span>
          </button>

          <span className="step-arrow">→</span>

          <button
            className={`step-nav-btn ${currentStep === 4 ? 'active' : ''} ${campaignState?.stats?.status === 'completed' ? 'completed' : ''}`}
            onClick={() => setCurrentStep(4)}
          >
            <div className="step-number">
              {campaignState?.stats?.status === 'completed' ? <Check size={14} /> : '4'}
            </div>
            <Send size={16} />
            <span>4. Dispatch Reviews</span>
          </button>
        </div>

        {/* STEP 1: WhatsApp Web Multi-Device Pairing */}
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

        {/* STEP 2: Doctor Template Customizer & 10 Google Reviews Manager */}
        {currentStep === 2 && (
          <div className="step-content">
            <Step2Templates
              templates={templates}
              selectedTemplateIds={selectedTemplateIds}
              onToggleTemplate={handleToggleTemplate}
              onUpdateTemplateText={handleUpdateTemplateText}
              clinicConfig={clinicConfig}
              onChangeClinicConfig={handleChangeClinicConfig}
              googleReviews={googleReviews}
              onUpdateGoogleReview={handleUpdateGoogleReview}
              onResetGoogleReviews={handleResetGoogleReviews}
              workspaceId={workspaceId}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          </div>
        )}

        {/* STEP 3: Excel Upload & Column Normalization */}
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

        {/* STEP 4: Smart Anti-Ban Campaign Dispatcher */}
        {currentStep === 4 && (
          <div className="step-content">
            <Step4Dispatcher
              waStatus={waStatus}
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
          <div style={{ background: '#e0f2fe', padding: '16px', borderRadius: '16px', color: '#0284c7' }}>
            <ShieldCheck size={40} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Why RevU GEN Guarantees WhatsApp Anti-Ban Safety
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', maxWidth: '900px' }}>
              Meta's anti-spam detection flags accounts based on three triggers: (1) identical message content sent repeatedly, (2) inhuman sending speeds (less than 5 seconds), and (3) missing presence updates. RevU GEN addresses all three: our engine introduces random jitter delays (15-30s), sends authentic "typing..." presence updates, and randomly shuffles between your chosen 1-5 templates with variable spintax greetings.
            </p>
          </div>
        </div>
      </section>

      <FAQSection />

      <Footer />
    </div>
  );
}
