'use client';

import React, { useState } from 'react';
import { Home, Calculator, MessageCircle, Phone, Mail, X } from 'lucide-react';
import { ADVISOR_NAME, ADVISOR_PHONE_DISPLAY, getWhatsAppUrl, getEmailUrl, getTelUrl } from '@/lib/contact';

interface MobileBottomNavProps {
  onOpenVipModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenVipModal,
}) => {
  const [activeDrawer, setActiveDrawer] = useState<'calc' | null>(null);

  // Calc state
  const [propValLakhs, setPropValLakhs] = useState<number>(135);
  const [dpPct, setDpPct] = useState<number>(20);
  const [tenure, setTenure] = useState<number>(20);

  const loanPrincipal = propValLakhs * (1 - dpPct / 100) * 100000;
  const rate = tenure === 15 ? 0.084 : tenure === 25 ? 0.0855 : 0.0845;
  const monthlyRate = rate / 12;
  const totalMonths = tenure * 12;
  const emi = Math.round(
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
  const duty = (propValLakhs * 0.056).toFixed(2);
  const reg  = (propValLakhs * 0.01).toFixed(2);

  const scrollToWorkspace = () => {
    const el = document.getElementById('workspace');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappGeneral = getWhatsAppUrl(null);
  const emailGeneral = getEmailUrl(null);
  const telLink = getTelUrl();

  return (
    <>
      {/* FIXED MOBILE BOTTOM DOCK WITH DIRECT 1-TAP CONTACT */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#040810]/98 backdrop-blur-xl border-t border-white/[0.12] px-3 py-1.5 flex justify-between items-center text-[10px] text-slate-400 shadow-2xl">

        {/* 1. Explore Listings */}
        <button
          onClick={scrollToWorkspace}
          className="flex flex-col items-center justify-center gap-0.5 text-brand-400 font-bold p-1 min-w-[54px] active:scale-95 transition-transform"
        >
          <Home className="w-4 h-4 text-brand-400" />
          <span>Listings</span>
        </button>

        {/* 2. Direct WhatsApp (Green CTA) */}
        <a
          href={whatsappGeneral}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 text-[#25D366] font-bold p-1 min-w-[54px] active:scale-95 transition-transform"
          title="Direct WhatsApp with Advisor"
        >
          <MessageCircle className="w-4 h-4 fill-current/10" />
          <span>WhatsApp</span>
        </a>

        {/* 3. Direct Phone Call */}
        <a
          href={telLink}
          className="flex flex-col items-center justify-center gap-0.5 text-white font-semibold p-1 min-w-[54px] active:scale-95 transition-transform"
          title="Call Advisor SV Praveen"
        >
          <Phone className="w-4 h-4 text-brand-400" />
          <span>Call</span>
        </a>

        {/* 4. Direct Email */}
        <a
          href={emailGeneral}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-300 font-semibold p-1 min-w-[54px] active:scale-95 transition-transform"
          title="Email Advisor"
        >
          <Mail className="w-4 h-4 text-brand-400" />
          <span>Email</span>
        </a>

        {/* 5. Quick Calculator */}
        <button
          onClick={() => setActiveDrawer('calc')}
          className="flex flex-col items-center justify-center gap-0.5 hover:text-white transition-colors p-1 min-w-[54px] active:scale-95"
        >
          <Calculator className="w-4 h-4 text-slate-400" />
          <span>EMI Calc</span>
        </button>

      </nav>

      {/* EMI CALCULATOR DRAWER */}
      {activeDrawer && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/75 backdrop-blur-sm flex items-end animate-in fade-in duration-150"
          onClick={() => setActiveDrawer(null)}
        >
          <div
            className="w-full bg-[#080d16] border-t border-white/[0.14] rounded-t-[10px] p-5 space-y-4 max-h-[88vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Handle */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto" />

            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-black text-white text-base">
                  Financial &amp; Statutory Studio
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Advisor: {ADVISOR_NAME} · Kaveri 2.0 Benchmarked</p>
              </div>
              <button
                onClick={() => setActiveDrawer(null)}
                className="btn-ghost p-1.5"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 text-xs">
              
              {/* Target Property Slider */}
              <div>
                <div className="flex justify-between font-bold mb-1.5">
                  <span className="text-slate-400 uppercase font-mono text-[10px]">Target Property Value</span>
                  <span className="text-brand-400 font-mono text-sm font-black">₹{(propValLakhs / 100).toFixed(2)} Cr</span>
                </div>
                <input
                  type="range"
                  min={60} max={350} step={5}
                  value={propValLakhs}
                  onChange={(e) => setPropValLakhs(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>₹60 L</span><span>₹2.0 Cr</span><span>₹3.5 Cr</span>
                </div>
              </div>

              {/* Down Payment Toggles */}
              <div>
                <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Down Payment Allocation
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {[10, 20, 30].map((p) => (
                    <button
                      key={p}
                      onClick={() => setDpPct(p)}
                      className={`py-2 rounded-[4px] font-bold text-xs transition-all ${
                        dpPct === p
                          ? 'bg-brand-500 text-[#030712] font-black shadow'
                          : 'bg-[#040810] text-slate-300 border border-white/[0.08]'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Loan Tenure Toggles */}
              <div>
                <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tenure Horizon
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {[15, 20, 25].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTenure(t)}
                      className={`py-2 rounded-[4px] font-bold text-xs transition-all ${
                        tenure === t
                          ? 'bg-brand-500 text-[#030712] font-black shadow'
                          : 'bg-[#040810] text-slate-300 border border-white/[0.08]'
                      }`}
                    >
                      {t} Yrs
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Grid */}
              <div className="rounded-[6px] overflow-hidden border border-white/[0.06] bg-white/[0.06] grid grid-cols-2 gap-px pt-1">
                {[
                  { label: 'Est. Monthly EMI',  value: `₹${emi.toLocaleString('en-IN')}/mo`, accent: false },
                  { label: 'Stamp Duty (5.6%)', value: `₹${duty} L`,                         accent: false },
                  { label: 'Registration (1%)', value: `₹${reg} L`,                           accent: false },
                  { label: 'Tax Offset',         value: '₹2.0L / yr',                         accent: true  },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="bg-[#07090f] p-3 text-center">
                    <span className="block text-[9px] text-slate-500 uppercase font-mono">{label}</span>
                    <span className={`text-xs font-black font-mono mt-0.5 block ${accent ? 'text-brand-400' : 'text-white'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={whatsappGeneral}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 py-2.5 rounded-[6px] font-bold text-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Quote</span>
                </a>
                <button
                  onClick={() => setActiveDrawer(null)}
                  className="btn-primary py-2.5 text-xs font-bold"
                >
                  Done
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};
