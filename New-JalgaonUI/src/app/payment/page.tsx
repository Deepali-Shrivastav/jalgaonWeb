'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HoldCountdownTimer from '@/components/ticketing/HoldCountdownTimer';
import OrderSummaryCard from '@/components/ticketing/OrderSummaryCard';
import { QrCode, CreditCard, Landmark, Wallet, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get('booking_ref') || 'JLG-8F42K91';

  const [paymentMode, setPaymentMode] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [vpa, setVpa] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const seats = [
    { seat_number: '12', row_label: 'P', section_name: 'Prime Row (Executive Tier)', price: 399 },
    { seat_number: '13', row_label: 'P', section_name: 'Prime Row (Executive Tier)', price: 399 }
  ];

  const handlePayNow = () => {
    if (paymentMode === 'upi') {
      router.push(`/payment/gpay?booking_ref=${bookingRef}`);
    } else {
      router.push(`/payment/processing?booking_ref=${bookingRef}`);
    }
  };

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
            <span>Back to Summary</span>
          </button>

          <h1 className="text-xl font-black text-slate-100">Choose Payment Method</h1>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40">
            <ShieldCheck className="w-4 h-4" />
            <span>256-Bit Escrow Gateway</span>
          </div>
        </div>

        {/* HOLD TIMER */}
        <HoldCountdownTimer expiresAt={null} initialSeconds={257} />

        {/* LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* PAYMENT METHODS SELECTOR */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                Select Payment Mode
              </span>

              {/* METHOD TABS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setPaymentMode('upi')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMode === 'upi'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>UPI / GPay</span>
                </button>

                <button
                  onClick={() => setPaymentMode('card')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMode === 'card'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Cards</span>
                </button>

                <button
                  onClick={() => setPaymentMode('netbanking')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMode === 'netbanking'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Landmark className="w-5 h-5" />
                  <span>Net Banking</span>
                </button>

                <button
                  onClick={() => setPaymentMode('wallet')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMode === 'wallet'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span>Wallets</span>
                </button>
              </div>

              {/* TAB CONTENT */}
              {paymentMode === 'upi' && (
                <div className="space-y-4 pt-4 border-t border-slate-800 text-xs">
                  <p className="text-slate-300 font-semibold">Pay using UPI ID / VPA or Quick App</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={vpa}
                      onChange={(e) => setVpa(e.target.value)}
                      placeholder="yourname@okhdfcbank or 9823012345@upi"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Supported UPI Apps:</span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'CRED'].map(app => (
                        <span key={app} className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 font-medium">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {paymentMode === 'card' && (
                <div className="space-y-3 text-xs pt-4 border-t border-slate-800">
                  <input type="text" placeholder="Card Number (4111 2222 3333 4444)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM / YY" className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200" />
                    <input type="password" placeholder="CVV / CVC" className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200" />
                  </div>
                  <input type="text" placeholder="Cardholder Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200" />
                </div>
              )}

              {paymentMode === 'netbanking' && (
                <div className="space-y-3 text-xs pt-4 border-t border-slate-800">
                  <p className="text-slate-300 font-semibold">Select Popular Bank:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['SBI', 'HDFC Bank', 'ICICI Bank', 'Bank of Maharashtra'].map(bank => (
                      <button key={bank} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-300 font-semibold hover:border-amber-500">
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMode === 'wallet' && (
                <div className="space-y-3 text-xs pt-4 border-t border-slate-800">
                  <p className="text-slate-300 font-semibold">Select Wallet Provider:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['Amazon Pay', 'MobiKwik', 'PhonePe Wallet'].map(w => (
                      <button key={w} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-300 font-semibold hover:border-amber-500">
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SUMMARY & CTA COLUMN */}
          <div className="lg:col-span-5 space-y-6">
            <OrderSummaryCard
              bookingReference={bookingRef}
              seats={seats}
              subtotal={798.00}
              convenienceFee={40.00}
              gstAmount={7.20}
              totalPayable={845.20}
            />

            <button
              onClick={handlePayNow}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-4 rounded-2xl font-black text-base tracking-wide shadow-xl hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-3"
            >
              <span>Pay ₹845.20 via {paymentMode.toUpperCase()}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
