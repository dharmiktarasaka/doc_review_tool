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
  Camera,
  X,
  RefreshCw
} from 'lucide-react';
import { DEFAULT_GOOGLE_REVIEWS, formatGoogleReview } from '../data/defaultReviews.js';
import { getApiBaseUrl } from '../config.js';

export default function PatientReviewPortal() {
  const [clinicName, setClinicName] = useState('CareWell Multispecialty Clinic');
  const [doctorName, setDoctorName] = useState('Dr. Aryan Mehta, MD');
  const [googleReviewLink, setGoogleReviewLink] = useState('https://search.google.com/local/writereview');
  const [reviewList, setReviewList] = useState(DEFAULT_GOOGLE_REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedStars, setSelectedStars] = useState(5);
  const [isPosting, setIsPosting] = useState(false);
  const [showCopiedNotice, setShowCopiedNotice] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [specialty, setSpecialty] = useState('General Practice');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);

    const qClinic = params.get('clinic');
    const qDoctor = params.get('doc');
    const qTarget = params.get('target');
    const qWorkspace = params.get('ws');
    const qReviewIndex = params.get('r');
    const qSpecialty = params.get('spec') || params.get('specialty');

    const effectiveClinic = qClinic ? decodeURIComponent(qClinic) : 'CareWell Multispecialty Clinic';
    const effectiveDoctor = qDoctor ? decodeURIComponent(qDoctor) : 'Dr. Aryan Mehta, MD';
    const effectiveTarget = qTarget ? decodeURIComponent(qTarget) : 'https://search.google.com/local/writereview';
    const effectiveSpecialty = qSpecialty ? decodeURIComponent(qSpecialty) : 'General Practice';

    setClinicName(effectiveClinic);
    setDoctorName(effectiveDoctor);
    setGoogleReviewLink(effectiveTarget);
    setSpecialty(effectiveSpecialty);

    // Try reading workspace saved reviews from localStorage
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

    // Pick random review or specified index
    let chosenIndex = 0;
    if (qReviewIndex !== null && !isNaN(parseInt(qReviewIndex, 10))) {
      chosenIndex = Math.abs(parseInt(qReviewIndex, 10)) % loadedReviews.length;
    } else {
      chosenIndex = Math.floor(Math.random() * loadedReviews.length);
    }
    setCurrentIndex(chosenIndex);

    const initialText = formatGoogleReview(loadedReviews[chosenIndex]?.text || '', {
      clinic_name: effectiveClinic,
      doctor_name: effectiveDoctor
    });
    setReviewText(initialText);

    // Pre-copy text into clipboard immediately on arrival
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(initialText).catch(() => {});
      }
    } catch (_) {}
  }, []);

  const handleShuffle = () => {
    const nextIndex = (currentIndex + 1) % reviewList.length;
    setCurrentIndex(nextIndex);

    const newText = formatGoogleReview(reviewList[nextIndex].text, {
      clinic_name: clinicName,
      doctor_name: doctorName
    });
    setReviewText(newText);

    // Update clipboard with new shuffled review
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(newText).catch(() => {});
      }
    } catch (_) {}
  };

  const handleGenerateAiSingle = async () => {
    setIsGeneratingAi(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/reviews/generate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicName,
          doctorName,
          specialty,
          count: 1
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews) && data.reviews[0]) {
        const uniqueAiText = data.reviews[0];
        setReviewText(uniqueAiText);
        if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(uniqueAiText).catch(() => {});
        }
      } else {
        handleShuffle();
      }
    } catch (err) {
      console.warn('AI review generation fallback notice:', err);
      handleShuffle();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyOnly = (e) => {
    e?.preventDefault();
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(reviewText);
      } else {
        const temp = document.createElement('textarea');
        temp.value = reviewText;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      setJustCopied(true);
      setShowCopiedNotice(true);
      setTimeout(() => {
        setJustCopied(false);
        setShowCopiedNotice(false);
      }, 2500);
    } catch (err) {
      console.warn('Copy error:', err);
    }
  };

  const handlePostReview = (e) => {
    e?.preventDefault();
    setIsPosting(true);
    setShowCopiedNotice(true);

    // Robust copy to clipboard
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(reviewText);
      } else {
        const temp = document.createElement('textarea');
        temp.value = reviewText;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
    } catch (_) {}

    // Redirect to the actual Google Review page
    setTimeout(() => {
      let target = googleReviewLink || 'https://search.google.com/local/writereview';
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }
      window.location.href = target;
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 14px',
      fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
      color: '#202124'
    }}>
      
      {/* Official Google Review Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        border: '1px solid #dadce0',
        overflow: 'hidden'
      }}>
        
        {/* Google Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #dadce0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Google Colorful "G" Logo */}
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"/>
            </svg>
            <span style={{ fontSize: '18px', fontWeight: '600', color: '#3c4043' }}>
              Google Reviews
            </span>
          </div>

          <span style={{
            background: '#e6f4ea',
            color: '#137333',
            fontSize: '11.5px',
            fontWeight: '600',
            padding: '3px 10px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={13} /> Verified Clinic
          </span>
        </div>

        {/* Business & Doctor Identity Section */}
        <div style={{ padding: '24px 24px 16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a73e8 0%, #174ea6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '20px',
              boxShadow: '0 2px 6px rgba(26, 115, 232, 0.3)'
            }}>
              {(clinicName || 'C')[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: '700', margin: 0, color: '#202124', lineHeight: 1.3 }}>
                {clinicName}
              </h2>
              <div style={{ fontSize: '13.5px', color: '#5f6368', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Stethoscope size={14} color="#1a73e8" />
                <span>{doctorName}</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#70757a', marginBottom: '18px' }}>
            Posting publicly across Google Maps & Search • 5-Star Rating Pre-Filled
          </div>

          {/* 5 Stars Rating Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: '#fff8e1',
            borderRadius: '12px',
            border: '1px solid #ffe082',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  color="#fbbc04"
                  fill={star <= selectedStars ? '#fbbc04' : 'none'}
                  onClick={() => setSelectedStars(star)}
                  style={{ cursor: 'pointer', filter: 'drop-shadow(0 1px 2px rgba(251, 188, 4, 0.4))' }}
                />
              ))}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#e37400', marginLeft: '6px' }}>
              5.0 / 5.0 (Excellent)
            </span>
          </div>

          {/* The Review Input Placeholder / Textarea (Auto-Filled with Random 1-of-10 Review!) */}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368' }}>
                Your Review {isGeneratingAi ? '(✨ AI writing unique text...)' : `(Suggestion #${currentIndex + 1})`}
              </label>
              
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleGenerateAiSingle}
                  disabled={isGeneratingAi}
                  style={{
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                    border: '1px solid #7dd3fc',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    color: '#0284c7',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 1px 3px rgba(2, 132, 199, 0.12)'
                  }}
                  title="Craft a completely unique, natural AI review"
                >
                  <Sparkles size={12} />
                  <span>{isGeneratingAi ? 'Writing AI...' : '✨ AI Write Unique Review'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShuffle}
                  style={{
                    background: '#f1f3f4',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    color: '#1a73e8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Shuffle to another pre-written review"
                >
                  <Shuffle size={12} />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share details of your own experience at this place"
              rows={5}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '8px',
                border: '1.5px solid #1a73e8',
                fontSize: '14.5px',
                lineHeight: '1.6',
                color: '#202124',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#ffffff',
                boxShadow: '0 0 0 2px rgba(26, 115, 232, 0.15)'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#70757a', marginBottom: '22px' }}>
            <span>✓ Review text ready to publish</span>
            <span>{reviewText.length} characters</span>
          </div>

          {/* Quick Notice */}
          <div style={{
            background: '#e8f0fe',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '12.5px',
            color: '#174ea6',
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <span style={{ fontSize: '16px', marginTop: '-1px' }}>💡</span>
            <div>
              <strong>1-Tap Post:</strong> Clicking <strong>"Post Review"</strong> copies your 5-star review and opens Google Reviews. Simply tap <strong>Paste</strong> and your review is published!
            </div>
          </div>

          {/* Google Actions Bar (Post Button) */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #dadce0',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={handleCopyOnly}
              style={{
                background: justCopied ? '#e6f4ea' : '#f1f3f4',
                border: justCopied ? '1.5px solid #34a853' : '1px solid #dadce0',
                color: justCopied ? '#137333' : '#3c4043',
                fontSize: '14px',
                fontWeight: '600',
                padding: '11px 18px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                flex: '1 1 140px'
              }}
              title="Copy this 5-star review to clipboard"
            >
              {justCopied ? <Check size={16} color="#137333" /> : <Copy size={16} color="#1a73e8" />}
              <span>{justCopied ? 'Review Copied!' : 'Copy Review'}</span>
            </button>

            <button
              type="button"
              onClick={handlePostReview}
              disabled={isPosting}
              style={{
                background: isPosting ? '#34a853' : '#1a73e8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(26, 115, 232, 0.4)',
                transition: 'background 0.2s',
                flex: '2 1 180px'
              }}
            >
              <span>{isPosting ? '✓ Review Copied! Opening Google...' : 'Post Review on Google'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </div>

      {/* Floating Copied Notice Modal / Overlay */}
      {showCopiedNotice && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          background: '#202124',
          color: '#ffffff',
          padding: '14px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 9999
        }}>
          <CheckCircle2 size={20} color="#34a853" />
          <span>Review text copied! Opening Google Reviews now...</span>
        </div>
      )}

      {/* Small subtle footer */}
      <div style={{ marginTop: '16px', fontSize: '11.5px', color: '#70757a' }}>
        Google Business Profile Review Integration • {clinicName}
      </div>

    </div>
  );
}
