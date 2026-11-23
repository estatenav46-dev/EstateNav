'use client';

import { useEffect } from 'react';
import { whatsAppTopicStore } from '@/lib/ui/stores';

/** Tells the header and floating WhatsApp buttons what this page is about (e.g. one project). */
export function WhatsAppTopic({ text }: { text: string }) {
  useEffect(() => {
    whatsAppTopicStore.set(text);
    return () => whatsAppTopicStore.set(null);
  }, [text]);
  return null;
}
