'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const isEmail = identifier.includes('@');
    const payload = isEmail
      ? { email: identifier.trim() }
      : { phone_number: identifier.trim() };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${baseUrl}/api/v1/auth/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText =
          data.detail ||
          data.error ||
          (typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Failed to request password reset.');
        setErrorMessage(errorText);
        setLoading(false);
        return;
      }

      setLoading(false);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setErrorMessage(err.message || 'Unable to connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-200px)] bg-slate-50/50 flex items-center justify-center py-16 px-4">
        <div 
          className="bg-white p-8 sm:p-10 md:p-12 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100/80 w-full text-center max-w-[460px]"
        >
          {!submitted ? (
            <>
              {/* Reset Lock Icon Badge */}
              <div className="w-16 h-16 rounded-full bg-[#e8f5fd] flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-[#0088cc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <rect x="9.5" y="11.5" width="5" height="4" rx="0.8" strokeWidth="2" />
                  <path d="M10.5 11.5V10a1.5 1.5 0 0 1 3 0v1.5" strokeWidth="2" />
                </svg>
              </div>

              {/* Title & Description */}
              <h1 className="text-2xl sm:text-[30px] font-bold text-[#0f172a] mb-2 tracking-tight">
                Forgot Password?
              </h1>
              <p className="text-[#64748b] text-sm sm:text-[15px] leading-relaxed mb-8 max-w-[340px] mx-auto">
                Enter your registered email address below, and we'll send you instructions to reset your password.
              </p>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-left flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                <div className="text-left">
                  <label className="block text-sm font-semibold text-[#0f172a] mb-2 pl-1">
                    Email Address
                  </label>
                  <input 
                    type="text" 
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#f4f6f9] border border-[#e2e8f0] rounded-full px-5 py-3.5 text-[#0f172a] text-sm font-normal placeholder:text-[#94a3b8] focus:bg-white focus:border-[#0088cc] focus:ring-4 focus:ring-[#0088cc]/10 outline-none transition-all"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || !identifier.trim()}
                  className="w-full bg-[#0088cc] hover:bg-[#0077b6] text-white font-bold py-3.5 px-6 rounded-full text-base transition-all shadow-lg shadow-[#0088cc]/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>

              <div className="mt-6">
                <Link 
                  href="/"
                  className="text-[#0088cc] hover:underline font-bold text-base transition-colors inline-block"
                >
                  Back to Home
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
              </div>
              <h1 className="text-2xl sm:text-[30px] font-bold text-[#0f172a] mb-3 tracking-tight">
                Reset Link Sent
              </h1>
              <p className="text-[#64748b] text-sm sm:text-[15px] leading-relaxed mb-8 max-w-[340px] mx-auto">
                If an account associated with <strong className="text-[#0f172a]">{identifier}</strong> exists, we have sent instructions to reset your password. Please check your inbox and spam folder.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center justify-center w-full bg-[#0088cc] hover:bg-[#0077b6] text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-lg shadow-[#0088cc]/20 text-center text-base"
              >
                <span>Return to Home</span>
              </Link>
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}

