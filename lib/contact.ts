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
  const cleanNumber = officialWhatsApp().replace(/[^0-9]/g, '');
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

// The official WhatsApp number comes from the site settings (Admin → Settings → contact). The root
// layout records it here through <ContactSync>, so every link (server or browser) uses that number;
// ADVISOR_WHATSAPP is only the fallback before settings load.
let settingsWhatsApp: string | null = null;
export function setSettingsWhatsApp(number: string | null | undefined) {
  if (number && number.replace(/[^0-9]/g, '').length >= 10) settingsWhatsApp = number;
}
export const officialWhatsApp = () => settingsWhatsApp || ADVISOR_WHATSAPP;

export function whatsAppLink(text: string, number?: string): string {
  return `https://wa.me/${(number || officialWhatsApp()).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
}

/** What a project enquiry needs to say, so the advisor knows the project from the first message. */
export type EnquiryProject = {
  title: string;
  developerName?: string | null;
  locality?: string | null;
  corridorName?: string | null;
  configurations?: string[];
  price?: string | null;
  possession?: string | null;
  reraNumber?: string | null;
  url: string;
};

/** The prefilled WhatsApp message for one project: name, builder partner and the key facts. */
export function projectEnquiryText(p: EnquiryProject, agentName = ADVISOR_NAME): string {
  const place = [p.locality, p.corridorName].filter(Boolean).join(', ');
  const facts = [
    place ? `• Location: ${place}` : null,
    p.configurations?.length ? `• Options: ${p.configurations.slice(0, 6).join(', ')}` : null,
    p.price ? `• Price shown: ${p.price}` : null,
    p.possession ? `• Possession: ${p.possession}` : null,
    p.reraNumber ? `• K-RERA: ${p.reraNumber}` : null,
    `• Link: ${p.url}`,
  ].filter(Boolean);
  return [
    `Hi ${agentName}, I'm interested in ${p.title}${p.developerName ? ` by ${p.developerName}` : ''} (found on EstateNav).`,
    facts.join('\n'),
    'Please share availability, floor plans and the latest price sheet.',
  ].join('\n\n');
}

export function projectEnquiryLink(p: EnquiryProject, agentName?: string, number?: string): string {
  return whatsAppLink(projectEnquiryText(p, agentName), number);
}

/** Prefilled WhatsApp message naming the project and linking to it. */
export function propertyWhatsApp(project: { title: string; url: string }, number?: string): string {
  return whatsAppLink(`Hi ${ADVISOR_NAME}, I'd like details on ${project.title}: ${project.url} — floor plans, availability and the developer price sheet, please.`, number);
}
