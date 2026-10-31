'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface SelectedSeat {
  id: string;
  row: string;
  num: string;
  tier: string;
  price: number;
}

export default function SeatSelectionPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showId = searchParams.get('show_id') || '1';

  // Default pre-selected seats (D-8 and D-9 as per Stitch design)
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([
    { id: 'D-8', row: 'D', num: '8', tier: 'Prime Executive', price: 799 },
    { id: 'D-9', row: 'D', num: '9', tier: 'Prime Executive', price: 799 },
  ]);

  const [zoom, setZoom] = useState<number>(1.0);
  const [holding, setHolding] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(585); // 9 min 45 sec

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const isSelected = (id: string) => selectedSeats.some((s) => s.id === id);

  const toggleSeat = (id: string, row: string, num: string, tier: string, price: number) => {
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === id);
      if (exists) {
        return prev.filter((s) => s.id !== id);
      } else {
        if (prev.length >= 8) {
          alert('Booking policy: Maximum 8 seats per transaction.');
          return prev;
        }
        return [...prev, { id, row, num, tier, price }];
      }
    });
  };

  const clearAllSeats = () => {
    setSelectedSeats([]);
  };

  const scrollToTier = (tierId: string) => {
    const el = document.getElementById(tierId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Price calculations
  const baseTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const gstFees = Math.round(baseTotal * 0.09 * 100) / 100;
  const grandTotal = Math.round((baseTotal + gstFees) * 100) / 100;

  // Group selected seats for display
  const rowGroups: Record<string, string[]> = {};
  selectedSeats.forEach((s) => {
    if (!rowGroups[s.row]) rowGroups[s.row] = [];
    rowGroups[s.row].push(s.num);
  });
  const formattedSeatsSummary = Object.keys(rowGroups)
    .map((r) => `Row ${r} (${rowGroups[r].join(', ')})`)
    .join(' • ');

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    setHolding(true);
    const mockBookingRef = `JLG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    router.push(`/checkout?booking_ref=${mockBookingRef}`);
  };

  return (
    <div className="bg-[#F9F9FD] text-slate-800 antialiased min-h-screen flex flex-col justify-between pb-28">
      {/* HEADER */}
      <header className="bg-white border-b border-[#E8E8EC] sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
          <Link className="flex items-center shrink-0 font-extrabold text-2xl text-[#0081C7]" href="/">
            Jalgaon<span className="text-slate-900">.com</span>
          </Link>
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link className="hover:text-[#0081C7] transition-colors" href="/">Home</Link>
            <Link className="hover:text-[#0081C7] transition-colors" href="/news">News</Link>
            <Link className="text-[#0081C7] font-semibold relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-[#0081C7] after:rounded-full" href="/events">Events</Link>
            <Link className="hover:text-[#0081C7] transition-colors" href="/blog">Blog</Link>
            <Link className="hover:text-[#0081C7] transition-colors" href="/jobs">Jobs</Link>
            <Link className="hover:text-[#0081C7] transition-colors" href="/startups">Startups</Link>
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <Link className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors" href="/account/tickets">
              <span className="material-symbols-outlined text-base text-slate-500">confirmation_number</span>
              <span>My Bookings</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow py-6 md:py-8 px-4 md:px-6 bg-[#F9F9FD]">
        <div className="flex flex-col w-full max-w-[1240px] mx-auto">
          {/* Breadcrumbs & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs text-slate-500 font-medium">
            <nav className="flex items-center space-x-2">
              <Link className="hover:text-[#0081C7] transition-colors" href="/">Home</Link>
              <span className="text-slate-300">/</span>
              <Link className="hover:text-[#0081C7] transition-colors" href="/events">Events</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold">Auditorium Seat Selection</span>
            </nav>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Real-time Seat Allocation
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                <span className="material-symbols-outlined text-xs text-amber-600">timer</span>
                <span>Seats held for {formatTimer(timeLeft)}</span>
              </span>
            </div>
          </div>

          {/* Event Summary Header & 4-Step Booking Indicator */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-[#E8E8EC] mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left: Event Meta */}
              <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                <div className="relative shrink-0">
                  <div className="w-16 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-[#0081C7] to-[#0369a1] flex flex-col items-center justify-center text-white shadow-md p-2 text-center border-t border-sky-300">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-sky-100">OCT</span>
                    <span className="text-2xl sm:text-3xl font-extrabold leading-none my-0.5 tracking-tight">07</span>
                    <span className="text-[10px] uppercase font-semibold text-sky-200">WED • 2026</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">Live Event</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">surround_sound</span> Quad Surround 360°
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                    <span>Folk लोक STUDIO Live Concert</span>
                    <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">Season 04</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <span className="material-symbols-outlined text-base text-[#0081C7]">location_on</span>
                      Chhatrapati Sambhaji Raje Natyagruha, Jalgaon
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>Wednesday, October 7, 2026 • 07:00 PM IST</span>
                  </p>
                </div>
              </div>

              {/* Right: 4-Step Booking Indicator */}
              <div className="flex items-center shrink-0 bg-[#F9F9FD] border border-[#E8E8EC] p-2 sm:p-2.5 rounded-2xl shadow-inner justify-between sm:justify-start gap-1 sm:gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-emerald-600 font-semibold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">✓</span>
                  <span className="hidden sm:inline font-bold">01 Event</span>
                </div>
                <span className="h-3.5 w-px bg-slate-200"></span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white text-[#0081C7] font-bold text-xs shadow-sm border border-sky-200">
                  <span className="w-5 h-5 rounded-full bg-[#0081C7] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">02</span>
                  <span className="font-bold">Seats</span>
                </div>
                <span className="h-3.5 w-px bg-slate-200"></span>
                <div className="flex items-center gap-1.5 px-2 py-1 text-slate-400 font-medium text-xs">
                  <span className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center font-medium text-[10px]">03</span>
                  <span className="hidden sm:inline">Summary</span>
                </div>
                <span className="h-3.5 w-px bg-slate-200"></span>
                <div className="flex items-center gap-1.5 px-2 py-1 text-slate-400 font-medium text-xs">
                  <span className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center font-medium text-[10px]">04</span>
                  <span className="hidden sm:inline">Payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Tier Quick-Select Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Balcony Card */}
            <div 
              onClick={() => scrollToTier('balcony-section')}
              className="group relative bg-white rounded-2xl p-5 border border-[#E8E8EC] hover:border-[#0081C7] shadow-sm hover:shadow transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-sky-50 text-sky-700 border-b border-l border-sky-100 text-[11px] font-bold uppercase tracking-wider">
                Elevated View
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-500 ring-4 ring-sky-100"></span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0081C7] transition-colors">Balcony</h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">Front terrace elevation • Rows A – C</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Ticket Tier</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">₹499</span>
                    <span className="text-xs text-slate-400">/ ticket</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#0081C7] bg-sky-50 px-2.5 py-1 rounded-lg group-hover:bg-[#0081C7] group-hover:text-white transition-all">
                  Select Rows A–C →
                </span>
              </div>
            </div>

            {/* Prime Executive Card (Recommended) */}
            <div 
              onClick={() => scrollToTier('prime-section')}
              className="group relative bg-white rounded-2xl p-5 border-2 border-[#0081C7] shadow-sm hover:shadow transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-[#0081C7] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[12px]">workspace_premium</span> Recommended
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0081C7] ring-4 ring-sky-100"></span>
                  <h3 className="text-base font-bold text-[#0081C7]">Prime Row</h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">Acoustic sweet spot • Rows D – F</p>
              </div>
              <div className="pt-3 border-t border-sky-100 flex items-end justify-between">
                <div>
                  <span className="text-xs text-[#0081C7] block font-bold">Executive Tier</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#0081C7]">₹799</span>
                    <span className="text-xs text-slate-400">/ ticket</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-white bg-[#0081C7] px-3 py-1 rounded-lg shadow-sm hover:bg-[#006da8] transition-all">
                  Select Rows D–F →
                </span>
              </div>
            </div>

            {/* Classic Stalls Card */}
            <div 
              onClick={() => scrollToTier('classic-section')}
              className="group relative bg-white rounded-2xl p-5 border border-[#E8E8EC] hover:border-slate-300 shadow-sm hover:shadow transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-slate-100 text-slate-600 border-b border-l border-slate-200 text-[11px] font-bold uppercase tracking-wider">
                Value Tier
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-400 ring-4 ring-slate-100"></span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0081C7] transition-colors">Classic</h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">Ground tier & Wheelchair accessible • Rows G – H</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Standard Pass</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">₹299</span>
                    <span className="text-xs text-slate-400">/ ticket</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg group-hover:bg-slate-800 group-hover:text-white transition-all">
                  Select Rows G–H →
                </span>
              </div>
            </div>
          </div>

          {/* Main Seating Plan Board */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8EC] overflow-hidden mb-8">
            {/* Legend & Zoom Bar */}
            <div className="bg-slate-50/90 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-white border-2 border-slate-300 shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-700">1</span>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#0081C7] text-white flex items-center justify-center text-xs font-bold">✓</span>
                  <span className="text-[#0081C7] font-bold">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-200 border border-slate-300 text-slate-400 flex items-center justify-center text-[10px] font-bold">✕</span>
                  <span className="text-slate-400">Sold Out</span>
                </div>
              </div>

              {/* Zoom Buttons */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button 
                  onClick={() => setZoom((z) => Math.max(z - 0.1, 0.75))}
                  className="p-1.5 text-slate-500 hover:text-[#0081C7] hover:bg-slate-100 rounded-lg"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-lg block">zoom_out</span>
                </button>
                <span className="text-[11px] font-bold text-slate-500 px-2 min-w-[42px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button 
                  onClick={() => setZoom((z) => Math.min(z + 0.1, 1.25))}
                  className="p-1.5 text-slate-500 hover:text-[#0081C7] hover:bg-slate-100 rounded-lg"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-lg block">zoom_in</span>
                </button>
              </div>
            </div>

            {/* Seating Layout Canvas */}
            <div className="overflow-x-auto p-4 sm:p-8 lg:p-10 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30">
              <div 
                className="min-w-[880px] max-w-4xl mx-auto flex flex-col items-center transition-transform duration-200 origin-top"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* STAGE ARC */}
                <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center mb-12 pt-2">
                  <div className="w-full h-20 relative flex items-center justify-center">
                    <svg className="w-full h-full text-[#0081C7]" fill="none" viewBox="0 0 760 85">
                      <path d="M 50 80 Q 380 -5 710 80" fill="rgba(0,129,199,0.08)" />
                      <path d="M 50 80 Q 380 -5 710 80" stroke="#0081C7" strokeWidth="4.5" strokeLinecap="round" />
                    </svg>
                    <div className="absolute top-4 px-5 py-1.5 rounded-full bg-white border border-sky-300 shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-xs font-extrabold text-[#0081C7] uppercase tracking-wider">STAGE / SCREEN THIS WAY</span>
                    </div>
                  </div>
                </div>

                {/* TIER 1: BALCONY (Rows A - C) */}
                <div className="w-full mb-8 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm" id="balcony-section">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-sky-500"></span>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">Tier 1: VIP Balcony</h4>
                        <span className="text-[11px] text-slate-500">Front terrace elevation • Rows A – C</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
                      ₹499 per ticket
                    </span>
                  </div>

                  <div className="space-y-3 flex flex-col items-center">
                    {['A', 'B', 'C'].map((rowLabel) => (
                      <div key={rowLabel} className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                          {rowLabel}
                        </span>
                        <div className="flex gap-2">
                          {Array.from({ length: 14 }).map((_, i) => {
                            const num = `${i + 1}`;
                            const seatId = `${rowLabel}-${num}`;
                            const active = isSelected(seatId);
                            const isSoldOut = (rowLabel === 'A' && num === '3') || (rowLabel === 'B' && (num === '6' || num === '7'));

                            if (isSoldOut) {
                              return (
                                <button key={seatId} disabled className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed text-xs font-bold flex items-center justify-center">
                                  ✕
                                </button>
                              );
                            }

                            return (
                              <button
                                key={seatId}
                                onClick={() => toggleSeat(seatId, rowLabel, num, 'VIP Balcony', 499)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                                  active
                                    ? 'bg-[#0081C7] text-white border border-[#006da8] shadow-md scale-105'
                                    : 'bg-white text-slate-700 border border-slate-300 hover:border-[#0081C7] hover:text-[#0081C7]'
                                }`}
                              >
                                {active ? '✓' : num}
                              </button>
                            );
                          })}
                        </div>
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                          {rowLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TIER 2: PRIME EXECUTIVE (Rows D - F) */}
                <div className="w-full mb-8 p-5 sm:p-6 rounded-2xl bg-sky-50/40 border-2 border-[#0081C7] shadow-sm" id="prime-section">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#0081C7]"></span>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">Tier 2: Prime Row</h4>
                        <span className="text-[11px] text-[#0081C7] font-medium">Optimal acoustic sweet spot • Rows D – F</span>
                      </div>
                    </div>
                    <span className="px-3.5 py-1 rounded-full bg-[#0081C7] text-white text-xs font-black">
                      ₹799 per ticket
                    </span>
                  </div>

                  <div className="space-y-3 flex flex-col items-center">
                    {['D', 'E', 'F'].map((rowLabel) => (
                      <div key={rowLabel} className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-sky-100 text-[#0081C7] font-black text-xs flex items-center justify-center">
                          {rowLabel}
                        </span>
                        <div className="flex gap-2">
                          {Array.from({ length: 14 }).map((_, i) => {
                            const num = `${i + 1}`;
                            const seatId = `${rowLabel}-${num}`;
                            const active = isSelected(seatId);

                            return (
                              <button
                                key={seatId}
                                onClick={() => toggleSeat(seatId, rowLabel, num, 'Prime Executive', 799)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                                  active
                                    ? 'bg-[#0081C7] text-white border border-[#006da8] shadow-md scale-105'
                                    : 'bg-white text-brand-700 border border-sky-300 hover:border-[#0081C7] hover:bg-sky-50'
                                }`}
                              >
                                {active ? '✓' : num}
                              </button>
                            );
                          })}
                        </div>
                        <span className="w-7 h-7 rounded-lg bg-sky-100 text-[#0081C7] font-black text-xs flex items-center justify-center">
                          {rowLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TIER 3: CLASSIC STALLS (Rows G - H) */}
                <div className="w-full mb-8 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm" id="classic-section">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-400"></span>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">Tier 3: Classic Stalls</h4>
                        <span className="text-[11px] text-slate-500">Ground level seating • Rows G – H</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                      ₹299 per ticket
                    </span>
                  </div>

                  <div className="space-y-3 flex flex-col items-center">
                    {['G', 'H'].map((rowLabel) => (
                      <div key={rowLabel} className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                          {rowLabel}
                        </span>
                        <div className="flex gap-2">
                          {Array.from({ length: 14 }).map((_, i) => {
                            const num = `${i + 1}`;
                            const seatId = `${rowLabel}-${num}`;
                            const active = isSelected(seatId);

                            return (
                              <button
                                key={seatId}
                                onClick={() => toggleSeat(seatId, rowLabel, num, 'Classic Stalls', 299)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                                  active
                                    ? 'bg-[#0081C7] text-white border border-[#006da8] shadow-md scale-105'
                                    : 'bg-white text-slate-700 border border-slate-300 hover:border-[#0081C7]'
                                }`}
                              >
                                {active ? '✓' : num}
                              </button>
                            );
                          })}
                        </div>
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                          {rowLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* STICKY BOTTOM CHECKOUT DOCK */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-6px_25px_rgba(0,0,0,0.08)] z-50 py-3.5 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#0081C7] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              {selectedSeats.length}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {selectedSeats.length > 0 ? `${selectedSeats.length} Seat(s) Selected: ${formattedSeatsSummary}` : 'No seats selected'}
                </span>
                {selectedSeats.length > 0 && (
                  <button onClick={clearAllSeats} className="text-[11px] font-semibold text-rose-600 hover:underline">
                    Clear
                  </button>
                )}
              </div>
              <span className="text-[11px] text-slate-400 block">Seats held for {formatTimer(timeLeft)} • Instant E-Ticket confirmation</span>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
            <div className="text-right">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Grand Total:</span>
                <span className="text-2xl font-black text-[#0081C7] tracking-tight">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[11px] text-slate-400">Base ₹{baseTotal.toLocaleString('en-IN')} + GST/Fees ₹{gstFees.toLocaleString('en-IN')}</div>
            </div>
            <button
              onClick={handleProceed}
              disabled={selectedSeats.length === 0 || holding}
              className={`px-7 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                selectedSeats.length > 0 && !holding
                  ? 'bg-[#0081C7] hover:bg-[#006da8] text-white shadow-md shadow-sky-600/20 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>{holding ? 'Locking Seats...' : 'Proceed to Checkout'}</span>
              <span className="material-symbols-outlined text-base">lock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
