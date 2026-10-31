'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CryptographicQrContainer from '@/components/ticketing/CryptographicQrContainer';
import { ArrowLeft, Download, Share2, MapPin, Calendar, DoorOpen, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function DigitalTicketPage({ params }: { params: Promise<{ ticket_code: string }> | { ticket_code: string } }) {
  const unwrappedParams = (React as any).use ? (React as any).use(params) : params;
  const ticketCode = unwrappedParams?.ticket_code || 'TICKET-REF';
  const router = useRouter();

  const handleDownloadPdf = () => {
    alert('Downloading Official PDF Ticket Pass...');
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(`Here is my official ticket for Folk'kit STUDIO Live Concert! Booking Ref: #JLG-8F42K91`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Bookings</span>
          </button>

          <h1 className="text-xl font-black text-slate-100">Your Digital Ticket</h1>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40">
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmed & Valid</span>
          </div>
        </div>

        {/* PASS CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          {/* TITLE & EVENT INFO */}
          <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Season 04 • Live Concert</span>
              <h2 className="text-2xl font-black text-slate-100">Folk&apos;kit STUDIO Live Concert</h2>
              <p className="text-xs text-slate-400">Curated by Munesh Dhake & Ishwar Hire</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Issued To</span>
              <span className="text-sm font-bold text-slate-200">Anand Patil</span>
            </div>
          </div>

          {/* GRID INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <Calendar className="w-4 h-4 text-amber-400" /> Date & Schedule
              </span>
              <p className="font-bold text-slate-200">Wed Oct 7, 2026</p>
              <p className="text-slate-400 text-[11px]">07:00 PM – 10:30 PM IST</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <DoorOpen className="w-4 h-4 text-amber-400" /> Gate & Entry Zone
              </span>
              <p className="font-bold text-emerald-400">Gate 1 & 2</p>
              <p className="text-slate-400 text-[11px]">West Main Entrance</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <MapPin className="w-4 h-4 text-amber-400" /> Venue
              </span>
              <p className="font-bold text-slate-200">Chh. Sambhaji Raje Natyagruha</p>
              <p className="text-slate-400 text-[11px]">Jalgaon, MH 425001</p>
            </div>
          </div>

          {/* SEATS BAR */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Allocated Seats (2 Confirmed):</span>
            <div className="flex gap-2 font-mono text-amber-300 font-bold">
              <span className="bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-800/40">Prime Row: Seat P12</span>
              <span className="bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-800/40">Prime Row: Seat P13</span>
            </div>
          </div>

          {/* CRYPTOGRAPHIC QR CODE CONTAINER */}
          <CryptographicQrContainer
            qrImageUrl="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=JLG-8F42K91-CONFIRMED"
            ticketCode={ticketCode}
          />

          {/* DOWNLOAD & SHARE BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={handleDownloadPdf}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-2xl font-bold text-xs tracking-wide shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Ticket (PDF)</span>
            </button>

            <button
              onClick={handleShareWhatsapp}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 py-3.5 rounded-2xl font-bold text-xs tracking-wide border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Share Ticket via WhatsApp</span>
            </button>
          </div>

          {/* GUIDELINES */}
          <div className="space-y-3 pt-6 border-t border-slate-800 text-xs text-slate-400">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Important Entry & Venue Guidelines</span>
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] leading-relaxed">
              <li>Doors open strictly at 06:15 PM (30 minutes prior to show time).</li>
              <li>Set screen brightness to maximum for rapid optical scanner reading at turnstiles.</li>
              <li>Each QR code allows a single admission scan per seat. Duplicated copies will be flagged.</li>
              <li>Free multi-level parking included at Natyagruha East Gate with Booking Ref #JLG-8F42K91.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
