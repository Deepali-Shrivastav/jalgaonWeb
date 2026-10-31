'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HoldCountdownTimer from '@/components/ticketing/HoldCountdownTimer';
import OrderSummaryCard from '@/components/ticketing/OrderSummaryCard';
import { QrCode, Smartphone, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

function GPayAuthorizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get('booking_ref') || 'JLG-8F42K91';

  const [vpa, setVpa] = useState<string>('anand.patil@oksbi');
  const [collectSent, setCollectSent] = useState<boolean>(false);
  const [qrSeconds, setQrSeconds] = useState<number>(285); // 04:45 timer

  const seats = [
    { seat_number: '12', row_label: 'P', section_name: 'Prime Row (Executive Tier)', price: 399 },
    { seat_number: '13', row_label: 'P', section_name: 'Prime Row (Executive Tier)', price: 399 }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setQrSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendCollect = () => {
    setCollectSent(true);
    setTimeout(() => {
      router.push(`/payment/processing?booking_ref=${bookingRef}`);
    }, 2500);
  };

  const qrMins = Math.floor(qrSeconds / 60);
  const qrSecs = qrSeconds % 60;
  const qrFormatted = `${String(qrMins).padStart(2, '0')}:${String(qrSecs).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Choose another payment method</span>
          </button>

          <h1 className="text-xl font-black text-slate-100">Pay with Google Pay</h1>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40">
            <ShieldCheck className="w-4 h-4" />
            <span>NPCI / UPI 2.0 Encrypted</span>
          </div>
        </div>

        {/* HOLD TIMER */}
        <HoldCountdownTimer expiresAt={null} initialSeconds={318} />

        {/* LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* GPAY AUTHORIZATION CONTAINER */}
          <div className="lg:col-span-7 space-y-6">
            {/* OPTION 1: SCAN QR CODE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-center flex flex-col items-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Fastest • Scan directly with phone</span>
              <h3 className="text-base font-bold text-slate-100">Scan with Google Pay App</h3>
              <p className="text-xs text-slate-400">Open GPay on your mobile, tap &quot;Scan QR code&quot;, and approve payment using your UPI PIN.</p>

              {/* DYNAMIC QR PLACEHOLDER */}
              <div className="p-4 bg-white rounded-2xl border-4 border-slate-800 shadow-inner my-2">
                <QrCode className="w-40 h-40 text-slate-900" />
              </div>

              <div className="text-xs text-amber-400 font-mono font-semibold flex items-center gap-2 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/40">
                <span>QR dynamic code expires in:</span>
                <span className="font-bold text-amber-200">{qrFormatted}</span>
              </div>
            </div>

            {/* OPTION 2: SEND COLLECT PUSH */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-100">Send Collect Request to Google Pay</h3>
              <p className="text-xs text-slate-400">Enter your UPI ID registered with Google Pay or your linked mobile number.</p>

              <div className="space-y-3">
                <input
                  type="text"
                  value={vpa}
                  onChange={(e) => setVpa(e.target.value)}
                  placeholder="e.g. mobile@okhdfcbank or 9823012345@oksbi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />

                <button
                  onClick={handleSendCollect}
                  disabled={collectSent}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{collectSent ? 'Push Request Sent to Phone...' : 'Send GPay Collect Request (₹845.20)'}</span>
                </button>
              </div>

              {collectSent && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Google Pay VPA: Instant collect notification sent to phone.</span>
                </div>
              )}
            </div>
          </div>

          {/* SUMMARY COLUMN */}
          <div className="lg:col-span-5">
            <OrderSummaryCard
              bookingReference={bookingRef}
              seats={seats}
              subtotal={798.00}
              convenienceFee={40.00}
              gstAmount={7.20}
              totalPayable={845.20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GPayAuthorizationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        </div>
      }
    >
      <GPayAuthorizationContent />
    </Suspense>
  );
}
