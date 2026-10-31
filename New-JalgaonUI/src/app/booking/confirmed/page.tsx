'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Copy, QrCode, ArrowRight, ShieldCheck, MapPin, Calendar, Car } from 'lucide-react';

export default function BookingConfirmedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get('booking_ref') || 'JLG-8F42K91';
  const ticketCode = 'uuid-x8f42k91';

  const copyBookingRef = () => {
    navigator.clipboard.writeText(bookingRef);
    alert('Booking Reference copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-8 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-8">
        {/* SUCCESS HEADER */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Payment Verified</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100">Booking Confirmed!</h1>
            <p className="text-xs text-slate-400 max-w-md">
              Your payment was successful and your seats have been officially locked and reserved in the box office system.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Booking ID:</span>
            <span className="font-bold text-amber-400">{bookingRef}</span>
            <button onClick={copyBookingRef} className="ml-2 text-slate-500 hover:text-slate-200">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* BOOKING DETAILS CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Jalgaon Natyagruha Official</span>
            <h3 className="text-lg font-bold text-slate-100">Folk&apos;kit STUDIO Live Concert</h3>
            <p className="text-xs text-slate-400">Curated by Munesh Dhake & Ishwar Hire</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <MapPin className="w-4 h-4 text-amber-400" /> Venue
              </span>
              <p className="font-bold text-slate-200">Chhatrapati Sambhaji Raje Natyagruha</p>
              <p className="text-slate-400 text-[11px]">Gate 1 & 2 West Main Entrance, Jalgaon</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <Calendar className="w-4 h-4 text-amber-400" /> Date & Schedule
              </span>
              <p className="font-bold text-slate-200">Wed, Oct 7, 2026</p>
              <p className="text-slate-400 text-[11px]">07:00 PM – 10:30 PM IST</p>
            </div>
          </div>

          {/* ALLOCATED SEATS */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reserved Allocated Seats (2 Tickets)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Prime Row: Seat P12</span>
                <span className="text-emerald-400 font-semibold">Confirmed</span>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Prime Row: Seat P13</span>
                <span className="text-emerald-400 font-semibold">Confirmed</span>
              </div>
            </div>
          </div>

          {/* PERKS BADGES */}
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tax invoice and WhatsApp pass dispatched to registered contact.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Car className="w-4 h-4 text-amber-400" />
              <span>Free multi-level Natyagruha parking included with this booking ID.</span>
            </div>
          </div>
        </div>

        {/* ACTION CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push(`/tickets/${ticketCode}`)}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            <span>View Digital Ticket & QR Code</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
