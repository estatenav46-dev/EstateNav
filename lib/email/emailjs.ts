import type { Enquiry } from '@/lib/data/types';

interface EmailJSResponse {
  status: number;
  text: string;
}

export async function sendEnquiryEmailNotification(enquiry: Enquiry): Promise<boolean> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY; // Optional private key if enabled in EmailJS

  if (!serviceId || !templateId || !publicKey) {
    console.log('[EmailJS] Skipped email notification: EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, or EMAILJS_PUBLIC_KEY not set in environment.');
    return false;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://estatenav.in';
  const cleanPhone = enquiry.phone.replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hi ${enquiry.name}, thank you for contacting EstateNav regarding ${enquiry.propertyTitle || 'Hyderabad properties'}.`
  )}`;

  const templateParams = {
    buyer_name: enquiry.name,
    buyer_phone: enquiry.phone,
    buyer_email: enquiry.email || 'Not provided',
    intent: enquiry.intent.replace('-', ' ').toUpperCase(),
    preferred_date: enquiry.preferredDate ? new Date(enquiry.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible / ASAP',
    property_title: enquiry.propertyTitle || 'General Hyderabad Advisory',
    property_url: enquiry.propertySlug ? `${siteUrl}/properties/${enquiry.propertySlug}` : siteUrl,
    message: enquiry.message || 'None provided.',
    source: enquiry.source,
    whatsapp_link: waLink,
    submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
  };

  try {
    const payload: Record<string, unknown> = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    };

    if (privateKey) {
      payload.accessToken = privateKey;
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EmailJS] Failed to send email (status ${response.status}):`, errorText);
      return false;
    }

    console.log(`[EmailJS] Email notification successfully sent for inquiry ${enquiry.id}`);
    return true;
  } catch (error) {
    console.error('[EmailJS] Network error while sending email notification:', error);
    return false;
  }
}

