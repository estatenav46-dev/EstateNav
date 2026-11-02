'use client';

import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { TELEMETRY_TICKER_DATA } from '@/lib/mockData';

export const TelemetryTicker: React.FC = () => {
  return (
    <section className="bg-[#02050c] text-white border-b border-white/[0.08] py-2.5 overflow-hidden select-none">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center">
        
        {/* Static Header Label */}
        <div className="flex items-center space-x-2.5 shrink-0 pr-5 border-r border-slate-800 z-10 bg-[#02050c]">
          <span className="flex items-center space-x-1.5 bg-brand-500/10 text-brand-400 font-mono font-bold px-2 py-0.5 rounded-[4px] text-[10px] uppercase tracking-wider border border-brand-500/25">
            <Activity className="w-3 h-3 text-brand-400 animate-pulse stroke-[2.5]" />
            <span>Kaveri 2.0</span>
          </span>
          <span className="hidden sm:inline text-xs font-semibold text-slate-300">
            Sub-Registrar Benchmark Rates:
          </span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="flex overflow-hidden relative w-full group">
          <div className="flex space-x-8 shrink-0 animate-ticker group-hover:[animation-play-state:paused] py-0.5 items-center">
            
            {[...TELEMETRY_TICKER_DATA, ...TELEMETRY_TICKER_DATA].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex items-center space-x-2.5 shrink-0 font-mono text-[11px] text-slate-400"
              >
                <span className="text-slate-300 font-semibold">{item.corridor}:</span>
                <span className="font-bold text-white">{item.subRegistrarBenchmark}</span>
                <span className="inline-flex items-center font-bold text-brand-400 text-[10px] bg-brand-500/10 px-1.5 py-0.2 rounded-[2px]">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                  {item.yoyDelta}
                </span>
                <span className="text-slate-700">|</span>
                <span className="text-slate-400 text-[10px]">
                  Yield: <strong className="text-brand-300 font-bold">{item.grossYield}</strong>
                </span>
                <span className="text-slate-700">|</span>
                <span className="text-slate-500 text-[10px]">
                  Absorption: {item.absorptionTime}
                </span>
              </div>
            ))}

          </div>
        </div>

      </div>
    </section>
  );
};
