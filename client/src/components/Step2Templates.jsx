import React, { useState } from 'react';
import { CheckSquare, Square, Edit3, Eye, Sparkles, Building2, Stethoscope, Link as LinkIcon, CheckCircle2, ArrowRight, ArrowLeft, ExternalLink, Globe } from 'lucide-react';

export default function Step2Templates({
  templates,
  selectedTemplateIds,
  onToggleTemplate,
  clinicConfig,
  onChangeClinicConfig,
  onUpdateTemplateText,
  onNext,
  onBack
}) {
  const [activePreviewId, setActivePreviewId] = useState(selectedTemplateIds[0] || 1);
  const [editingId, setEditingId] = useState(null);
  const [editDraftText, setEditDraftText] = useState('');

  const selectedCount = selectedTemplateIds.length;
  const isSelectionValid = selectedCount >= 1 && selectedCount <= 5;

  const currentPreviewTemplate = templates.find((t) => t.id === activePreviewId) || templates[0];

  // Helper to format simulated live message for preview
  const formatPreview = (rawText) => {
    if (!rawText) return '';
    return rawText
      .replace(/\{\{patient_name\}\}/gi, 'Rahul Sharma')
      .replace(/\{\{doctor_name\}\}/gi, clinicConfig.doctor_name || 'Dr. Aryan Mehta')
      .replace(/\{\{clinic_name\}\}/gi, clinicConfig.clinic_name || 'City Heart & Dental Clinic')
      .replace(/\{\{review_link\}\}/gi, clinicConfig.review_link || 'https://g.page/r/your-clinic-review')
      // Simple preview spintax resolver (first choice)
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

  return (
    <div className="glass-panel" style={{ padding: '36px 32px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 32px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(0, 180, 216, 0.15)', borderRadius: '50%', marginBottom: '14px', color: '#00b4d8' }}>
          <Sparkles size={30} />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>
          Step 2: Clinic Details & 5-Star Review Templates
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Choose between <b>1 to 5 SEO-optimized doctor review templates</b>. When your campaign runs, templates are randomly rotated per patient to bypass WhatsApp spam fingerprinting.
        </p>
      </div>

      {/* Premium Clinic Configuration Profile Card */}
      <div style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '28px 32px',
        marginBottom: '36px',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
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
                  <span>Test Link</span>
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

            {/* Smart Helper Tip */}
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              padding: '10px 14px',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#0369a1',
              fontSize: '12.5px'
            }}>
              <span style={{ fontSize: '14px' }}>💡</span>
              <span>
                <b>Quick Tip:</b> Open your Google Business Profile dashboard, click <b>"Ask for reviews"</b>, and paste your direct shortlink here.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Templates List vs WhatsApp Mockup */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.95fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Column: Template Cards */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>5 Pre-Crafted Doctor Templates</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Select minimum 1 and maximum 5 templates.</p>
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
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span className="template-badge">{tpl.category}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>#{tpl.id}</span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: isSelected ? '#0284c7' : 'var(--text-main)' }}>
                        {tpl.title}
                      </h4>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {tpl.description}
                      </div>
                    </div>

                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTemplate(tpl.id);
                      }}
                      style={{ cursor: 'pointer', padding: '4px' }}
                    >
                      {isSelected ? (
                        <CheckSquare size={24} color="#059669" />
                      ) : (
                        <Square size={24} color="var(--text-faint)" />
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '12px' }}>
                      <textarea
                        className="input-field"
                        rows={6}
                        value={editDraftText}
                        onChange={(e) => setEditDraftText(e.target.value)}
                        style={{ fontSize: '13px' }}
                      />
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => handleSaveEdit(tpl.id)}>
                          Save Changes
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => setEditingId(null)}>
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

                      <div style={{ fontSize: '12px', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
        <div style={{ position: 'sticky', top: '100px' }}>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
              Live WhatsApp Recipient Preview
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
              Template #{currentPreviewTemplate?.id}
            </span>
          </div>

          <div className="chat-preview-card">
            {/* WhatsApp App Bar */}
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

            {/* Chat Canvas */}
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

              {/* Message Bubble */}
              <div className="chat-bubble">
                {formatPreview(currentPreviewTemplate?.text)}
                <div className="chat-bubble-time">
                  <span>10:45 AM</span>
                  <span style={{ color: '#53bdeb' }}>✓✓</span>
                </div>
              </div>
            </div>

            {/* Simulated Input bar - Authentic WhatsApp light style */}
            <div style={{ background: '#f0f2f5', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #e9edef' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e9edef', borderRadius: '20px', padding: '8px 14px', fontSize: '13px', color: '#667781', flex: 1, textAlign: 'left' }}>
                Type a message...
              </div>
            </div>
          </div>
        </div>

      </div>

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
