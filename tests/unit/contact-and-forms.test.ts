import { describe, expect, it } from 'vitest';
import { LIST_PROPERTY_MESSAGE, LIST_PROPERTY_PATH, listPropertyWhatsApp, whatsAppLink } from '@/lib/contact';
import { enquiryInputSchema, visitorLeadSchema } from '@/lib/data/schemas';

describe('WhatsApp links', () => {
  it('keeps only digits in the number and encodes the text', () => {
    const href = whatsAppLink('Hi & hello?', '+91 98765-43210');
    expect(href.startsWith('https://wa.me/919876543210?text=')).toBe(true);
    expect(decodeURIComponent(href.split('text=')[1])).toBe('Hi & hello?');
  });

  it('sends the list-your-property starter text', () => {
    const text = decodeURIComponent(listPropertyWhatsApp('919876543210').split('text=')[1]);
    expect(text.startsWith("Hi EstateNav, I'd like to list my property")).toBe(true);
    expect(text).toContain('Expected price:');
    expect(LIST_PROPERTY_PATH).toBe('/contact?intent=list-property');
    expect(LIST_PROPERTY_MESSAGE.length).toBeLessThan(1000); // fits the message field
  });
});

const valid = { name: 'Asha Rao', phone: '9876543210', intent: 'site-visit', source: 'contact', consentVersion: 'v1' };

describe('enquiry form validation', () => {
  it('accepts a normal enquiry', () => {
    expect(enquiryInputSchema.safeParse(valid).success).toBe(true);
  });

  it.each(['+91 98765 43210', '91-9876543210', '98765-43210'])('normalises the mobile number %s', (phone) => {
    const r = enquiryInputSchema.safeParse({ ...valid, phone });
    expect(r.success && r.data.phone).toBe('9876543210');
  });

  it.each(['12345', '5876543210', 'abcdefghij', '98765432101', ''])('rejects the mobile number "%s"', (phone) => {
    expect(enquiryInputSchema.safeParse({ ...valid, phone }).success).toBe(false);
  });

  it('rejects a one-letter or overlong name', () => {
    expect(enquiryInputSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false);
    expect(enquiryInputSchema.safeParse({ ...valid, name: 'A'.repeat(81) }).success).toBe(false);
  });

  it('treats an empty email as none, and rejects a bad one', () => {
    const r = enquiryInputSchema.safeParse({ ...valid, email: '' });
    expect(r.success && r.data.email).toBeNull();
    expect(enquiryInputSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('caps the message at 1000 characters', () => {
    expect(enquiryInputSchema.safeParse({ ...valid, message: 'x'.repeat(1000) }).success).toBe(true);
    expect(enquiryInputSchema.safeParse({ ...valid, message: 'x'.repeat(1001) }).success).toBe(false);
  });

  it('rejects an unknown enquiry type (list-property is sent as general)', () => {
    expect(enquiryInputSchema.safeParse({ ...valid, intent: 'list-property' }).success).toBe(false);
    expect(enquiryInputSchema.safeParse({ ...valid, intent: 'general', message: LIST_PROPERTY_MESSAGE }).success).toBe(true);
  });

  it('rejects bots that fill the hidden honeypot field', () => {
    expect(enquiryInputSchema.safeParse({ ...valid, website: 'spam.example' }).success).toBe(false);
  });

  it('rejects a preferred date that is not a date', () => {
    expect(enquiryInputSchema.safeParse({ ...valid, preferredDate: 'tomorrow' }).success).toBe(false);
    expect(enquiryInputSchema.safeParse({ ...valid, preferredDate: '2026-12-01' }).success).toBe(true);
  });
});

describe('welcome concierge validation', () => {
  const lead = { name: 'Ravi', phone: '+91 9876543210', goal: 'buy-home', region: 'east', budget: '1-1.5', consentText: 'ok', consentVersion: 'v1', page: '/', utm: { source: null, medium: null, campaign: null } };

  it('accepts a complete answer and cleans the number', () => {
    const r = visitorLeadSchema.safeParse(lead);
    expect(r.success && r.data.phone).toBe('9876543210');
  });

  it('rejects unknown choices', () => {
    expect(visitorLeadSchema.safeParse({ ...lead, region: 'mars' }).success).toBe(false);
    expect(visitorLeadSchema.safeParse({ ...lead, budget: '10cr' }).success).toBe(false);
  });
});
