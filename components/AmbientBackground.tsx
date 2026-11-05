'use client';

import React from 'react';

export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft emerald floating ambient glow */}
      <div
        className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#047857]/10 via-[#ecfdf5]/40 to-transparent blur-[120px] animate-float-slow motion-reduce:animate-none"
      />

      {/* Warm champagne floating ambient glow */}
      <div
        className="absolute top-1/4 -right-32 h-[550px] w-[550px] rounded-full bg-gradient-to-bl from-[#fef3c7]/25 via-[#f7f6f3]/50 to-transparent blur-[130px] animate-float-reverse motion-reduce:animate-none"
      />

      {/* Subtle bottom-left glow */}
      <div
        className="absolute bottom-10 left-1/4 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-[#047857]/05 to-transparent blur-[100px] animate-pulse-subtle motion-reduce:animate-none"
      />

      {/* Architectural micro-grid overlay */}
      <div className="absolute inset-0 architectural-pattern opacity-40" />
    </div>
  );
}

