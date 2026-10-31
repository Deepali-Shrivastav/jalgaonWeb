'use client';

import React, { useEffect, useState } from 'react';
import { Clock, ShieldAlert } from 'lucide-react';

interface HoldTimerProps {
  expiresAt: string | null;
  onExpire?: () => void;
  initialSeconds?: number;
}

export default function HoldCountdownTimer({
  expiresAt,
  onExpire,
  initialSeconds = 360
}: HoldTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (!expiresAt) return initialSeconds;
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setSecondsLeft(0);
        clearInterval(interval);
        if (onExpire) onExpire();
      } else {
        setSecondsLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const isLowTime = secondsLeft < 120;

  return (
    <div className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
      isLowTime
        ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 animate-pulse'
        : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
    }`}>
      <div className="flex items-center gap-2.5">
        <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-400' : 'text-amber-400'}`} />
        <span className="text-xs font-semibold tracking-wide">
          {isLowTime ? 'Hold Expiring Soon!' : 'Seats Temporarily Reserved'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Hold Timer:</span>
        <span className={`font-mono text-sm font-bold tracking-wider px-2.5 py-0.5 rounded-lg border ${
          isLowTime
            ? 'bg-rose-900/60 border-rose-500/60 text-rose-200'
            : 'bg-amber-900/40 border-amber-600/40 text-amber-200'
        }`}>
          {formatted}
        </span>
      </div>
    </div>
  );
}
