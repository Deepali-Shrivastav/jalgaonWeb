'use client';

import React from 'react';
import { User, Mail, Phone, MessageSquare } from 'lucide-react';

interface RecipientFormProps {
  name: string;
  email: string;
  phone: string;
  sendWhatsapp: boolean;
  onChangeName: (val: string) => void;
  onChangeEmail: (val: string) => void;
  onChangePhone: (val: string) => void;
  onToggleWhatsapp: (val: boolean) => void;
}

export default function TicketRecipientForm({
  name,
  email,
  phone,
  sendWhatsapp,
  onChangeName,
  onChangeEmail,
  onChangePhone,
  onToggleWhatsapp
}: RecipientFormProps) {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-slate-100">Ticket Recipient Details</h3>
        <p className="text-xs text-slate-400">Digital passes will be dispatched to this email and WhatsApp number.</p>
      </div>

      <div className="space-y-4 text-xs">
        {/* FULL NAME */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-300">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="e.g. Anand Patil"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* EMAIL ADDRESS */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => onChangeEmail(e.target.value)}
              placeholder="anand.patil@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* MOBILE NUMBER */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-300">Mobile Number (For M-Ticket SMS / WhatsApp)</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => onChangePhone(e.target.value)}
              placeholder="9823012345"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* WHATSAPP DISPATCH TOGGLE */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="font-medium text-slate-200">Instant WhatsApp M-Ticket</p>
              <p className="text-[10px] text-slate-400">Receive QR pass directly on WhatsApp upon payment</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={sendWhatsapp}
            onChange={(e) => onToggleWhatsapp(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
