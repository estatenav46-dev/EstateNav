'use client';

import React from 'react';
import { Handshake, Award, ShieldCheck, Building, FileCheck2, ArrowRight } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/contact';

interface DeveloperTrustBannerProps {
  onUnlockPricing: () => void;
}

export const DeveloperTrustBanner: React.FC<DeveloperTrustBannerProps> = ({
  onUnlockPricing,
}) => {
  return (
    <section id="trust-mandate" className="py-10 sm:py-16 bg-[#030712] border-b border-white/[0.08] relative overflow-hidden bg-tech-grid">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start">

          <div className="lg:col-span-5 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center space-x-2 text-[10px] sm:text-[11px] font-mono font-medium text-brand-300 bg-brand-500/[0.07] px-3 py-1 rounded-[4px] border border-brand-500/25 tracking-wider uppercase">
              <Handshake className="w-3.5 h-3.5" />
              <span>Direct Developer Mandate</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-[1.12]">
              Institutional Grade Advisory
              <span className="block text-slate-300 text-xl sm:text-3xl font-semibold mt-1">Built for Bengaluru&apos;s Urban Leaders.</span>
            </h2>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              Direct developer terms guarantee institutional price transparency, zero brokerage overheads, and prioritized allocation for primary high-demand residential and plotted corridors.
            </p>

            <div className="grid grid-cols-3 gap-0 border border-white/[0.08] rounded-[6px] overflow-hidden">
              <div className="p-3 sm:p-5 text-center border-r border-white/[0.08] bg-[#060b14]">
                <span className="text-xl sm:text-3xl font-black text-brand-400 font-mono block">15+</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1 block">Years Track<br/>Record</span>
              </div>
              <div className="p-3 sm:p-5 text-center border-r border-white/[0.08] bg-[#060b14]">
                <span className="text-xl sm:text-3xl font-black text-brand-400 font-mono block">3.5M+</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1 block">Sq.Ft<br/>Delivered</span>
              </div>
              <div className="p-3 sm:p-5 text-center bg-[#060b14]">
                <span className="text-xl sm:text-3xl font-black text-brand-400 font-mono block">Mivan</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1 block">Formwork<br/>Tech</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={onUnlockPricing}
                className="btn-primary px-5 py-3 space-x-2 text-xs sm:text-sm font-bold flex items-center justify-center"
              >
                <span>Unlock Direct Developer Pricing</span>
                <ArrowRight className="w-4 h-4 text-canvas-950 stroke-[2.5]" />
              </button>

              <a
                href={getWhatsAppUrl(null)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-4 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center text-[#25D366]"
              >
                <span>Chat with Advisor</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.08] border border-white/[0.08] rounded-[8px] overflow-hidden">

            <div className="p-4 sm:p-6 bg-[#070b13] hover:bg-[#0a0f1b] transition-colors space-y-2.5 group">
              <div className="w-9 h-9 rounded-[6px] bg-brand-500/[0.08] border border-brand-500/25 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/15 transition-colors">
                <ShieldCheck className="w-4 h-4 stroke-[1.8]" />
              </div>
              <h3 className="font-bold text-sm text-white tracking-tight">100% Legal &amp; Title Clear</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete A-Khata, BBMP &amp; BDA sanctioned plans with digitized Kaveri 2.0 encumbrance audit dossiers.
              </p>
            </div>

            <div className="p-4 sm:p-6 bg-[#070b13] hover:bg-[#0a0f1b] transition-colors space-y-2.5 group">
              <div className="w-9 h-9 rounded-[6px] bg-brand-500/[0.08] border border-brand-500/25 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/15 transition-colors">
                <Building className="w-4 h-4 stroke-[1.8]" />
              </div>
              <h3 className="font-bold text-sm text-white tracking-tight">Integrated Townships</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Biophilic masterplans with 75%+ open greenery, golf zones, and integrated sports ecosystems.
              </p>
            </div>

            <div className="p-4 sm:p-6 bg-[#070b13] hover:bg-[#0a0f1b] transition-colors space-y-2.5 group">
              <div className="w-9 h-9 rounded-[6px] bg-brand-500/[0.08] border border-brand-500/25 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/15 transition-colors">
                <FileCheck2 className="w-4 h-4 stroke-[1.8]" />
              </div>
              <h3 className="font-bold text-sm text-white tracking-tight">Bank APF Pre-Approved</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-approved home loan codes across HDFC, ICICI, and SBI for expedited closing.
              </p>
            </div>

            <div className="p-4 sm:p-6 bg-[#070b13] hover:bg-[#0a0f1b] transition-colors space-y-2.5 group">
              <div className="w-9 h-9 rounded-[6px] bg-brand-500/[0.08] border border-brand-500/25 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/15 transition-colors">
                <Award className="w-4 h-4 stroke-[1.8]" />
              </div>
              <h3 className="font-bold text-sm text-white tracking-tight">Zero Brokerage Guarantee</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct buyer-developer onboarding — no hidden commissions, genuine pre-launch pricing privileges.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
