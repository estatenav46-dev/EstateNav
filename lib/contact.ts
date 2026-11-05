// Advisor Contact Configuration & Link Generators

export const ADVISOR_NAME = 'SV Praveen';
export const ADVISOR_TITLE = 'K-RERA registered agent';
export const ADVISOR_RERA = 'PRM/KA/RERA/1251/310/AG/260916/007810';

// Contact numbers configurable via Environment Variables with default fallback to +91 97406 09562
export const ADVISOR_PHONE = process.env.NEXT_PUBLIC_ADVISOR_PHONE || '+919740609562';
export const ADVISOR_PHONE_DISPLAY = process.env.NEXT_PUBLIC_ADVISOR_PHONE_DISPLAY || '+91 97406 09562';
export const ADVISOR_WHATSAPP = process.env.NEXT_PUBLIC_ADVISOR_WHATSAPP || '919740609562';
export const ADVISOR_EMAIL = process.env.NEXT_PUBLIC_ADVISOR_EMAIL || 'advisory@estatenav.in';

/**
 * Generate a pre-filled direct WhatsApp link for a specific property or general inquiry
 */
type ContactProperty = { title: string; locality?: string; priceLabel?: string };

export function getWhatsAppUrl(property?: ContactProperty | null): string {
  const cleanNumber = ADVISOR_WHATSAPP.replace(/[^0-9]/g, '');
  const base = `https://wa.me/${cleanNumber}`;

  if (!property) {
    const text = encodeURIComponent(
      `Hi ${ADVISOR_NAME}, I am browsing EstateNav and would like to discuss homes, plots or workspaces in Bengaluru.`
    );
    return `${base}?text=${text}`;
  }

  const text = encodeURIComponent(
    `Hi ${ADVISOR_NAME}, I am interested in ${property.title} (${property.locality || 'Bengaluru'}, ${property.priceLabel || 'Direct Pricing'}). Please share floor plans, availability and the official developer pricing sheet.`
  );
  return `${base}?text=${text}`;
}

/**
 * Generate a direct mailto link for a specific property
 */
export function getEmailUrl(property?: ContactProperty | null): string {
  if (!property) {
    const subject = encodeURIComponent('EstateNav Advisory Inquiry - Bengaluru Real Estate');
    const body = encodeURIComponent(
      `Hello ${ADVISOR_NAME},\n\nI am looking for a property in Bengaluru. Please contact me to discuss available listings.\n\nThank you.`
    );
    return `mailto:${ADVISOR_EMAIL}?subject=${subject}&body=${body}`;
  }

  const subject = encodeURIComponent(`Property enquiry: ${property.title} - EstateNav`);
  const body = encodeURIComponent(
    `Hello ${ADVISOR_NAME},\n\nI am reviewing ${property.title} (${property.locality || 'Bengaluru'}) listed on EstateNav at ${property.priceLabel || 'guide price'}. Please contact me with more information.\n\nThank you.`
  );
  return `mailto:${ADVISOR_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Generate direct tel link
 */
export function getTelUrl(): string {
  const cleanTel = ADVISOR_PHONE.replace(/[^0-9+]/g, '');
  return `tel:${cleanTel}`;
}

export function whatsAppLink(text: string, number = ADVISOR_WHATSAPP): string {
  return `https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
}

/** Prefilled WhatsApp message naming the project and linking to it. */
export function propertyWhatsApp(project: { title: string; url: string }, number = ADVISOR_WHATSAPP): string {
  return whatsAppLink(`Hi ${ADVISOR_NAME}, I'd like details on ${project.title}: ${project.url} — floor plans, availability and the developer price sheet, please.`, number);
}
