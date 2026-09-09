import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How does the WhatsApp Anti-Ban security system protect my clinic's number?",
      a: "Our Anti-Ban engine uses 4 concurrent layers of defense: (1) Delay Jitter: instead of sending at predictable robotic speeds, messages pause between 15-30 seconds with random variation; (2) Human Typing Presence: WhatsApp receives a 'composing' signal for 2-4 seconds prior to dispatch; (3) Dynamic Spintax & Template Rotation: messages randomly cycle between your 1 to 5 selected templates with varied greetings; (4) Batch Cool-Downs: the system pauses automatically after batches of 15 messages to simulate organic clinic desk behavior."
    },
    {
      q: "How many templates should I select in Step 2?",
      a: "We recommend selecting at least 3 to 5 templates. The more templates you enable, the higher the linguistic diversity of your messages, virtually eliminating repetitive spam flags."
    },
    {
      q: "Where do I get my clinic's Google Business Review shortlink?",
      a: "Log into Google Business Profile (search 'my business' on Google while logged into your clinic's Google account). Click on the 'Ask for reviews' button, and copy the short link (e.g., https://g.page/r/your-code/review). Paste that into Step 2!"
    },
    {
      q: "What Excel file format is required?",
      a: "You can upload standard .xlsx, .xls, or .csv files exported from your clinic software or spreadsheet. The system automatically finds columns named 'Phone', 'Mobile', 'Contact', 'Patient', or 'Name'. You can also download our 1-click Sample Excel file in Step 3."
    },
    {
      q: "How many review requests should a clinic send per day?",
      a: "For established clinic numbers that already chat with patients, 50 to 100 requests per day is a very safe and effective rhythm. If your clinic WhatsApp number is brand new, start with 20 to 30 requests per day for the first 2 weeks."
    }
  ];

  return (
    <section id="faq" style={{ padding: '60px 32px', maxWidth: '900px', margin: '0 auto 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(0, 180, 216, 0.1)', borderRadius: '50%', marginBottom: '12px', color: '#00b4d8' }}>
          <HelpCircle size={24} />
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          Frequently Asked Questions
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Everything doctors and clinic administrators need to know about secure patient review automation.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {faqs.map((f, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className="glass-panel" 
              style={{ padding: '18px 24px', textAlign: 'left', cursor: 'pointer', border: isOpen ? '1px solid var(--border-active)' : '1px solid var(--border-color)' }}
              onClick={() => setOpenIndex(isOpen ? -1 : idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: isOpen ? '#38bdf8' : '#ffffff' }}>
                  {f.q}
                </h4>
                {isOpen ? <ChevronUp size={18} color="#38bdf8" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </div>
              {isOpen && (
                <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.65' }}>
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
