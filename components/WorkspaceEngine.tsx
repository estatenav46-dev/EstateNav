'use client';

import React, { useState, useMemo } from 'react';
import { Route, Calculator, ShieldCheck, Check, Filter, SlidersHorizontal, MapPin, Building, Landmark } from 'lucide-react';
import { Property, MilestoneLens, TechCampus } from '@/lib/types';
import { PropertyCard } from './PropertyCard';
import { CustomSelect, SelectOption } from './ui/CustomSelect';

interface WorkspaceEngineProps {
  properties: Property[];
  onInspectProperty: (prop: Property) => void;
  initialMicroMarket?: string;
  initialBudget?: string;
}

const CAMPUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Show All Corridors', badge: 'All' },
  { value: 'wipro', label: 'Wipro Corporate HQ', badge: 'Sarjapur Rd', description: 'Immediate connectivity to Carmelaram & Sarjapur clusters' },
  { value: 'ecospace', label: 'Prestige Tech Park / Ecospace', badge: 'Bellandur-ORR', description: 'Prime Outer Ring Road corporate tech corridor' },
  { value: 'manyata', label: 'Manyata Business Park', badge: 'Hebbal', description: 'North Bengaluru major employment hub' },
];

const TENURE_OPTIONS: SelectOption[] = [
  { value: '15', label: '15 Years (8.40% Prime Rate)', badge: 'Lowest Interest', description: 'Accelerated equity buildup' },
  { value: '20', label: '20 Years (8.45% Benchmark Rate)', badge: 'Standard', description: 'Optimal monthly liquidity balance' },
  { value: '25', label: '25 Years (8.55% Extended Rate)', badge: 'Lowest EMI', description: 'Extended tenure amortization' },
];

