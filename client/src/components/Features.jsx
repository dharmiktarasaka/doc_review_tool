import React from 'react';
import { ShieldAlert, TrendingUp, Sparkles, UserCheck, Shuffle, HeartPulse } from 'lucide-react';

export default function Features() {
  const featureList = [
    {
      icon: <TrendingUp size={24} color="#06d6a0" />,
      title: "Boost Local Clinic SEO & Google Rank",
      desc: "Fresh, genuine reviews with keywords like 'doctor', 'clinic', and 'treatment' directly elevate your Google Maps search visibility."
    },
    {
      icon: <Shuffle size={24} color="#00b4d8" />,
      title: "Randomized Spintax Engine",
      desc: "Each message contains randomized phrasing and template variation so WhatsApp algorithms never detect robotic bulk patterns."
    },
    {
      icon: <ShieldAlert size={24} color="#3a86ff" />,
      title: "Active Anti-Ban Protection",
      desc: "Equipped with variable jitter delays (15-30s), simulated human typing presence, and batch cool-down periods."
    },
    {
      icon: <UserCheck size={24} color="#f77f00" />,
      title: "Personalized Patient Salutation",
      desc: "Automatically addresses each patient by their first name from your clinic Excel sheet for a genuine bedside follow-up touch."
    },
    {
      icon: <HeartPulse size={24} color="#ef476f" />,
      title: "High Click-Through Design",
      desc: "Carefully structured WhatsApp message copy that patients feel touched to receive after their treatment or consultation."
    },
    {
      icon: <Sparkles size={24} color="#a78bfa" />,
      title: "No Developer or API Setup Needed",
      desc: "Runs directly from your standard WhatsApp account via QR scan. Zero subscription fees, zero Meta Cloud API approval delays."
    }
  ];

  return (
    <section id="features" style={{ padding: '80px 32px 40px', maxWidth: '1240px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>
          Why Leading Doctors & Clinics Rely on <span className="hero-gradient-text">RevU GEN</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '650px', margin: '0 auto' }}>
          Turn every successful consultation into a lasting digital reputation asset on Google Maps without risking your WhatsApp account.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {featureList.map((f, i) => (
          <div key={i} className="glass-panel" style={{ padding: '28px', textAlign: 'left' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
              {f.title}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
