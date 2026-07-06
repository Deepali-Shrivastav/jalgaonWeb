'use client';

import React from 'react';
import Link from 'next/link';

export default function ActivityPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-hairline-soft">
        <h2 className="text-2xl font-extrabold text-ink-deep">Activity Log</h2>
      </div>

      <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-hairline-soft flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">history</span>
        <h4 className="font-bold text-ink-deep text-lg mb-2">Activity Log Coming Soon</h4>
        <p className="text-secondary max-w-[384px] text-sm font-medium mb-6">
          Soon you will be able to audit your security history, log-in sessions, and listing updates to keep your account fully secure.
        </p>
        <Link href="/account/overview" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
          Back to Overview
        </Link>
      </div>
    </div>
  );
}
