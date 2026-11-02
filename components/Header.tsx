'use client';

import React from 'react';
import { Compass, ShieldCheck, Calendar, Building2, Home, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Segment } from '@/lib/types';
import { getWhatsAppUrl, getTelUrl } from '@/lib/contact';

interface HeaderProps {
  currentSegment: Segment;
  onSegmentChange: (segment: Segment) => void;
  onOpenVipModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSegment,
  onSegmentChange,
  onOpenVipModal,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#030712]/95 backdrop-blur-md border-b border-white/[0.08] transition-colors">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Mark with Official Logo */}
        <div 
          onClick={() => onSegmentChange('residential')}
          className="flex items-center space-x-3.5 cursor-pointer group select-none"
        >
          <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-[8px] bg-[#070b13] border border-white/[0.14] overflow-hidden flex items-center justify-center shrink-0 group-hover:border-brand-500/50 transition-all shadow-md">
            <img
              src="/logo.png"
              alt="EstateNav Official Logo"
              className="w-full h-full object-cover transform scale-[1.04] group-hover:scale-110 transition-transform"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-logo font-black tracking-tight text-xl sm:text-2xl text-white">
                Estate<span className="text-brand-400">Nav</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                ADVISORY
              </span>
            </div>
            <span className="block text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-normal">
              Smart Investments, Better Living, Great Possibilities
            </span>
          </div>
        </div>

        {/* Global Segment Switcher (Desktop) */}
        <nav className="hidden md:flex bg-[#070b13] p-1 rounded-lg border border-white/[0.08] shadow-inner space-x-1">
          <button
            onClick={() => onSegmentChange('residential')}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold tracking-tight transition-all duration-150 flex items-center space-x-2 ${
              currentSegment === 'residential'
                ? 'bg-brand-500 text-canvas-950 font-bold shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Residential</span>
          </button>

          <button
            onClick={() => onSegmentChange('commercial')}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold tracking-tight transition-all duration-150 flex items-center space-x-2 ${
              currentSegment === 'commercial'
                ? 'bg-brand-500 text-canvas-950 font-bold shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Commercial</span>
          </button>

          <button
            onClick={() => onSegmentChange('plotted')}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold tracking-tight transition-all duration-150 flex items-center space-x-2 ${
              currentSegment === 'plotted'
                ? 'bg-brand-500 text-canvas-950 font-bold shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Plotted</span>
          </button>
        </nav>

        {/* Header Utility CTAs */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Quick WhatsApp Advisor Link */}
          <a
            href={getWhatsAppUrl(null)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 px-2.5 sm:px-3 py-2 rounded-[6px] transition-colors"
            title="Chat with Advisor on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Quick Call */}
          <a
            href={getTelUrl()}
            className="flex sm:hidden items-center justify-center p-2 text-slate-200 bg-white/[0.05] border border-white/[0.1] rounded-[6px]"
            title="Call Advisor"
          >
            <Phone className="w-3.5 h-3.5 text-brand-400" />
          </a>

          <div className="hidden lg:inline-flex items-center text-[11px] font-mono font-medium text-brand-300 bg-brand-500/[0.07] px-3 py-1.5 rounded-[4px] border border-brand-500/25">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
            <span>Kaveri 2.0 Audited</span>
          </div>

          <button
            onClick={onOpenVipModal}
            className="btn-primary px-3 sm:px-4 py-2 sm:py-2.5 space-x-1.5 sm:space-x-2 text-xs sm:text-sm active:scale-[0.98]"
          >
            <Calendar className="w-3.5 h-3.5 text-canvas-950 stroke-[2.2]" />
            <span>Book Tour</span>
          </button>
        </div>

      </div>
    </header>
  );
};
