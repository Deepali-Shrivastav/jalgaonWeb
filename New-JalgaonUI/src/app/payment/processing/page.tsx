'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, RefreshCw, AlertTriangle, Lock } from 'lucide-react';

function PaymentProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get('booking_ref') || 'JLG-8F42K91';

  // Auto-redirect to confirmation page after 3 seconds processing simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/booking/confirmed?booking_ref=${bookingRef}`);
    }, 3200);

    return () => clearTimeout(timer);
  }, [bookingRef, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 space-y-8">
      {/* PROCESSING CARD */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin flex items-center justify-center" />
          <Lock className="w-8 h-8 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">TRANSACTION IN PROGRESS</span>
          <h2 className="text-xl font-black text-slate-100">Contacting Payment Gateway...</h2>
          <p className="text-xs text-slate-400">Securing reservation for 2 seats (P12, P13)</p>
        </div>

        {/* WARNING ALERT */}
        <div className="w-full flex items-center gap-3 p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-300 text-left">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p>Please do not refresh or close this window while bank authorization completes.</p>
        </div>

        {/* DETAILS TABLE */}
        <div className="w-full space-y-2 pt-4 border-t border-slate-800 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Order Reference</span>
            <span className="font-mono font-bold text-slate-200">#{bookingRef}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Amount</span>
            <span className="font-bold text-amber-400">₹845.20</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Venue</span>
            <span className="text-slate-200 truncate max-w-[200px]">Chh. Sambhaji Raje Natyagruha</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>256-bit SSL Bank-Grade Encryption • Jalgaon.com Escrow</span>
      </div>
    </div>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        </div>
      }
    >
      <PaymentProcessingContent />
    </Suspense>
  );
}
