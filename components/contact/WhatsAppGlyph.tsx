import Image from 'next/image';

/** The official WhatsApp logo (full colour; from the open-source Iconify "logos" set). */
export function WhatsAppGlyph({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <Image src="/icons/whatsapp.svg" alt="" width={size} height={size} unoptimized aria-hidden="true" className={`shrink-0 ${className}`} />;
}
