import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Edit3, 
  Eye, 
  Sparkles, 
  Building2, 
  Stethoscope, 
  Link as LinkIcon, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ExternalLink, 
  Globe, 
  Star, 
  MessageSquare, 
  RotateCcw, 
  Copy, 
  Check,
  Activity,
  KeyRound,
  Bot,
  Wand2,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { DEFAULT_GOOGLE_REVIEWS, formatGoogleReview } from '../data/defaultReviews.js';
import { getApiBaseUrl } from '../config.js';

const CLINIC_SPECIALTIES = [
  'General Practice / Multispecialty',
  'Dental Care & Dentistry',
  'Dermatology & Skin Care',
  'Pediatrics / Child Care',
  'Cardiology / Heart Care',
  'Orthopedics & Joint Care',
  'Eye Care / Ophthalmology',
  'ENT / Ear, Nose & Throat',
  'Gynecology & Women’s Health',
  'Physiotherapy & Rehabilitation',
  'Diagnostic Lab & Pathology',
  'Homeopathy & Ayurveda'
];

export default function Step2Templates({
  templates,
  selectedTemplateIds,
  onToggleTemplate,
  clinicConfig,
  onChangeClinicConfig,
  onUpdateTemplateText,
  googleReviews = DEFAULT_GOOGLE_REVIEWS,
  onUpdateGoogleReview,
  onResetGoogleReviews,
  onSetAllGoogleReviews,
  workspaceId,
  onNext,
  onBack
}) {
  const [activeSubTab, setActiveSubTab] = useState('whatsapp'); // 'whatsapp' | 'google_reviews'
  const [activePreviewId, setActivePreviewId] = useState(selectedTemplateIds[0] || 1);
  const [editingId, setEditingId] = useState(null);
  const [editDraftText, setEditDraftText] = useState('');
  const [editingGoogleReviewId, setEditingGoogleReviewId] = useState(null);
  const [editGoogleDraftText, setEditGoogleDraftText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState('');
  const [showAiSettings, setShowAiSettings] = useState(false);

  const selectedCount = selectedTemplateIds.length;
  const isSelectionValid = selectedCount >= 1 && selectedCount <= 5;
  const currentPreviewTemplate = templates.find((t) => t.id === activePreviewId) || templates[0];

  // Effective Smart Review Link for this clinic
  const getSmartBridgeUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const path = window.location.pathname;
    const clinic = encodeURIComponent(clinicConfig.clinic_name || 'CareWell Multispecialty Clinic');
    const doc = encodeURIComponent(clinicConfig.doctor_name || 'Dr. Aryan Mehta, MD');
    const spec = encodeURIComponent(clinicConfig.specialty || 'General Practice');
    const target = encodeURIComponent(clinicConfig.review_link || 'https://search.google.com/local/writereview');
    const ws = encodeURIComponent(workspaceId || 'default');
    return `${origin}${path}?review=1&ws=${ws}&clinic=${clinic}&doc=${doc}&spec=${spec}&target=${target}`;
  };

  const handleGenerateAiReviews = async () => {
    setIsGeneratingAi(true);
    setAiNotice('');
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/reviews/generate-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': workspaceId
        },
        body: JSON.stringify({
          clinicName: clinicConfig.clinic_name || 'CareWell Multispecialty Clinic',
          doctorName: clinicConfig.doctor_name || 'Dr. Aryan Mehta',
          specialty: clinicConfig.specialty || 'General Practice',
          count: 10,
          apiKey: clinicConfig.ai_api_key || '',
          provider: clinicConfig.ai_provider || 'gemini'
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
        const titles = [
          "Doctor Expertise & Accurate Diagnosis",
          "Clinic Cleanliness & Helpful Staff",
          "Fast Recovery & Effective Prescription",
          "Genuine Medical Advice Without Extra Tests",
          "Zero Waiting & Smooth Appointment",
          "Family & Senior-Friendly Comforting Care",
          "Prompt Attention & Reassuring Guidance",
          "Transparent & Affordable Consultation",
          "Humble Bedside Manner & Detailed Explanation",
          "Highly Recommended by Local Families"
        ];
        const newTen = data.reviews.slice(0, 10).map((txt, idx) => ({
          id: idx + 1,
          category: titles[idx] || `Review #${idx + 1}`,
          text: txt
        }));
        onSetAllGoogleReviews?.(newTen);
        setAiNotice(`✓ 10 unique AI reviews generated tailored to ${clinicConfig.specialty || 'your clinic'}!`);
        setTimeout(() => setAiNotice(''), 6000);
      } else {
        alert(data.error || 'Failed to generate reviews. Please try again.');
      }
    } catch (err) {
      alert(`AI review generation error: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopySmartLink = () => {
    const url = getSmartBridgeUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTestPatientPortal = () => {
    const url = getSmartBridgeUrl();
    window.open(url, '_blank');
  };

  // Helper to format simulated live message for preview
  const formatPreview = (rawText) => {
    if (!rawText) return '';
    let linkToShow;
    if (clinicConfig.use_smart_bridge !== false && typeof window !== 'undefined') {
      const origin = window.location.origin;
      const ws = encodeURIComponent(workspaceId || 'default');
      linkToShow = `${origin}/?review=1&ws=${ws}`;
    } else {
      linkToShow = clinicConfig.review_link || 'https://g.page/r/your-clinic-review';
    }
    return rawText
      .replace(/\{\{patient_name\}\}/gi, 'Rahul Sharma')
      .replace(/\{\{doctor_name\}\}/gi, clinicConfig.doctor_name || 'Dr. Aryan Mehta')
      .replace(/\{\{clinic_name\}\}/gi, clinicConfig.clinic_name || 'City Heart & Dental Clinic')
      .replace(/\{\{review_link\}\}/gi, linkToShow)
      .replace(/\{([^{}]+)\}/g, (_, choices) => choices.split('|')[0]);
  };

  const handleStartEdit = (t) => {
    setEditingId(t.id);
    setEditDraftText(t.text);
  };

  const handleSaveEdit = (id) => {
    onUpdateTemplateText(id, editDraftText);
    setEditingId(null);
  };

  const handleStartEditGoogleReview = (rev) => {
    setEditingGoogleReviewId(rev.id);
    setEditGoogleDraftText(rev.text);
  };

  const handleSaveEditGoogleReview = (id) => {
    onUpdateGoogleReview?.(id, editGoogleDraftText);
    setEditingGoogleReviewId(null);
  };

  return (
    <div className="glass-panel step-panel">
      
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 32px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(0, 180, 216, 0.15)', borderRadius: '50%', marginBottom: '14px', color: '#00b4d8' }}>
          <Sparkles size={30} />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>
          Step 2: Clinic Setup & 5-Star Review Automation
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Configure your clinic details, customize your <b>WhatsApp message rotation</b>, and set up <b>10 pre-written Google reviews</b> that automatically copy to patient clipboards for instant 5-star publishing!
        </p>
      </div>

      {/* Premium Clinic Configuration Profile Card */}
      <div style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '28px 32px',
        marginBottom: '32px',
        boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
        position: 'relative'
      }}>
        {/* Card Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
              color: '#0284c7',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.15)'
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.3px' }}>
                Clinic & Doctor Profile
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Automatically populates placeholders like <code>{`{{clinic_name}}`}</code> & <code>{`{{doctor_name}}`}</code>
              </p>
            </div>
          </div>

          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: '6px 14px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#059669',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <span>Live Auto-Hydration Active</span>
          </div>
        </div>

        {/* Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '20px' }}>
          {/* Clinic Name */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
              <Building2 size={13} color="#0284c7" />
              <span>Clinic / Hospital Name</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                value={clinicConfig.clinic_name}
                onChange={(e) => onChangeClinicConfig('clinic_name', e.target.value)}
                placeholder="e.g. CareWell Multispecialty Clinic"
                style={{
                  paddingLeft: '40px',
                  fontWeight: '500',
                  color: 'var(--text-main)',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1'
                }}
              />
              <Building2 size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8' }} />
            </div>
          </div>

          {/* Doctor Name */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
              <Stethoscope size={13} color="#0284c7" />
              <span>Doctor's Name & Title</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                value={clinicConfig.doctor_name}
                onChange={(e) => onChangeClinicConfig('doctor_name', e.target.value)}
                placeholder="e.g. Dr. Aryan Mehta, MD"
                style={{
                  paddingLeft: '40px',
                  fontWeight: '500',
                  color: 'var(--text-main)',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1'
                }}
              />
              <Stethoscope size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8' }} />
            </div>
          </div>

          {/* Medical Specialty */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
              <Activity size={13} color="#0284c7" />
              <span>Medical Specialty / Department</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="input-field"
                value={clinicConfig.specialty || 'General Practice / Multispecialty'}
                onChange={(e) => onChangeClinicConfig('specialty', e.target.value)}
                style={{
                  paddingLeft: '38px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                {CLINIC_SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <Activity size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Review Link (Span 2) */}
          <div className="input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', margin: 0 }}>
                <Globe size={13} color="#0284c7" />
                <span>Google Business Profile Review Link</span>
              </label>
              {clinicConfig.review_link && (
                <button
                  type="button"
                  onClick={() => window.open(clinicConfig.review_link, '_blank')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  title="Test link in new tab"
                >
                  <span>Test Google Link</span>
                  <ExternalLink size={12} />
                </button>
              )}
            </div>

            <div style={{ position: 'relative', display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  className="input-field"
                  value={clinicConfig.review_link}
                  onChange={(e) => onChangeClinicConfig('review_link', e.target.value)}
                  placeholder="e.g. https://g.page/r/your-review-link or maps.app.goo.gl/..."
                  style={{
                    paddingLeft: '40px',
                    fontWeight: '500',
                    color: 'var(--text-main)',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1'
                  }}
                />
                <LinkIcon size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8' }} />
              </div>
            </div>

            {/* Smart 5-Star Auto-Fill Review Bridge Box */}
            <div style={{
              marginTop: '16px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f0fdf4 100%)',
              border: '1.5px solid #bae6fd',
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(2, 132, 199, 0.15)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Star size={20} color="#f59e0b" fill="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                    10-Review Smart Auto-Fill Bridge (Enabled)
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Patients receive a link that randomly assigns 1 of your 10 reviews, auto-copies to their clipboard, and pre-selects 5 stars!
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCopySmartLink}
                  className="btn"
                  style={{
                    background: copiedLink ? '#10b981' : '#ffffff',
                    color: copiedLink ? '#ffffff' : '#0284c7',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Copy the smart patient review link"
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Patient Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestPatientPortal}
                  className="btn btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Test patient view in a new tab"
                >
                  <span>Preview Patient View</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation: WhatsApp Message Templates vs Google 10 Reviews */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '26px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('whatsapp')}
          style={{
            background: activeSubTab === 'whatsapp' ? '#0284c7' : '#f1f5f9',
            color: activeSubTab === 'whatsapp' ? '#ffffff' : '#475569',
            border: 'none',
            borderRadius: '12px',
            padding: '11px 22px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <MessageSquare size={16} />
          <span>1. WhatsApp Message Invitations ({selectedCount} Selected)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('google_reviews')}
          style={{
            background: activeSubTab === 'google_reviews' ? '#0284c7' : '#f1f5f9',
            color: activeSubTab === 'google_reviews' ? '#ffffff' : '#475569',
            border: 'none',
            borderRadius: '12px',
            padding: '11px 22px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <Star 
            size={16} 
            color={activeSubTab === 'google_reviews' ? '#fde047' : '#f59e0b'} 
            fill={activeSubTab === 'google_reviews' ? '#fde047' : '#f59e0b'} 
          />
          <span>2. Patient 5-Star Reviews (10 Pre-Set Google Reviews)</span>
        </button>
      </div>

      {/* SUB-TAB 1: WHATSAPP TEMPLATES ROTATION */}
      {activeSubTab === 'whatsapp' && (
        <div className="templates-layout-grid">
          
          {/* Left Column: Template Cards */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>5 Pre-Crafted WhatsApp Invitations</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Select between 1 to 5 templates for anti-ban rotation.</p>
              </div>
              <div style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '700',
                background: isSelectionValid ? 'rgba(6, 214, 160, 0.15)' : 'rgba(239, 71, 111, 0.15)',
                color: isSelectionValid ? '#06d6a0' : '#ef476f',
                border: `1px solid ${isSelectionValid ? 'rgba(6, 214, 160, 0.3)' : 'rgba(239, 71, 111, 0.3)'}`
              }}>
                Selected: {selectedCount} / 5
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {templates.map((tpl) => {
                const isSelected = selectedTemplateIds.includes(tpl.id);
                const isEditing = editingId === tpl.id;

                return (
                  <div 
                    key={tpl.id}
                    className={`template-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setActivePreviewId(tpl.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span className="template-badge">{tpl.category}</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>#{tpl.id}</span>
                        </div>
                        <h4 className="template-title" style={{ fontSize: '16px', fontWeight: '800', color: isSelected ? '#0284c7' : '#0f172a', letterSpacing: '-0.2px', margin: 0 }}>
                          {tpl.title}
                        </h4>
                        <div className="template-desc" style={{ fontSize: '13px', color: isSelected ? '#334155' : '#475569', marginTop: '5px', lineHeight: '1.5' }}>
                          {tpl.description}
                        </div>
                      </div>

                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTemplate(tpl.id);
                        }}
                        style={{ 
                          cursor: 'pointer', 
                          padding: '6px',
                          background: isSelected ? '#ecfdf5' : '#f8fafc',
                          border: isSelected ? '1.5px solid #a7f3d0' : '1.5px solid #e2e8f0',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 2px 6px rgba(5, 150, 105, 0.12)' : 'none'
                        }}
                        title={isSelected ? 'Selected template (click to deselect)' : 'Click to select this template'}
                      >
                        {isSelected ? (
                          <CheckSquare size={20} color="#059669" />
                        ) : (
                          <Square size={20} color="#94a3b8" />
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                          <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            Edit WhatsApp Message
                          </label>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            Supports {`{{patient_name}}`}, {`{{clinic_name}}`}, {`{{doctor_name}}`}, & {`{{review_link}}`}
                          </span>
                        </div>
                        <textarea
                          className="input-field"
                          rows={6}
                          value={editDraftText}
                          onChange={(e) => setEditDraftText(e.target.value)}
                          style={{
                            fontSize: '13px',
                            lineHeight: '1.6',
                            color: '#0f172a',
                            background: '#ffffff',
                            border: '1.5px solid #0284c7',
                            boxShadow: '0 0 0 3px rgba(2, 132, 199, 0.12)',
                            borderRadius: '10px'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button className="btn btn-primary" style={{ padding: '7px 18px', fontSize: '13px' }} onClick={() => handleSaveEdit(tpl.id)}>
                            Save Changes
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '7px 16px', fontSize: '13px' }} onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(tpl);
                          }}
                        >
                          <Edit3 size={13} />
                          <span>Edit Text</span>
                        </button>

                        <div style={{ fontSize: '12px', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                          <Eye size={13} />
                          <span>Viewing on simulator</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive WhatsApp Phone Mockup */}
          <div className="preview-sticky-col">
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                Live WhatsApp Recipient Preview
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                Template #{currentPreviewTemplate?.id}
              </span>
            </div>

            <div className="chat-preview-card">
              <div className="chat-preview-header">
                <div className="chat-avatar">
                  {(clinicConfig.clinic_name || 'C')[0]?.toUpperCase()}
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#ffffff', lineHeight: 1.2 }}>
                    {clinicConfig.clinic_name || 'City Heart & Dental Care'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#86efac' }}>
                    official clinic desk • online
                  </div>
                </div>
              </div>

              <div style={{
                background: '#efeae2',
                backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 0)',
                backgroundSize: '16px 16px',
                padding: '24px 16px',
                minHeight: '440px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  alignSelf: 'center',
                  background: '#ffffff',
                  color: '#54656f',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  marginBottom: '16px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)'
                }}>
                  TODAY
                </div>

                <div className="chat-bubble">
                  {formatPreview(currentPreviewTemplate?.text)}
                  <div className="chat-bubble-time">
                    <span>10:45 AM</span>
                    <span style={{ color: '#53bdeb' }}>✓✓</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f0f2f5', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #e9edef' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e9edef', borderRadius: '20px', padding: '8px 14px', fontSize: '13px', color: '#667781', flex: 1, textAlign: 'left' }}>
                  Type a message...
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: 10 PATIENT GOOGLE REVIEWS (AUTO-FILL MANAGER) */}
      {activeSubTab === 'google_reviews' && (
        <div>
          {/* Action Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: '#0f172a' }}>
                10 Pre-Crafted 5-Star Patient Reviews
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                When patients open the review link, one of these reviews is randomly assigned and auto-copied to their clipboard so they can paste it directly into Google Reviews!
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleGenerateAiReviews}
                disabled={isGeneratingAi}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 40%, #06b6d4 100%)',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                }}
                title="Generate 10 completely unique, human-sounding reviews tailored to your specialty"
              >
                <Sparkles size={15} />
                <span>{isGeneratingAi ? '✨ AI Generating 10 Reviews...' : '✨ AI Generate 10 Fresh Reviews'}</span>
              </button>

              <button
                type="button"
                onClick={onResetGoogleReviews}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Reset all 10 reviews to default healthcare templates"
              >
                <RotateCcw size={13} />
                <span>Reset to Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleTestPatientPortal}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Preview Patient Portal</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>

          {/* AI Generation Notice Banner */}
          {aiNotice && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #6ee7b7',
              borderRadius: '12px',
              padding: '12px 18px',
              marginBottom: '20px',
              color: '#065f46',
              fontSize: '13.5px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{aiNotice}</span>
            </div>
          )}

          {/* Grid of 10 Reviews */}
          <div className="google-reviews-grid">
            {googleReviews.map((rev) => {
              const isEditingThis = editingGoogleReviewId === rev.id;
              const previewText = formatGoogleReview(rev.text, {
                clinic_name: clinicConfig.clinic_name,
                doctor_name: clinicConfig.doctor_name
              });

              return (
                <div 
                  key={rev.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '22px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#b45309',
                          fontWeight: '800',
                          fontSize: '11.5px',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          Review #{rev.id}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                          {rev.category}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} color="#f59e0b" fill="#f59e0b" />
                        ))}
                      </div>
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px 0' }}>
                      {rev.title}
                    </h4>

                    {isEditingThis ? (
                      <div>
                        <textarea
                          rows={4}
                          value={editGoogleDraftText}
                          onChange={(e) => setEditGoogleDraftText(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '10px',
                            border: '1.5px solid #0284c7',
                            fontSize: '13px',
                            lineHeight: '1.5',
                            color: '#0f172a',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                            onClick={() => handleSaveEditGoogleReview(rev.id)}
                          >
                            Save Review #{rev.id}
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setEditingGoogleReviewId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        color: '#334155',
                        fontStyle: 'italic'
                      }}>
                        "{previewText}"
                      </div>
                    )}
                  </div>

                  {!isEditingThis && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                        {previewText.length} characters
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEditGoogleReview(rev)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit3 size={11} />
                        <span>Edit Review Text</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to WhatsApp</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isSelectionValid && (
            <span style={{ color: '#ef476f', fontSize: '13px', fontWeight: '600' }}>
              Please select between 1 and 5 templates to proceed.
            </span>
          )}
          <button 
            className="btn btn-primary" 
            disabled={!isSelectionValid} 
            onClick={onNext}
            style={{ padding: '12px 28px' }}
          >
            <span>Continue to Step 3: Upload Excel</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
