'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API request (UI only as requested)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
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
                Enter your registered email address below, and we'll send you instructions to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
                <div className="text-left">
                  <label className="block text-sm font-semibold text-ink-deep mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-deep text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-8">
                <Link 
                  href="/"
                  className="text-primary hover:text-primary-deep font-bold text-sm transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Check Your Email
              </h1>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                We've sent a password reset link to <strong className="text-slate-800">{email}</strong>. Please check your inbox and spam folder.
              </p>
              <Link 
                href="/"
                className="inline-block w-full bg-primary hover:bg-primary-deep text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md active:scale-95 text-center text-sm"
              >
                Back to Home
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
