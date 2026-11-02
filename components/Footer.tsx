'use client';

import React from 'react';
import { ShieldCheck, ExternalLink, Building2, MapPin, Scale } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#040810] text-slate-400 text-xs border-t border-white/[0.08] pt-8 sm:pt-12 pb-24 md:pb-12">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6 sm:space-y-8">

        {/* 1. Header Brand Row with Enlarged Logo & Matching Logo Font */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-[8px] bg-[#070b13] border border-white/[0.14] overflow-hidden flex items-center justify-center shrink-0 shadow-md">
              <img
                src="/logo.png"
                alt="EstateNav Official Logo"
                className="w-full h-full object-cover transform scale-[1.04]"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-logo font-black tracking-tight text-xl sm:text-2xl text-white">
                  Estate<span className="text-brand-400">Nav</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                  ADVISORY
                </span>
              </div>
              <span className="block text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5 tracking-normal">
                Smart Investments, Better Living, Great Possibilities
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold bg-brand-500/[0.07] px-3 py-1.5 rounded-[4px] border border-brand-500/20">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Zero-Brokerage Mandate · Authorized Channel Partner</span>
          </div>
        </div>

        {/* 2. Compact 2 x 2 Format on Mobile / 4 Columns on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-6 border-b border-white/[0.08] text-xs">

          {/* Quadrant 1: Corridors */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-white font-mono font-bold text-[11px] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <h4>Corridors</h4>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="hover:text-white transition-colors cursor-pointer">Sarjapur - Varthur Link</li>
              <li className="hover:text-white transition-colors cursor-pointer">Whitefield &amp; EPIP Zone</li>
              <li className="hover:text-white transition-colors cursor-pointer">Outer Ring Road (ORR)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Hebbal &amp; North BLR</li>
              <li className="hover:text-white transition-colors cursor-pointer">Electronic City Phase 1</li>
            </ul>
          </div>

          {/* Quadrant 2: Featured Inventory */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-white font-mono font-bold text-[11px] uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-brand-400" />
              <h4>Featured Inventory</h4>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="hover:text-white transition-colors cursor-pointer">Codename New Dimension</li>
              <li className="hover:text-white transition-colors cursor-pointer">Abhee Celestial City</li>
              <li className="hover:text-white transition-colors cursor-pointer">Abhee Aaria (Gunjur)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Abhee Silicon Shine (Ph 2)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Abhee Tranquila Plots</li>
            </ul>
          </div>

          {/* Quadrant 3: Statutory Resources */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-white font-mono font-bold text-[11px] uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5 text-brand-400" />
              <h4>Statutory Tools</h4>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li>
                <a
                  href="https://rera.karnataka.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Karnataka RERA</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </a>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">Kaveri 2.0 Sub-Registrar</li>
              <li className="hover:text-white transition-colors cursor-pointer">Stamp Duty Calculator</li>
              <li className="hover:text-white transition-colors cursor-pointer">BBMP A-Khata Title Verification</li>
            </ul>
          </div>

          {/* Quadrant 4: Advisory Standards */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-white font-mono font-bold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <h4>Advisory Mandate</h4>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li>100% Encumbered Title Audits</li>
              <li>Pre-Approved Bank APF Lines</li>
              <li>Direct Developer Pricing Sheet</li>
              <li>Zero Buyer Brokerage</li>
            </ul>
          </div>

        </div>

        {/* 3. Compact RERA Compliance Box (Tightly formatted, no dead gap) */}
        <div className="bg-[#060b13] border border-white/[0.08] rounded-[6px] p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-400 font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Karnataka RERA Regulatory Registration &amp; Compliance Dossier</span>
          </div>

          {/* RERA Stat Cells (2 cols on mobile, 3 cols on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-[#040810] rounded-[4px] border border-white/[0.06] p-2.5">
              <span className="block text-[9px] text-slate-500 uppercase tracking-wide">Registered Agent</span>
              <span className="font-bold text-white text-xs mt-0.5 block truncate">SV PRAVEEN</span>
            </div>

            <div className="bg-[#040810] rounded-[4px] border border-white/[0.06] p-2.5">
              <span className="block text-[9px] text-slate-500 uppercase tracking-wide">RERA Validity</span>
              <span className="font-bold text-white text-xs mt-0.5 block truncate">16-09-2026 to 2031</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-[#040810] rounded-[4px] border border-white/[0.06] p-2.5">
              <span className="block text-[9px] text-slate-500 uppercase tracking-wide">K-RERA Registration No.</span>
              <span className="font-bold text-brand-300 text-xs mt-0.5 block truncate" title="PRM/KA/RERA/1251/310/AG/260916/007810">
                PRM/KA/RERA/1251/310/AG/260916/007810
              </span>
            </div>
          </div>

          {/* Mandatory legal disclosure */}
          <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed pt-1">
            <strong className="text-slate-300">Legal Disclosure: </strong>
            EstateNav is an independent advisory portal and authorized channel partner platform operated by
            SV Praveen (RERA No. PRM/KA/RERA/1251/310/AG/260916/007810), not the official developer website.
            All project brand names, layouts, and renderings belong to their respective developers
            and are displayed strictly for institutional advisory under direct developer terms.
          </p>
        </div>

        {/* 4. Copyright Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-[11px] text-slate-500 pt-1">
          <p>© 2026 EstateNav Real Estate Advisory. All rights reserved.</p>
          <p className="font-mono text-[10px]">Precision Urban Technology Advisory</p>
        </div>

      </div>
    </footer>
  );
};
