// Advisor Contact Configuration & Link Generators

export const ADVISOR_NAME = 'SV Praveen';
export const ADVISOR_TITLE = 'Authorized Institutional Channel Partner';
export const ADVISOR_RERA = 'PRM/KA/RERA/1251/310/AG/260916/007810';

// Contact numbers configurable via Environment Variables with default fallback to +91 97406 09562
export const ADVISOR_PHONE = process.env.NEXT_PUBLIC_ADVISOR_PHONE || '+919740609562';
export const ADVISOR_PHONE_DISPLAY = process.env.NEXT_PUBLIC_ADVISOR_PHONE_DISPLAY || '+91 97406 09562';
export const ADVISOR_WHATSAPP = process.env.NEXT_PUBLIC_ADVISOR_WHATSAPP || '919740609562';
export const ADVISOR_EMAIL = process.env.NEXT_PUBLIC_ADVISOR_EMAIL || 'advisory@estatenav.in';

/**
 * Generate a pre-filled direct WhatsApp link for a specific property or general inquiry
 */
export function getWhatsAppUrl(property?: { name: string; microMarket?: string; priceDisplay?: string } | null): string {
  const cleanNumber = ADVISOR_WHATSAPP.replace(/[^0-9]/g, '');
  const base = `https://wa.me/${cleanNumber}`;

  if (!property) {
    const text = encodeURIComponent(
      `Hi ${ADVISOR_NAME}, I am browsing EstateNav and would like to speak with an institutional advisor regarding verified allocations in Bengaluru.`
    );
    return `${base}?text=${text}`;
  }

  const text = encodeURIComponent(
    `Hi ${ADVISOR_NAME}, I am interested in ${property.name} (${property.microMarket || 'Bengaluru'}, ${property.priceDisplay || 'Direct Pricing'}). Please share floor plans, availability and the official developer pricing sheet.`
  );
  return `${base}?text=${text}`;
}

/**
 * Generate a direct mailto link for a specific property
 */
export function getEmailUrl(property?: { name: string; microMarket?: string; priceDisplay?: string } | null): string {
  if (!property) {
    const subject = encodeURIComponent('EstateNav Advisory Inquiry - Bengaluru Real Estate');
    const body = encodeURIComponent(
      `Hello ${ADVISOR_NAME},\n\nI am looking for verified primary allocations in Bengaluru. Please reach out to me with available inventory options.\n\nThank you.`
    );
    return `mailto:${ADVISOR_EMAIL}?subject=${subject}&body=${body}`;
  }

  const subject = encodeURIComponent(`Inquiry: ${property.name} - EstateNav Direct Allocation`);
  const body = encodeURIComponent(
    `Hello ${ADVISOR_NAME},\n\nI am reviewing ${property.name} (${property.microMarket || 'Bengaluru'}) listed on EstateNav at ${property.priceDisplay || 'guide price'}.\n\nPlease send me the verified allocation deck, latest master layout, and direct developer payment schedule.\n\nThank you.`
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
