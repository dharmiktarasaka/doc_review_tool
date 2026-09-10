/**
 * 10 High-converting, SEO-optimized 5-Star Google Review templates for Doctor Clinics
 * Supports dynamic placeholders: {{doctor_name}}, {{clinic_name}}
 */

export const DEFAULT_GOOGLE_REVIEWS = [
  {
    id: 1,
    category: "Doctor Expertise & Consultation",
    title: "Accurate Diagnosis & Compassionate Care",
    text: "I had a wonderful experience with Dr. {{doctor_name}} at {{clinic_name}}. The doctor was extremely thorough, listened to all my health concerns patiently, and explained the diagnosis in simple terms. Highly recommended for trusted healthcare!"
  },
  {
    id: 2,
    category: "Clinic Cleanliness & Staff",
    title: "Spotless Clinic & Friendly Hospitality",
    text: "Very impressed with the hygiene and cleanliness at {{clinic_name}}. The staff was courteous and helpful from reception to consultation. Dr. {{doctor_name}} is polite, attentive, and genuinely cares about patients. 5 stars without hesitation!"
  },
  {
    id: 3,
    category: "Fast Recovery & Treatment",
    title: "Effective Treatment & Quick Relief",
    text: "Dr. {{doctor_name}} is an exceptional physician. The treatment prescribed started showing positive results within just a couple of days. The staff at {{clinic_name}} was also very professional and punctual. Thank you so much!"
  },
  {
    id: 4,
    category: "Genuine Medical Advice",
    title: "Honest Guidance Without Extra Tests",
    text: "What I appreciate most about Dr. {{doctor_name}} is the honest and transparent approach. No unnecessary investigations or medications were prescribed. Truly one of the most reliable and ethical doctors in our area. Visit {{clinic_name}} for top care!"
  },
  {
    id: 5,
    category: "Zero Waiting & Punctuality",
    title: "Smooth Appointment & Prompt Attention",
    text: "My consultation with Dr. {{doctor_name}} was seamless from start to finish. We barely had to wait, and the appointment was on time. Dr. {{doctor_name}} took time to answer all questions with great patience. Excellent clinic setup at {{clinic_name}}!"
  },
  {
    id: 6,
    category: "Family & Senior Friendly",
    title: "Very Supportive & Comforting Care",
    text: "Visited {{clinic_name}} with my family. Dr. {{doctor_name}} treated us with so much respect, empathy, and warmth. The clinic ambiance is calm and reassuring. We feel very fortunate to have found such a skilled doctor."
  },
  {
    id: 7,
    category: "Bedside Manners & Empathy",
    title: "Warm Bedside Manners & Clear Explanations",
    text: "Dr. {{doctor_name}} has amazing bedside manners and made me feel completely relaxed during the checkup. The clinic staff at {{clinic_name}} is polite and well-organized. Great follow-up support as well. Highly satisfied!"
  },
  {
    id: 8,
    category: "Modern Equipment & Facilities",
    title: "Modern Healthcare & Courteous Team",
    text: "State-of-the-art clinic facilities with a warm and welcoming team at {{clinic_name}}. Dr. {{doctor_name}} is deeply knowledgeable, experienced, and very reassuring. Five stars for top-notch medical attention!"
  },
  {
    id: 9,
    category: "Specialist Care & Precision",
    title: "Knowledgeable Diagnosis & Reliable Results",
    text: "Thank you Dr. {{doctor_name}} for the accurate diagnosis and prompt relief! The treatment plan was easy to follow and very effective. {{clinic_name}} maintains very high medical standards. Best clinic experience so far!"
  },
  {
    id: 10,
    category: "Overall Patient Satisfaction",
    title: "10/10 Experience, Strongly Recommended",
    text: "Outstanding service and medical care by Dr. {{doctor_name}} at {{clinic_name}}. Every visit has been smooth, professional, and reassuring. If you are looking for an experienced and kind doctor, this is the place to go!"
  }
];

export function formatGoogleReview(text, { doctor_name, clinic_name }) {
  if (!text) return '';
  return text
    .replace(/\{\{doctor_name\}\}/gi, doctor_name || 'the doctor')
    .replace(/\{\{clinic_name\}\}/gi, clinic_name || 'the clinic');
}
