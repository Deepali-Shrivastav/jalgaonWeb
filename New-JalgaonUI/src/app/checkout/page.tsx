'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HoldCountdownTimer from '@/components/ticketing/HoldCountdownTimer';
import OrderSummaryCard from '@/components/ticketing/OrderSummaryCard';
import TicketRecipientForm from '@/components/ticketing/TicketRecipientForm';
import { ArrowLeft, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get('booking_ref') || 'JLG-8F42K91';

  const [name, setName] = useState<string>('Anand Patil');
  const [email, setEmail] = useState<string>('anand.patil@example.com');
  const [phone, setPhone] = useState<string>('9823012345');
  const [sendWhatsapp, setSendWhatsapp] = useState<boolean>(true);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Mock seat hold data matching Screen 3 (P12 & P13 @ ₹399 each)
  const seats = [
    { seat_number: '12', row_label: 'P', section_name: 'Prime Row (Executive Tier)', price: 399 },
    { seat_number: '13', row_label: 'P', section_name: 'Prime Row (Executive Tier)', price: 399 }
  ];

  const subtotal = 798.00;
  const convenienceFee = 40.00;
  const gstAmount = 7.20;
  const totalPayable = subtotal + convenienceFee + gstAmount - discountAmount;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    if (couponCode.toUpperCase() === 'JALGAON50') {
      setDiscountAmount(50);
      setCouponMessage('Voucher Applied! ₹50 Discount');
    } else {
      setDiscountAmount(0);
      setCouponMessage('Invalid or expired coupon code.');
    }
  };

  const handleProceedToPayment = () => {
    router.push(`/payment?booking_ref=${bookingRef}`);
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
            <span>Return to Seat Selection</span>
          </button>

          <h1 className="text-xl font-black text-slate-100">Ticket Checkout & Order Summary</h1>

          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-800/40">
            <ShieldCheck className="w-4 h-4" />
            <span>PCI-DSS Secured Session</span>
          </div>
        </div>

        {/* 6-MINUTE HOLD TIMER */}
        <HoldCountdownTimer expiresAt={null} initialSeconds={342} />

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT FORM COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            <TicketRecipientForm
              name={name}
              email={email}
              phone={phone}
              sendWhatsapp={sendWhatsapp}
              onChangeName={setName}
              onChangeEmail={setEmail}
              onChangePhone={setPhone}
              onToggleWhatsapp={setSendWhatsapp}
            />

            {/* COUPON / VOUCHER CODE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Municipal Voucher / Promo Code</span>
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code (e.g. JALGAON50)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 uppercase placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </div>

              {couponMessage && (
                <p className={`text-xs ${discountAmount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {couponMessage}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT SUMMARY COLUMN */}
          <div className="lg:col-span-5 space-y-6">
            <OrderSummaryCard
              bookingReference={bookingRef}
              seats={seats}
              subtotal={subtotal}
              convenienceFee={convenienceFee}
              gstAmount={gstAmount}
              discountAmount={discountAmount}
              totalPayable={totalPayable}
            />

            <button
              onClick={handleProceedToPayment}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-4 rounded-2xl font-black text-base tracking-wide shadow-xl hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-3"
            >
              <span>Proceed to Pay ₹{totalPayable.toFixed(2)}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
