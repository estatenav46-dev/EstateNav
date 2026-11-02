'use client';

import React from 'react';
import { Shield, Clock, ExternalLink, FileSpreadsheet, MapPin } from 'lucide-react';
import { Property } from '@/lib/types';
import { ADVISOR_NAME } from '@/lib/contact';

interface PropertyCardProps {
  property: Property;
  onInspect: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onInspect,
}) => {
  return (
    <article className="group bg-[#080d16] rounded-[8px] overflow-hidden border border-white/[0.08] hover:border-brand-500/30 transition-colors duration-200 flex flex-col justify-between shadow-lg">

      {/* Image Block */}
      <div>
        <div className="relative h-48 sm:h-52 overflow-hidden bg-[#040810]">
          <img
            src={property.heroImage}
            alt={property.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          {/* Subtle Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080d16] via-[#080d16]/15 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="bg-black/80 backdrop-blur-sm text-brand-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] border border-white/[0.12] flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              K-RERA
            </span>
            <span className="bg-brand-500 text-[#030712] text-[10px] font-black px-2 py-0.5 rounded-[4px] uppercase tracking-wide">
              {property.status}
            </span>
          </div>

          {/* Commute Badge */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded-[4px] border border-white/[0.10] flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-brand-400" />
            <span>{property.commute.driveMinutes}m to campus</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3">

          {/* Developer line + Absorption */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-brand-400 font-mono font-bold uppercase tracking-wider">
              {property.developer}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {property.metrics.absorptionVelocity}
            </span>
          </div>

          {/* Name & Location */}
          <div>
            <h3 className="font-black text-white text-base sm:text-lg tracking-tight leading-snug group-hover:text-brand-300 transition-colors">
              {property.name}
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center mt-1 gap-1">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{property.address}</span>
            </p>
          </div>

          {/* Key Specs */}
          <div className="border-t border-white/[0.06] pt-2.5 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Configurations</span>
              <span className="font-bold text-slate-200 text-right">{property.configurations}</span>
            </div>
            {property.carpetArea && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Carpet Area</span>
                <span className="font-mono text-slate-300">{property.carpetArea}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Possession</span>
              <span className="font-medium text-brand-300">{property.possession}</span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="pt-2 border-t border-white/[0.06] flex items-end justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Guide Price</span>
              <span className="text-lg font-black text-brand-400 font-mono">
                {property.priceDisplay}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Yield Metric</span>
              <span className="text-xs font-bold text-slate-200 font-mono">
                {property.metrics.expectedYield}
              </span>
            </div>
          </div>

          {/* Direct Advisor Info Banner */}
          <div className="bg-[#050912] rounded-[4px] border border-white/[0.05] p-2 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[#070b13]">
                <img src="/logo.png" alt="EstateNav" className="w-full h-full object-cover scale-[1.04]" />
              </div>
              <span>Advisor: <strong className="text-slate-200">{ADVISOR_NAME}</strong></span>
            </div>
            <span className="text-[10px] font-mono text-brand-400 font-semibold">Direct Partner</span>
          </div>

        </div>
      </div>

      {/* Card Action Footer with Direct Contact Options */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 space-y-2.5">
        
        {/* Direct contact buttons are available through the allocation deck form.
        <div className="grid grid-cols-3 gap-1.5">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 py-2 px-2 rounded-[6px] text-xs font-bold transition-colors active:scale-[0.98]"
            title={`Chat on WhatsApp about ${property.name}`}
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span>WhatsApp</span>
          </a>

          <a
            href={telLink}
            className="flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.1] py-2 px-2 rounded-[6px] text-xs font-semibold transition-colors active:scale-[0.98]"
            title={`Call Advisor ${ADVISOR_NAME}`}
          >
            <Phone className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>Call</span>
          </a>

          <a
            href={emailLink}
            className="flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.1] py-2 px-2 rounded-[6px] text-xs font-semibold transition-colors active:scale-[0.98]"
            title={`Email Advisor about ${property.name}`}
          >
            <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>Email</span>
          </a>
        </div>
        */}

        {/* Primary Allocation Deck CTA */}
        <button
          onClick={() => onInspect(property)}
          className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Inspect Allocation Deck</span>
        </button>

        {/* RERA micro-line */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
          <span className="font-mono truncate max-w-[175px]" title={property.reraNumber}>
            RERA: {property.reraNumber}
          </span>
          <a
            href={property.reraValidationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            <span>Verify</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

      </div>

    </article>
  );
};