export const WorkspaceEngine: React.FC<WorkspaceEngineProps> = ({
  properties,
  onInspectProperty,
  initialMicroMarket = 'All Bengaluru Corridors',
  initialBudget = 'Any Budget',
}) => {
  const [activeTab, setActiveTab] = useState<'commute' | 'calc' | 'rera'>('commute');
  const [activeLens, setActiveLens] = useState<MilestoneLens>('all');
  const [selectedCampus, setSelectedCampus] = useState<TechCampus>('all');
  const [maxDriveTime, setMaxDriveTime] = useState<number>(30);
  const [propertyValueLakhs, setPropertyValueLakhs] = useState<number>(135);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [tenureYears, setTenureYears] = useState<number>(20);

  const lenses: { id: MilestoneLens; label: string; count: number }[] = useMemo(() => [
    { id: 'all',     label: 'All Allocations',        count: properties.length },
    { id: 'first',   label: 'First Home (< ₹1.25 Cr)', count: properties.filter(p => p.lenses.includes('first')).length },
    { id: 'upgrade', label: 'Upgrading (3.5/4.5 BHK)', count: properties.filter(p => p.lenses.includes('upgrade')).length },
    { id: 'nri',     label: 'NRI Portfolio',            count: properties.filter(p => p.lenses.includes('nri')).length },
    { id: 'senior',  label: 'Senior Enclaves',          count: properties.filter(p => p.lenses.includes('senior')).length },
  ], [properties]);

  const financialResults = useMemo(() => {
    const loanLakhs = propertyValueLakhs * (1 - downPaymentPct / 100);
    const loanPrincipal = loanLakhs * 100000;
    let annualRate = 0.0845;
    if (tenureYears === 15) annualRate = 0.084;
    if (tenureYears === 25) annualRate = 0.0855;
    const monthlyRate = annualRate / 12;
    const totalMonths = tenureYears * 12;
    const emi = Math.round(
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
    return {
      emiDisplay: `₹${emi.toLocaleString('en-IN')} / mo`,
      stampDutyDisplay: `₹${(propertyValueLakhs * 0.056).toFixed(2)} L`,
      registrationDisplay: `₹${(propertyValueLakhs * 0.01).toFixed(2)} L`,
      taxOffsetDisplay: '₹2.00 L / FY',
      priceCrDisplay: `₹${(propertyValueLakhs / 100).toFixed(2)} Cr`,
    };
  }, [propertyValueLakhs, downPaymentPct, tenureYears]);

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      if (activeLens !== 'all' && !prop.lenses.includes(activeLens)) return false;
      if (selectedCampus !== 'all') {
        if (prop.commute.campus !== selectedCampus && prop.commute.campus !== 'all') return false;
        if (prop.commute.driveMinutes > maxDriveTime) return false;
      }
      if (initialMicroMarket && initialMicroMarket !== 'All Bengaluru Corridors') {
        if (!prop.microMarket.toLowerCase().includes(initialMicroMarket.toLowerCase().split(' ')[0])) return false;
      }
      if (initialBudget && initialBudget !== 'Any Budget') {
        if (initialBudget.includes('< ₹1.25 Cr') || initialBudget.includes('First Home')) {
          if (prop.startingPrice > 125) return false;
        } else if (initialBudget.includes('₹1.25 Cr – ₹2.0 Cr')) {
          if (prop.startingPrice < 125 || prop.startingPrice > 200) return false;
        } else if (initialBudget.includes('₹2.0 Cr+')) {
          if (prop.startingPrice < 190) return false;
        }
      }
      return true;
    });
  }, [properties, activeLens, selectedCampus, maxDriveTime, initialMicroMarket, initialBudget]);

  const tabClass = (tab: string) =>
    `flex-1 py-2 rounded-[4px] font-bold transition-colors duration-150 flex items-center justify-center gap-1.5 text-xs ${
      activeTab === tab
        ? 'bg-brand-500 text-[#030712]'
        : 'text-slate-400 hover:text-white'
    }`;

  return (
    <section id="workspace" className="py-6 sm:py-14 bg-[#060a12] border-b border-white/[0.08]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4 sm:space-y-6">

        {/* Section Header + Lens Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-5 border-b border-white/[0.08] pb-4 sm:pb-5">
          <div>
            <div className="flex items-center gap-2 text-brand-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
              <SlidersHorizontal className="w-3 h-3" />
              Verified Portfolio Allocations
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Live Property Inventory ({filteredProperties.length} Available)
            </h2>
          </div>

          {/* Milestone Lens Filter Pills */}
          <div className="flex bg-[#070b13] border border-white/[0.08] rounded-[6px] p-1 gap-1 overflow-x-auto no-scrollbar text-xs shrink-0">
            {lenses.map((lens) => (
              <button
                key={lens.id}
                onClick={() => setActiveLens(lens.id)}
                className={`px-3 py-1.5 sm:py-2 rounded-[4px] font-bold whitespace-nowrap transition-colors duration-150 flex items-center gap-1.5 text-xs ${
                  activeLens === lens.id
                    ? 'bg-brand-500 text-[#030712]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{lens.label}</span>
                <span className={`text-[10px] font-mono px-1 py-px rounded-[3px] ${
                  activeLens === lens.id ? 'bg-[#030712]/30 text-[#030712]' : 'bg-slate-800 text-slate-400'
                }`}>
                  {lens.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Split Layout: 35% Left Tools (Desktop only) / Right Property Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* LEFT: Desktop Advisory Tools Panel */}
          <div className="hidden lg:block lg:col-span-5 bg-[#070b13] border border-white/[0.08] rounded-[8px] p-5 sm:p-6 space-y-5 sticky top-24">

            {/* Tab switcher */}
            <div className="flex bg-[#040810] border border-white/[0.07] rounded-[6px] p-1 gap-1 text-xs">
              <button onClick={() => setActiveTab('commute')} className={tabClass('commute')}>
                <Route className="w-3.5 h-3.5" />
                Commute
              </button>
              <button onClick={() => setActiveTab('calc')} className={tabClass('calc')}>
                <Calculator className="w-3.5 h-3.5" />
                Financials
              </button>
              <button onClick={() => setActiveTab('rera')} className={tabClass('rera')}>
                <ShieldCheck className="w-3.5 h-3.5" />
                RERA Audit
              </button>
            </div>

            {/* TAB: COMMUTE */}
            {activeTab === 'commute' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="font-black text-white text-sm">Peak-Hour Transit Radar</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Filter live allocations by peak commute radius to your corporate campus.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Upgraded CustomSelect for Campus */}
                  <CustomSelect
                    label="Corporate Campus Hub"
                    value={selectedCampus}
                    onChange={(val) => setSelectedCampus(val as TechCampus)}
                    options={CAMPUS_OPTIONS}
                    icon={<Building className="w-3.5 h-3.5 text-brand-400" />}
                  />

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-400">Max Peak Drive Time</span>
                      <span className="text-brand-400 font-mono font-bold">&lt; {maxDriveTime} min</span>
                    </div>
                    <input
                      type="range"
                      min={5} max={45} step={5}
                      value={maxDriveTime}
                      onChange={(e) => setMaxDriveTime(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>5 min</span><span>25 min</span><span>45 min</span>
                    </div>
                  </div>

                  <div className="bg-[#040810] rounded-[6px] border border-white/[0.07] p-3.5 text-[11px] text-slate-300 flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>Filtering <strong className="text-white font-mono">{filteredProperties.length}</strong> active allocations in real time.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FINANCIALS */}
            {activeTab === 'calc' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="font-black text-white text-sm">Multi-Parameter Financial Studio</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Calibrated against Kaveri 2.0 statutory tax slabs &amp; current prime lending rates.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-2">
                      <span className="text-slate-400 font-mono uppercase text-[10px]">Target Property Value</span>
                      <span className="text-brand-400 font-mono text-sm font-black">{financialResults.priceCrDisplay}</span>
                    </div>
                    <input
                      type="range"
                      min={60} max={350} step={5}
                      value={propertyValueLakhs}
                      onChange={(e) => setPropertyValueLakhs(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>₹60 L</span><span>₹2.0 Cr</span><span>₹3.5 Cr</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono font-semibold uppercase tracking-wider text-[10px] mb-2">
                      Down Payment Allocation
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      {[10, 20, 30].map((dp) => (
                        <button
                          key={dp}
                          onClick={() => setDownPaymentPct(dp)}
                          className={`py-2 rounded-[4px] font-bold transition-colors text-xs ${
                            downPaymentPct === dp
                              ? 'bg-brand-500 text-[#030712] shadow'
                              : 'bg-[#040810] text-slate-300 border border-white/[0.06] hover:border-white/[0.12] hover:text-white'
                          }`}
                        >
                          {dp}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upgraded CustomSelect for Loan Tenure */}
                  <CustomSelect
                    label="Loan Tenure & Bank Rate"
                    value={String(tenureYears)}
                    onChange={(val) => setTenureYears(Number(val))}
                    options={TENURE_OPTIONS}
                    icon={<Landmark className="w-3.5 h-3.5 text-brand-400" />}
                  />

                  <div className="rounded-[6px] overflow-hidden border border-white/[0.06] bg-white/[0.06] grid grid-cols-2 gap-px pt-1">
                    {[
                      { label: 'Est. Monthly EMI',    value: financialResults.emiDisplay,           accent: false },
                      { label: 'Stamp Duty (5.6%)',   value: financialResults.stampDutyDisplay,     accent: false },
                      { label: 'Reg. Fee (1.0%)',     value: financialResults.registrationDisplay,  accent: false },
                      { label: 'Sec 24(b) Offset',    value: financialResults.taxOffsetDisplay,     accent: true  },
                    ].map(({ label, value, accent }) => (
                      <div key={label} className="bg-[#07090f] p-3 text-center">
                        <span className="block text-[9px] text-slate-500 uppercase font-mono tracking-wider">{label}</span>
                        <span className={`text-xs font-black font-mono mt-0.5 block ${accent ? 'text-brand-400' : 'text-white'}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RERA AUDIT */}
            {activeTab === 'rera' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                <div>
                  <div className="flex items-center gap-2 text-brand-400 mb-1">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="font-black text-white text-sm">Kaveri 2.0 Compliance Protocol</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Every inventory parcel undergoes a 12-point title clearance before allocation.
                  </p>
                </div>

                <div className="space-y-2 pt-1 text-[11px]">
                  {[
                    'Direct K-RERA Project Registration Screened',
                    'A-Khata / BBMP Sanction Clearances',
                    'Pre-Approved Bank APF Lines (HDFC, ICICI, SBI)',
                    'Zero-Brokerage Direct Developer Price Lock',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-slate-300">
                      <span className="shrink-0 w-4 h-4 flex items-center justify-center">
                        <Check className="w-4 h-4 text-brand-400" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT (FULL WIDTH ON MOBILE): Real Property Listings Grid */}
          <div className="w-full lg:col-span-7 space-y-4">

            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {filteredProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onInspect={onInspectProperty}
                  />
                ))}
              </div>
            ) : (
              <div className="arch-card p-8 sm:p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-[6px] bg-[#040810] border border-white/[0.07] flex items-center justify-center mx-auto text-slate-500">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-base">No Matching Allocations Found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Try clearing the milestone filter or selecting a different micro-market.
                  </p>
                </div>
                <button
                  onClick={() => { setActiveLens('all'); setSelectedCampus('all'); setMaxDriveTime(45); }}
                  className="btn-ghost text-xs px-5 py-2 mx-auto"
                >
                  Reset Filters
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};
