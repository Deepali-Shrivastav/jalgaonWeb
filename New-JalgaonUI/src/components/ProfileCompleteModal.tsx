"use client";

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { AuthContext } from '@/context/AuthContext';
import {
  isProfileNudgeSnoozed,
  isProfileModalDismissed,
  snoozeProfileNudge,
  dismissProfileModal,
} from '@/lib/profileCompletionStorage';

export default function ProfileCompleteModal() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { score, isComplete, missingFields, isLoading } = useProfileCompletion();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isLoading || isComplete || !user?.id) return;
    if (isProfileNudgeSnoozed(user.id) || isProfileModalDismissed(user.id)) return;

    // Only trigger if user just logged in this session
    const justLoggedIn = typeof window !== 'undefined' && sessionStorage.getItem("just_logged_in") === "true";
    if (!justLoggedIn) return;

    // Show modal with a 3-second delay after mount
    const timer = setTimeout(() => {
      setIsOpen(true);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem("just_logged_in");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading, isComplete, score, user]);

  if (!isOpen) return null;

  const handleSnooze = () => {
    if (user?.id) {
      snoozeProfileNudge(user.id, 7); // Snooze for 7 days
    }
    setIsOpen(false);
  };

  const handleCTA = () => {
    if (user?.id) {
      dismissProfileModal(user.id); // Dismiss for current session
    }
    setIsOpen(false);
    router.push('/account/settings');
  };

  // SVG Progress Ring calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 w-[95vw] sm:w-[450px] max-w-[450px] shrink-0 shadow-2xl border border-hairline-soft/80 relative transform scale-100 transition-all duration-300">
        
        {/* Close button */}
        <button
          onClick={handleSnooze}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Circular Progress Section */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="relative flex items-center justify-center w-24 h-24 mb-4">
            <svg 
              viewBox="0 0 96 96"
              width="96"
              height="96"
              className="w-full h-full transform -rotate-90"
            >
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Foreground circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-primary transition-all duration-1000 ease-out"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xl font-extrabold text-ink-deep">{score}%</span>
          </div>

          <h3 className="text-2xl font-extrabold text-ink-deep mb-2">Complete Your Profile</h3>
          <p className="text-sm text-secondary px-2">
            Finish updating your profile for customized directory updates, better experience, and trusted searches.
          </p>
        </div>

        {/* Checklist */}
        <div className="border-y border-hairline-soft py-4 mb-6 space-y-3">
          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Your Checklist</p>
          
          {/* Static checklist rendering */}
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500 fill-green-500 text-lg">check_circle</span>
            <span className="text-xs font-semibold text-slate-500 line-through">Add verified phone number</span>
          </div>

          {/* Missing fields check */}
          {['name', 'profile_pic', 'email', 'bio', 'date_of_birth'].map((fieldId) => {
            const isMissing = missingFields.some((f) => f.id === fieldId);
            const label = isMissing 
              ? missingFields.find((f) => f.id === fieldId)?.label 
              : getFieldLabel(fieldId);
            
            return (
              <div key={fieldId} className="flex items-center gap-3">
                {isMissing ? (
                  <>
                    <span className="material-symbols-outlined text-amber-500 text-lg">info</span>
                    <span className="text-xs font-bold text-ink-deep">{label}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-green-500 fill-green-500 text-lg">check_circle</span>
                    <span className="text-xs font-semibold text-slate-500 line-through">{label}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCTA}
            className="w-full bg-primary hover:bg-primary-deep text-white py-3.5 rounded-full font-bold hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            Complete My Profile
          </button>
          <button
            onClick={handleSnooze}
            className="w-full text-slate-500 hover:text-slate-700 py-2 rounded-full text-xs font-bold hover:underline cursor-pointer"
          >
            Remind me in 7 days
          </button>
        </div>
      </div>
    </div>
  );
}

function getFieldLabel(fieldId: string): string {
  switch (fieldId) {
    case 'name': return 'Add your first & last name';
    case 'email': return 'Add your email address';
    case 'profile_pic': return 'Upload a profile photo';
    case 'bio': return 'Tell the community about yourself (Bio)';
    case 'date_of_birth': return 'Add your date of birth';
    default: return '';
  }
}
