"use client";

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { AuthContext } from '@/context/AuthContext';
import { isProfileBannerDismissed, dismissProfileBanner } from '@/lib/profileCompletionStorage';

export default function ProfileCompleteBanner() {
  const { user } = useContext(AuthContext);
  const { score, isComplete, isLoading } = useProfileCompletion();
  const [isDismissed, setIsDismissed] = useState(true); // default to true, show on condition

  useEffect(() => {
    if (isLoading || isComplete || !user?.id) return;
    setIsDismissed(isProfileBannerDismissed(user.id));
  }, [isLoading, isComplete, score, user]);

  if (isDismissed) return null;

  const handleDismiss = () => {
    if (user?.id) {
      dismissProfileBanner(user.id);
    }
    setIsDismissed(true);
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-lg">edit_note</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-ink-deep">Your profile is {score}% complete</h4>
          <p className="text-xs text-secondary mt-0.5">
            Add more details to improve search visibility and listings credibility.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
        <Link
          href="/account/settings"
          className="flex-1 sm:flex-initial text-center bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          Update Profile
        </Link>
        <button
          onClick={handleDismiss}
          className="p-2 text-amber-700 hover:bg-amber-200/40 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          aria-label="Dismiss banner"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  );
}
