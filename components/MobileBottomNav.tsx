'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Search, Phone, MessageCircle } from 'lucide-react';
import { getTelUrl, getWhatsAppUrl, ADVISOR_NAME } from '@/lib/contact';

export function MobileBottomNav() {
  const whatsappUrl = getWhatsAppUrl();
  const telUrl = getTelUrl();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#E5E2DC] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] safe-bottom-dock">
      <nav aria-label="Mobile quick actions" className="grid grid-cols-4 items-center h-16 px-1">
        
        {/* 1. Home */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-1 text-[#5B6470] hover:text-[#047857] active:scale-95 transition-transform h-full"
        >
          <Home className="h-5 w-5" />
          <span className="text-[11px] font-medium leading-none">Home</span>
        </Link>

        {/* 2. Search / Explore */}
        <Link
          href="/properties"
          className="flex flex-col items-center justify-center gap-1 text-[#047857] active:scale-95 transition-transform h-full"
        >
          <Search className="h-5 w-5" />
          <span className="text-[11px] font-semibold leading-none">Explore</span>
        </Link>

        {/* 3. Direct WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`WhatsApp Advisor ${ADVISOR_NAME}`}
          className="flex flex-col items-center justify-center gap-1 text-[#047857] active:scale-95 transition-transform h-full"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0FDF4] text-[#047857]">
            <MessageCircle className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold leading-none text-[#047857]">WhatsApp</span>
        </a>

        {/* 4. Direct Call */}
        <a
          href={telUrl}
          title={`Call Advisor ${ADVISOR_NAME}`}
          className="flex flex-col items-center justify-center gap-1 text-[#1A1E23] hover:text-[#047857] active:scale-95 transition-transform h-full"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1E23] text-white">
            <Phone className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-semibold leading-none">Call</span>
        </a>

      </nav>
    </div>
  );
}

