'use client';

import React from 'react';
import { Ticket, MapPin, Calendar, Info, ShieldCheck } from 'lucide-react';

interface SeatItem {
  seat_number: string;
  row_label: string;
  section_name: string;
  price_at_booking?: string | number;
  price?: string | number;
}

interface OrderSummaryProps {
  bookingReference?: string;
  eventTitle?: string;
  venueName?: string;
  showDatetime?: string;
  seats: SeatItem[];
  subtotal: number | string;
  convenienceFee?: number | string;
  gstAmount?: number | string;
  discountAmount?: number | string;
  totalPayable: number | string;
  entryGate?: string;
}

export default function OrderSummaryCard({
  bookingReference = '#JLG-8F42K91',
  eventTitle = "Folk'kit STUDIO Live Concert",
  venueName = "Chhatrapati Sambhaji Raje Natyagruha, Jalgaon",
  showDatetime = "Wed, Oct 7, 2026 • 07:00 PM – 10:30 PM",
  seats,
  subtotal,
  convenienceFee = 40.00,
  gstAmount = 7.20,
  discountAmount = 0.00,
  totalPayable,
  entryGate = "Gate 1 & 2 (West Main Entrance)"
}: OrderSummaryProps) {
  const formattedSubtotal = Number(subtotal).toFixed(2);
  const formattedFee = Number(convenienceFee).toFixed(2);
  const formattedGst = Number(gstAmount).toFixed(2);
  const formattedDiscount = Number(discountAmount).toFixed(2);
  const formattedTotal = Number(totalPayable).toFixed(2);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">Payment Summary</span>
          <h3 className="text-lg font-bold text-slate-100">{eventTitle}</h3>
        </div>
        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
          Ref: {bookingReference}
        </span>
      </div>

      {/* VENUE & TIME METADATA */}
      <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{venueName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{showDatetime}</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Entry Zone: {entryGate}</span>
        </div>
      </div>

      {/* SELECTED SEATS LIST */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Allocated Seats ({seats.length})</span>
        <div className="space-y-1.5">
          {seats.map((seat, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs py-1.5 px-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
              <span className="font-medium text-slate-200">
                {seat.section_name} - Row {seat.row_label}, Seat {seat.seat_number}
              </span>
              <span className="font-semibold text-amber-400">
                ₹{seat.price_at_booking || seat.price || (Number(subtotal) / (seats.length || 1)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FINANCIAL BREAKDOWN */}
      <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Tickets Subtotal ({seats.length} seats)</span>
          <span className="text-slate-200">₹{formattedSubtotal}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span className="flex items-center gap-1">
            Convenience Fee <Info className="w-3 h-3 text-slate-500" />
          </span>
          <span className="text-slate-200">₹{formattedFee}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Integrated GST (18% on fee)</span>
          <span className="text-slate-200">₹{formattedGst}</span>
        </div>
        {Number(discountAmount) > 0 && (
          <div className="flex justify-between text-emerald-400 font-medium">
            <span>Discount / Voucher</span>
            <span>-₹{formattedDiscount}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-sm font-bold">
          <span className="text-slate-100">Total Payable</span>
          <span className="text-amber-400 text-lg">₹{formattedTotal}</span>
        </div>
        <p className="text-[10px] text-slate-500 text-right">Includes all entertainment taxes & local surcharges</p>
      </div>
    </div>
  );
}
