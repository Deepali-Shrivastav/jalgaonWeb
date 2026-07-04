import React from 'react';

export default function BreakingNews() {
  return (
    <div className="bg-white py-4 border-y border-hairline-soft">
      <div className="max-w-container-max mx-auto px-xxl flex items-center gap-xl overflow-hidden">
        <span className="bg-red-600 text-white px-base py-1 font-bold text-[10px] rounded-full uppercase tracking-widest flex-shrink-0">
          Breaking News
        </span>
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          <p className="text-on-surface text-sm font-medium">
            Jalgaon Economic Summit Announced • New Agricultural Policies for Region • Local Tech Startups Receive Funding • Monsoon Alert: Heavy rains expected next week...
          </p>
        </div>
      </div>
    </div>
  );
}
