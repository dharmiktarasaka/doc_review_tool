/**
 * 5 Pre-crafted SEO-friendly, high-converting Doctor Clinic review templates
 * Includes spintax formatting {option1|option2} and dynamic placeholders:
 * {{patient_name}}, {{doctor_name}}, {{clinic_name}}, {{review_link}}
 */

export const DEFAULT_DOCTOR_TEMPLATES = [
  {
    id: 1,
    title: "Compassionate Care & Quick Recovery (SEO Focus)",
    category: "General Practice / Specialist",
    description: "Emphasizes doctor bedside manners, patient comfort, and speedy recovery.",
    text: `*{{clinic_name}} - Patient Care Desk* 🩺

{Namaste|Hello|Dear} {{patient_name}},

{We truly hope you are recovering well and feeling much better!|We trust you are on your way to a speedy recovery!} 

Your health, comfort, and safety are our highest priorities. It was our privilege to assist you during your recent visit with *{{doctor_name}}*.

🌟 *Could you spare 30 seconds to share your valuable experience?*
Your kind words help other families in our community find trusted and compassionate healthcare:

👉 *Leave a 5-Star Google Review:* 
{{review_link}}

Wishing you vibrant health and happiness! 🌿
*Team {{clinic_name}}*`
  },
  {
    id: 2,
    title: "Experienced Diagnosis & Trusted Treatment (SEO Focus)",
    category: "Expertise & Trust",
    description: "Focuses on doctor experience, clear explanations, and reliable treatment.",
    text: `*A Quick Follow-up from {{clinic_name}}* 🏥

{Dear|Hello|Greetings} {{patient_name}},

Thank you for choosing *{{clinic_name}}* for your medical consultation with *{{doctor_name}}*. 

We believe that {clear explanations and accurate treatment make all the difference in patient healing|transparency and expert medical advice lead to the best patient outcomes}.

⭐ *Help us spread the word!*
If you were satisfied with your diagnosis and treatment, please share your 5-star feedback on Google. It only takes a moment:

👉 *Click here to rate us:* 
{{review_link}}

Warm regards,
*{{doctor_name}} & Clinic Staff*`
  },
  {
    id: 3,
    title: "Clinic Cleanliness & Warm Staff Hospitality (SEO Focus)",
    category: "Facility & Service",
    description: "Highlights hygiene standards, zero waiting stress, and courteous staff.",
    text: `*Patient Experience Feedback | {{clinic_name}}* ✨

{Hello|Hi|Dear} {{patient_name}},

At *{{clinic_name}}*, we strive every day to provide a clean, peaceful, and hygienic healing environment with minimal waiting time.

We hope our staff and *{{doctor_name}}* made your visit as seamless and comfortable as possible.

📝 *Would you mind sharing a quick review on Google?*
Your honest review helps us maintain our gold standards of healthcare:

👉 *Share Your Review Here:* 
{{review_link}}

Thank you for trusting us with your well-being! 🙏`
  },
  {
    id: 4,
    title: "Family Healthcare & Lifelong Wellness (SEO Focus)",
    category: "Family Health",
    description: "Ideal for family clinics, pediatrics, dentistry, and multi-specialty setups.",
    text: `*{{clinic_name}} - Your Family Health Partner* 👨‍👩‍👧‍👦

{Dear|Hi|Warm greetings} {{patient_name}},

Taking care of you and your family's health is at the heart of everything we do at *{{clinic_name}}*. 

We would love to hear how your recent appointment with *{{doctor_name}}* went!

✨ *Support our clinic on Google:*
By sharing a short review, you help our community discover dedicated healthcare professionals when they need it most:

⭐ *Tap here to review:* 
{{review_link}}

Stay healthy, stay blessed! 
*{{clinic_name}} Team*`
  },
  {
    id: 5,
    title: "Prompt Appointment & Smooth Experience (SEO Focus)",
    category: "Quick & Direct",
    description: "Concise, friendly message for busy patients, high click-through rate.",
    text: `*Thank You for Visiting {{clinic_name}}!* 🩺

{Hello|Dear} {{patient_name}},

Thank you for your visit today with *{{doctor_name}}*. We hope your appointment was smooth, punctual, and helpful!

🌟 If you had a positive experience, we would deeply appreciate a 5-star Google rating. It takes less than 20 seconds:

👉 *Google Review Link:* 
{{review_link}}

Thank you for your support and trust!
*{{clinic_name}}*`
  }
];

/**
 * Parses spintax strings like "{Hello|Hi|Dear}" into one random option
 */
export function resolveSpintax(text) {
  if (!text) return "";
  const spintaxRegex = /\{([^{}]+)\}/g;
  let matchesFound = true;
  let resolved = text;
  
  // Resolve nested or repeated spintax
  while (matchesFound) {
    const matches = resolved.match(spintaxRegex);
    if (!matches) {
      matchesFound = false;
      break;
    }
    resolved = resolved.replace(spintaxRegex, (_, choices) => {
      const parts = choices.split("|");
      const chosen = parts[Math.floor(Math.random() * parts.length)];
      return chosen || "";
    });
  }
  return resolved;
}

/**
 * Hydrates template placeholders and spintax for a specific recipient
 */
export function formatReviewMessage(templateText, vars = {}) {
  let message = templateText || "";
  
  const patientName = vars.patient_name || vars.name || "Valued Patient";
  const doctorName = vars.doctor_name || "Doctor";
  const clinicName = vars.clinic_name || "Our Clinic";
  const reviewLink = vars.review_link || "https://g.page/r/your-google-review-link";

  message = message
    .replace(/\{\{patient_name\}\}/gi, patientName)
    .replace(/\{\{doctor_name\}\}/gi, doctorName)
    .replace(/\{\{clinic_name\}\}/gi, clinicName)
    .replace(/\{\{review_link\}\}/gi, reviewLink);

  // Finally resolve any spintax
  return resolveSpintax(message);
}
