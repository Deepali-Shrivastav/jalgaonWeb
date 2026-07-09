"use client";

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { AuthContext } from '@/context/AuthContext';

export default function ProfileCompleteBanner() {
  const { user } = useContext(AuthContext);
  const { score, isComplete, isLoading } = useProfileCompletion();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isLoading || isComplete || !user?.id) {
      setShouldShow(false);
      return;
    }
    setShouldShow(true);
  }, [isLoading, isComplete, score, user]);

  if (!shouldShow) return null;

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
      </div>
    </div>
  );
}
