'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, ArrowRight, Building2, MessageCircle, Phone, Mail, User, Calendar, AlertCircle } from 'lucide-react';
import { Property, LeadPayload } from '@/lib/types';
import { submitLead } from '@/lib/firebase';
import { ADVISOR_NAME, ADVISOR_PHONE_DISPLAY, getWhatsAppUrl, getEmailUrl, getTelUrl } from '@/lib/contact';
import { CustomSelect, SelectOption } from './ui/CustomSelect';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty?: Property | null;
  actionTitle?: string;
}

const TIMELINE_OPTIONS: SelectOption[] = [
  { value: 'Ready to Move / Within 3 Months', label: 'Ready to Move / Within 3 Months', badge: 'Immediate', description: 'OC received or near handover' },
  { value: 'December 2026 (Under Construction)', label: 'December 2026', badge: 'Mid 2026', description: 'Mivan superstructure stage' },
  { value: 'September 2028 (Mid-Term)', label: 'September 2028', badge: 'Growth', description: 'Optimal capital appreciation window' },
  { value: '2030 (Pre-Launch Capital Appreciation)', label: '2030 (Pre-Launch)', badge: 'Pre-Launch', description: 'Ground floor allocation entry' },
];

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  selectedProperty,
  actionTitle = 'Inspect Allocation Deck',
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [timeline, setTimeline] = useState('Immediate / Ready');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Please fill in your name and mobile number.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    const payload: LeadPayload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      preferredCorridor: selectedProperty?.microMarket || 'Sarjapur - Whitefield',
      budget: selectedProperty?.priceDisplay || '₹1.25 Cr - ₹2.5 Cr',
      propertyId: selectedProperty?.id,
      propertyName: selectedProperty?.name || 'Verified Partner Portfolio',
      actionContext: actionTitle,
      channelPartnerDisclosureAccepted: true,
      createdAt: new Date().toISOString(),
    };

    await submitLead(payload);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setErrorMessage('');
    setSubmitted(false);
    onClose();
  };

  const whatsappLink = getWhatsAppUrl(selectedProperty);
  const emailLink = getEmailUrl(selectedProperty);
  const telLink = getTelUrl();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={handleReset}
    >
      <div
        className="relative w-full max-w-lg bg-[#080d16] border border-white/[0.14] rounded-[8px] p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close Button */}
        <button
          onClick={handleReset}
          className="btn-ghost absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-white"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          /* ── SUCCESS STATE ── */
          <div className="text-center py-5 space-y-4">
            <div className="relative w-16 h-16 bg-[#040810] border border-brand-500/30 rounded-[8px] overflow-hidden flex items-center justify-center mx-auto shadow-xl">
              <img
                src="/logo.png"
                alt="EstateNav Official Logo"
                className="w-full h-full object-cover scale-[1.04]"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-[#030712] shadow">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Official Allocation Access Granted
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed mt-2">
                Your dossier for{' '}
                <strong className="text-white font-bold">{selectedProperty?.name || 'Verified Primary Projects'}</strong>{' '}
                has been registered. Institutional advisor <strong>{ADVISOR_NAME}</strong> will transmit the
                direct developer pricing sheet to <strong className="text-brand-300 font-mono">{phone}</strong>.
              </p>
            </div>

            {/* Instant WhatsApp Action */}
            <div className="pt-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#22bf5b] text-[#030712] font-black text-xs py-3 px-5 rounded-[6px] shadow-lg transition-transform active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Open Instant WhatsApp Dossier</span>
              </a>
            </div>

            {/* Regulatory Accreditation Note */}
            <div className="bg-[#040810] rounded-[6px] border border-white/[0.07] p-3.5 text-left text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-brand-400 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorized Channel Partner Desk</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                K-RERA Reg: PRM/KA/RERA/1251/310/AG/260916/007810 • Direct Developer Terms. Zero brokerage guaranteed.
              </p>
            </div>

            <button onClick={handleReset} className="btn-secondary w-full py-2.5 text-xs">
              Return to Live Explorer
            </button>
          </div>
        ) : (
          /* ── FORM STATE ── */
          <div className="space-y-4">

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-[5px] bg-[#040810] border border-white/[0.12] overflow-hidden flex items-center justify-center shrink-0">
                  <img src="/logo.png" alt="EstateNav" className="w-full h-full object-cover scale-[1.04]" />
                </div>
                <div className="inline-flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/25 px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold text-brand-400 uppercase tracking-wider">
                  <Lock className="w-3 h-3" />
                  100% Encrypted &amp; Zero-Spam Shield
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {actionTitle}
              </h3>

              {selectedProperty ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="font-semibold text-white">{selectedProperty.name}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-brand-300 font-mono font-bold">{selectedProperty.priceDisplay}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  Verified developer allocations with institutional research &amp; title clearances.
                </p>
              )}
            </div>

            {/* Instant Direct Connect Bar */}
            <div className="bg-[#040810] rounded-[6px] border border-white/[0.08] p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>PREFER DIRECT ADVISOR CONNECT?</span>
                <span className="text-brand-400 font-bold">{ADVISOR_NAME}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 py-2 px-2 rounded-[4px] text-[11px] font-bold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={telLink}
                  className="flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.1] py-2 px-2 rounded-[4px] text-[11px] font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-400" />
                  <span>Direct Call</span>
                </a>
                <a
                  href={emailLink}
                  className="flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.1] py-2 px-2 rounded-[4px] text-[11px] font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-400" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-[4px] bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Precision Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">

              {/* Name Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <span className="text-[9px] font-mono text-brand-400 uppercase">Required</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Karthik Ramamurthy, VP Engineering"
                    className="field-input pl-9 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                      WhatsApp / Mobile
                    </label>
                    <span className="text-[9px] font-mono text-brand-400 uppercase">Required</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 97406 XXXXX"
                      className="field-input pl-9 pr-3 py-2.5 text-xs font-medium font-mono"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                      Work Email
                    </label>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Optional</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="karthik@company.com"
                      className="field-input pl-9 pr-3 py-2.5 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Possession Horizon Dropdown */}
              <CustomSelect
                label="Target Possession Horizon"
                value={timeline}
                onChange={setTimeline}
                options={TIMELINE_OPTIONS}
                icon={<Calendar className="w-3.5 h-3.5 text-brand-400" />}
              />

              {/* Mandatory Disclosure */}
              <div className="bg-[#040810] rounded-[6px] border border-white/[0.07] p-3 text-[10px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300">Mandatory Channel Partner Disclosure: </span>
                By submitting this form, you consent to registering your inquiry through{' '}
                <strong className="text-slate-200">{ADVISOR_NAME}</strong>, authorized Channel Partner.
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3.5 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm shadow-xl"
              >
                <span>{isSubmitting ? 'Securing Allocation Access...' : 'Unlock Direct Developer Pricing'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
