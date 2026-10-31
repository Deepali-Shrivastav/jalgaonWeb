'use client';

import React, { useState } from 'react';
import { Armchair, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';

export interface SeatData {
  id: number;
  seat_number: string;
  row_label: string;
  section_name: string;
  section_id: number;
  price: string | number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED' | 'UNAVAILABLE' | 'MARKETING_HOLD';
}

export interface SectionGroup {
  section_id: number;
  section_name: string;
  seats: SeatData[];
}

interface SeatMapProps {
  sections: SectionGroup[];
  selectedSeatIds: number[];
  onToggleSeat: (seat: SeatData) => void;
  maxSeats?: number;
}

export default function SeatMapCanvas2D({
  sections,
  selectedSeatIds,
  onToggleSeat,
  maxSeats = 8
}: SeatMapProps) {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const getSeatColor = (seat: SeatData, isSelected: boolean) => {
    if (isSelected) return 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400 shadow-lg scale-110';
    switch (seat.status) {
      case 'AVAILABLE':
        return 'bg-emerald-900/60 hover:bg-emerald-600 text-emerald-100 border-emerald-500/40 hover:scale-105 cursor-pointer';
      case 'HELD':
        return 'bg-amber-900/40 text-amber-400/60 border-amber-600/30 cursor-not-allowed opacity-60';
      case 'BOOKED':
        return 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-40';
      case 'BLOCKED':
      case 'MARKETING_HOLD':
      case 'UNAVAILABLE':
      default:
        return 'bg-rose-950/40 text-rose-400/40 border-rose-900/40 cursor-not-allowed opacity-40';
    }
  };

  const getStatusIcon = (seat: SeatData, isSelected: boolean) => {
    if (isSelected) return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (seat.status === 'BOOKED' || seat.status === 'HELD') return <Lock className="w-3 h-3" />;
    return null;
  };

  const filteredSections = activeCategory === 'ALL'
    ? sections
    : sections.filter(s => s.section_name.toUpperCase().includes(activeCategory));

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3 items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex gap-2">
          {['ALL', 'BALCONY', 'PRIME', 'CLASSIC'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'ALL TIERS' : cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Selected: <span className="text-amber-400 font-bold">{selectedSeatIds.length}</span> / {maxSeats} seats
        </div>
      </div>

      {/* STAGE CONTAINER */}
      <div className="w-full flex flex-col items-center my-6">
        <div className="w-3/4 h-10 bg-gradient-to-b from-amber-500/20 to-transparent border-t-2 border-amber-400 rounded-t-full flex items-center justify-center shadow-[0_-10px_25px_rgba(245,158,11,0.15)]">
          <span className="text-xs tracking-[0.3em] font-bold text-amber-300 uppercase">STAGE / SCREEN THIS WAY</span>
        </div>
      </div>

      {/* SEAT MAP GRID BY SECTION */}
      <div className="space-y-10 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredSections.map((section) => (
          <div key={section.section_id} className="space-y-4">
            <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-3">
              <h4 className="font-bold text-sm tracking-wide text-slate-200">{section.section_name}</h4>
              <span className="text-xs text-amber-400/80 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-800/40">
                ₹{section.seats[0]?.price || '399'}
              </span>
            </div>

            {/* SEAT GRID */}
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2 justify-center p-4 bg-slate-900/40 rounded-xl border border-slate-800/60">
              {section.seats.map((seat) => {
                const isSelected = selectedSeatIds.includes(seat.id);
                const isClickable = seat.status === 'AVAILABLE' || isSelected;

                return (
                  <button
                    key={seat.id}
                    disabled={!isClickable}
                    onClick={() => onToggleSeat(seat)}
                    className={`h-11 rounded-lg border flex flex-col items-center justify-center transition-all duration-200 select-none ${getSeatColor(seat, isSelected)}`}
                    title={`${section.section_name} - Row ${seat.row_label}, Seat ${seat.seat_number} (₹${seat.price}) - Status: ${seat.status}`}
                  >
                    <span className="text-[10px] font-bold tracking-tighter leading-none">
                      {seat.row_label}{seat.seat_number}
                    </span>
                    <div className="mt-0.5">
                      {getStatusIcon(seat, isSelected) || <Armchair className="w-3 h-3 opacity-60" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* COLOR LEGEND */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-900/60 border border-emerald-500/40" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-400 border border-amber-300" />
          <span className="text-amber-300 font-semibold">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-900/40 border border-amber-600/30" />
          <span>Reserved / Held</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700 opacity-60" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-950/40 border border-rose-900/40" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
