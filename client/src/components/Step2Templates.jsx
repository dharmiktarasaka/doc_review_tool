import React, { useState } from 'react';
import { CheckSquare, Square, Edit3, Eye, Sparkles, Building2, Stethoscope, Link as LinkIcon, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

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

      {/* Clinic Configuration Form */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '36px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Building2 size={18} />
          <span>Clinic & Doctor Profile (Auto-Hydrated into Messages)</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="input-group">
            <label className="input-label">Clinic / Hospital Name</label>
            <input
              type="text"
              className="input-field"
              value={clinicConfig.clinic_name}
              onChange={(e) => onChangeClinicConfig('clinic_name', e.target.value)}
              placeholder="e.g. CareWell Multispecialty Clinic"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Doctor's Name & Title</label>
            <input
              type="text"
              className="input-field"
              value={clinicConfig.doctor_name}
              onChange={(e) => onChangeClinicConfig('doctor_name', e.target.value)}
              placeholder="e.g. Dr. Aryan Mehta, MD"
            />
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Google Business Profile Review Link</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                value={clinicConfig.review_link}
                onChange={(e) => onChangeClinicConfig('review_link', e.target.value)}
                placeholder="e.g. https://g.page/r/Cb4dafd.../review or maps.app.goo.gl/..."
                style={{ paddingLeft: '40px' }}
              />
              <LinkIcon size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '6px' }}>
              💡 Tip: Copy your review shortlink directly from your Google Business Profile &gt; "Ask for reviews".
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
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: isSelected ? '#ffffff' : 'var(--text-main)' }}>
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
                        <CheckSquare size={24} color="#06d6a0" />
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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

                      <div style={{ fontSize: '12px', color: '#00b4d8', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
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
                <div style={{ fontSize: '11px', color: '#25d366' }}>
                  official clinic desk • online
                </div>
              </div>
            </div>

            {/* Chat Canvas */}
            <div style={{
              background: '#0b141a',
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)',
              backgroundSize: '16px 16px',
              padding: '24px 16px',
              minHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                alignSelf: 'center',
                background: '#182229',
                color: '#8696a0',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                marginBottom: '16px'
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

            {/* Simulated Input bar */}
            <div style={{ background: '#202c33', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: '#2a3942', borderRadius: '20px', padding: '8px 14px', fontSize: '13px', color: '#8696a0', flex: 1, textAlign: 'left' }}>
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
