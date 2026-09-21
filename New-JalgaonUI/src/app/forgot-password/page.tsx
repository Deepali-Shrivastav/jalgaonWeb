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
      <main className="min-h-[calc(100vh-200px)] bg-slate-50 flex items-center justify-center py-20 px-4">
        <div 
          className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 w-full text-center"
          style={{ maxWidth: '448px', minWidth: '280px' }}
        >
          {!submitted ? (
            <>
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">lock_reset</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                Forgot Password?
              </h1>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                Enter your registered email address or mobile number below, and we'll send you instructions to reset your password.
              </p>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-left flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
                <div className="text-left">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address or Mobile Number
                  </label>
                  <input 
                    type="text" 
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or 10-digit mobile"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || !identifier.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">send</span>
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8">
                <Link 
                  href="/"
                  className="text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  <span>Back to Login</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Reset Link Sent
              </h1>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                If an account associated with <strong className="text-slate-800">{identifier}</strong> exists, we have dispatched a password reset link. Please check your inbox and spam folder.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center justify-center w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md active:scale-95 text-center text-sm gap-2"
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

