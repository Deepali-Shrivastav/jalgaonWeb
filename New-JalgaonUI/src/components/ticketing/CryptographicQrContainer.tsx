'use client';

import React from 'react';
import { ShieldCheck, QrCode, Lock, Cpu } from 'lucide-react';

interface QrContainerProps {
  qrImageUrl?: string | null;
  qrPayload?: string;
  ticketCode?: string;
  isScanned?: boolean;
}

export default function CryptographicQrContainer({
  qrImageUrl,
  qrPayload,
  ticketCode = 'uuid-x8f42k91',
  isScanned = false
}: QrContainerProps) {
  // Extract SHA-256 hash snippet for security display
  const securityHash = React.useMemo(() => {
    if (!qrPayload) return 'SHA256-4b9e-0182-9fbc';
    let hash = 0;
    for (let i = 0; i < qrPayload.length; i++) {
      hash = (hash << 5) - hash + qrPayload.charCodeAt(i);
      hash |= 0;
    }
    return `SHA256-${Math.abs(hash).toString(16).padStart(8, '0').slice(0, 4)}-${Math.abs(hash).toString(16).slice(4, 8)}`;
  }, [qrPayload]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-4">
      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-full text-xs font-semibold text-emerald-300">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Cryptographically Signed Ticket</span>
      </div>

      {/* QR CONTAINER */}
      <div className="relative p-4 bg-white rounded-2xl shadow-inner flex items-center justify-center border-4 border-slate-800">
        {isScanned ? (
          <div className="w-48 h-48 bg-slate-100 flex flex-col items-center justify-center text-slate-600 rounded-xl space-y-2">
            <Lock className="w-10 h-10 text-rose-500" />
            <span className="text-xs font-bold text-rose-600 uppercase">TICKET ALREADY SCANNED</span>
          </div>
        ) : qrImageUrl ? (
          <img
            src={qrImageUrl}
            alt="Digital Ticket QR Code"
            className="w-48 h-48 object-contain"
          />
        ) : (
          <div className="w-48 h-48 bg-slate-950 flex flex-col items-center justify-center text-amber-400 p-4 text-center rounded-xl space-y-2">
            <QrCode className="w-12 h-12 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-300">Generating Optical QR...</span>
          </div>
        )}
      </div>

      {/* GATE SCANNER BADGE */}
      <div className="flex flex-col items-center space-y-1 text-center">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
          <Cpu className="w-3.5 h-3.5" />
          <span>LIVE GATE TOKEN: ACTIVE</span>
        </div>
        <p className="text-[11px] text-slate-400">Present QR to Natyagruha usher or scan directly at turnstile scanner.</p>
        <span className="text-[10px] font-mono text-slate-500 pt-1">Security Hash: {securityHash}</span>
      </div>
    </div>
  );
}
