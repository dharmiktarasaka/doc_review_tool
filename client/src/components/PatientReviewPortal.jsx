import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Shuffle, 
  CheckCircle2, 
  Building2, 
  Stethoscope, 
  ShieldCheck, 
  ArrowRight,
  Heart
} from 'lucide-react';
import { DEFAULT_GOOGLE_REVIEWS, formatGoogleReview } from '../data/defaultReviews.js';

export default function PatientReviewPortal() {
  const [clinicName, setClinicName] = useState('CareWell Multispecialty Clinic');
  const [doctorName, setDoctorName] = useState('Dr. Aryan Mehta, MD');
  const [googleReviewLink, setGoogleReviewLink] = useState('https://search.google.com/local/writereview');
  const [reviewList, setReviewList] = useState(DEFAULT_GOOGLE_REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [customReviewText, setCustomReviewText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);

    // Read clinic details from query or fallback
    const qClinic = params.get('clinic');
    const qDoctor = params.get('doc');
    const qTarget = params.get('target');
    const qWorkspace = params.get('ws');
    const qReviewIndex = params.get('r');

    if (qClinic) setClinicName(decodeURIComponent(qClinic));
    if (qDoctor) setDoctorName(decodeURIComponent(qDoctor));
    if (qTarget) setGoogleReviewLink(decodeURIComponent(qTarget));

    // Try reading workspace saved reviews if available
    let loadedReviews = DEFAULT_GOOGLE_REVIEWS;
    if (qWorkspace) {
      try {
        const saved = localStorage.getItem(`docreview_reviews_${qWorkspace}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedReviews = parsed;
          }
        }
      } catch (_) {}
    }
    setReviewList(loadedReviews);

    // Pick index: from query param or randomly from available reviews
    let initialIndex = 0;
    if (qReviewIndex !== null && !isNaN(parseInt(qReviewIndex, 10))) {
      initialIndex = Math.abs(parseInt(qReviewIndex, 10)) % loadedReviews.length;
    } else {
      initialIndex = Math.floor(Math.random() * loadedReviews.length);
    }
    setCurrentIndex(initialIndex);

    // Auto-copy attempt on load if permissions allow
    const activeText = formatGoogleReview(loadedReviews[initialIndex]?.text || '', {
      clinic_name: qClinic ? decodeURIComponent(qClinic) : 'CareWell Multispecialty Clinic',
      doctor_name: qDoctor ? decodeURIComponent(qDoctor) : 'Dr. Aryan Mehta, MD'
    });

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeText)
        .then(() => setCopied(true))
        .catch(() => {});
    }
  }, []);

  const activeReviewTemplate = reviewList[currentIndex] || DEFAULT_GOOGLE_REVIEWS[0];
  const formattedReview = customReviewText || formatGoogleReview(activeReviewTemplate.text, {
    clinic_name: clinicName,
    doctor_name: doctorName
  });

  const handleShuffle = () => {
    const nextIndex = (currentIndex + 1) % reviewList.length;
    setCurrentIndex(nextIndex);
    setCustomReviewText('');
    setIsEditing(false);
    setCopied(false);

    const newText = formatGoogleReview(reviewList[nextIndex].text, {
      clinic_name: clinicName,
      doctor_name: doctorName
    });

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(newText)
        .then(() => setCopied(true))
        .catch(() => {});
    }
  };

  const handleCopyAndSubmit = (e) => {
    e?.preventDefault();
    setCopied(true);
    setIsRedirecting(true);

    // Robust clipboard copy with textarea fallback
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(formattedReview);
      } else {
        const temp = document.createElement('textarea');
        temp.value = formattedReview;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
    } catch (_) {}

    // Redirect to Google Reviews after brief feedback
    setTimeout(() => {
      let target = googleReviewLink || 'https://search.google.com/local/writereview';
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }
      window.location.href = target;
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 35%, #ffffff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#0f172a'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#ffffff',
        borderRadius: '28px',
        boxShadow: '0 20px 60px -15px rgba(2, 132, 199, 0.18), 0 0 1px 1px rgba(2, 132, 199, 0.08)',
        border: '1px solid #bae6fd',
        padding: '36px 28px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Top Decorative Header Accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #10b981 100%)'
        }} />

        {/* Clinic & Doctor Identity Card */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid rgba(2, 132, 199, 0.2)',
          padding: '6px 14px',
          borderRadius: '30px',
          marginBottom: '16px'
        }}>
          <ShieldCheck size={16} color="#0284c7" />
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0369a1' }}>
            Verified Healthcare Consultation
          </span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a', letterSpacing: '-0.02em' }}>
          {clinicName}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14.5px', color: '#475569', fontWeight: '600', marginBottom: '22px' }}>
          <Stethoscope size={16} color="#0284c7" />
          <span>{doctorName}</span>
        </div>

        {/* 5-Star Rating Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1.5px solid #fde68a',
          borderRadius: '20px',
          padding: '16px 20px',
          marginBottom: '22px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#b45309' }}>
            Your 5-Star Rating Ready
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                size={30} 
                color="#f59e0b" 
                fill="#f59e0b" 
                style={{ filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3))' }} 
              />
            ))}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#78350f' }}>
            Excellent Experience • 5.0 out of 5.0
          </span>
        </div>

        {/* Pre-written 5-Star Review Box */}
        <div style={{
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '18px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'left',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              Suggested Review Template ({currentIndex + 1}/10)
            </span>
            <button
              onClick={handleShuffle}
              type="button"
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '600',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
              title="Shuffle to another pre-written review"
            >
              <Shuffle size={12} />
              <span>Shuffle Review</span>
            </button>
          </div>

          {isEditing ? (
            <textarea
              value={formattedReview}
              onChange={(e) => setCustomReviewText(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: '1.5px solid #0284c7',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#0f172a',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          ) : (
            <div style={{
              fontSize: '14.5px',
              lineHeight: '1.6',
              color: '#1e293b',
              fontStyle: 'italic',
              fontWeight: '500'
            }}>
              "{formattedReview}"
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isEditing ? 'Done Editing' : 'Edit Text (Optional)'}
            </button>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11.5px',
              fontWeight: '600',
              color: copied ? '#059669' : '#64748b'
            }}>
              {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
              {copied ? 'Auto-Copied to Clipboard!' : 'Will Copy on Tap'}
            </span>
          </div>
        </div>

        {/* 1-Tap Google Review Action Button */}
        <button
          onClick={handleCopyAndSubmit}
          disabled={isRedirecting}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '16px',
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px -4px rgba(2, 132, 199, 0.4), 0 4px 6px -2px rgba(2, 132, 199, 0.2)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <span>{isRedirecting ? 'Opening Google Review...' : '⭐ Submit 5-Star Review on Google'}</span>
          <ExternalLink size={18} />
        </button>

        {/* 3-Step Simple Guidance */}
        <div style={{
          marginTop: '22px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '14px',
          border: '1px solid #f1f5f9',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
            Quick 3-Second Process:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
              <span>Review text is <b>auto-copied to your clipboard</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
              <span>Google Review opens with 5 stars selected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
              <span><b>Paste & tap Post</b> — thank you for your support!</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: '16px', fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <span>Powered by RevU GEN Healthcare Suite</span>
          <Heart size={12} color="#ef4444" fill="#ef4444" />
        </div>

      </div>
    </div>
  );
}
