'use client';

import { setSettingsWhatsApp } from '@/lib/contact';

/** Records the official WhatsApp number from the site settings for every WhatsApp link. Rendered
 *  first in the body, so it runs before the links (on the server and in the browser). */
export function ContactSync({ whatsapp }: { whatsapp: string }) {
  setSettingsWhatsApp(whatsapp);
  return null;
}
