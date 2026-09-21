'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isLinkValid = Boolean(uid && token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !token) return;

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${baseUrl}/api/v1/auth/password-reset-confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          token,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let msg = 'Failed to reset password.';
        if (data.error) {
          msg = data.error;
        } else if (typeof data === 'object') {
          msg = Object.values(data).flat().join(' ');
        }
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      setLoading(false);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Password reset confirm error:', err);
      setErrorMessage(err.message || 'Unable to connect to server. Please try again.');
      setLoading(false);
    }
  };

  if (!isLinkValid) {
    return (
      <div className="bg-white p-8 sm:p-10 md:p-12 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100/80 w-full text-center max-w-[460px]">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h1 className="text-2xl sm:text-[30px] font-bold text-[#0f172a] mb-3 tracking-tight">Invalid Link</h1>
        <p className="text-[#64748b] text-sm sm:text-[15px] leading-relaxed mb-8 max-w-[340px] mx-auto">
          This password reset link is missing required parameters or is invalid. Please request a new link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block w-full bg-[#0088cc] hover:bg-[#0077b6] text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-lg shadow-[#0088cc]/20 text-center text-base"
        >
          Request New Reset Link
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white p-8 sm:p-10 md:p-12 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100/80 w-full text-center max-w-[460px]">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl">task_alt</span>
        </div>
        <h1 className="text-2xl sm:text-[30px] font-bold text-[#0f172a] mb-3 tracking-tight">Password Changed!</h1>
        <p className="text-[#64748b] text-sm sm:text-[15px] leading-relaxed mb-8 max-w-[340px] mx-auto">
          Your password has been reset successfully. You can now log in to your account with your new password.
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-[#0088cc] hover:bg-[#0077b6] text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-lg shadow-[#0088cc]/20 text-center text-base"
        >
          Go to Home & Log In
        </Link>
      </div>
    );
  }

  return (
    <div 
      className="bg-white p-8 sm:p-10 md:p-12 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100/80 w-full text-center max-w-[460px]"
    >
      <div className="w-16 h-16 rounded-full bg-[#e8f5fd] flex items-center justify-center mx-auto mb-6">
        <svg className="w-7 h-7 text-[#0088cc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h1 className="text-2xl sm:text-[30px] font-bold text-[#0f172a] mb-2 tracking-tight">
        Set New Password
      </h1>
      <p className="text-[#64748b] text-sm sm:text-[15px] leading-relaxed mb-8 max-w-[340px] mx-auto">
        Enter your new password below to update your account credentials.
      </p>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-left flex items-start gap-2">
          <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        <div className="text-left">
          <label className="block text-sm font-semibold text-[#0f172a] mb-2 pl-1">New Password</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter at least 6 characters"
              className="w-full bg-[#f4f6f9] border border-[#e2e8f0] rounded-full px-5 py-3.5 pr-12 text-[#0f172a] text-sm font-normal placeholder:text-[#94a3b8] focus:bg-white focus:border-[#0088cc] focus:ring-4 focus:ring-[#0088cc]/10 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="text-left">
          <label className="block text-sm font-semibold text-[#0f172a] mb-2 pl-1">Confirm New Password</label>
          <input 
            type={showPassword ? 'text' : 'password'} 
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            className="w-full bg-[#f4f6f9] border border-[#e2e8f0] rounded-full px-5 py-3.5 text-[#0f172a] text-sm font-normal placeholder:text-[#94a3b8] focus:bg-white focus:border-[#0088cc] focus:ring-4 focus:ring-[#0088cc]/10 outline-none transition-all"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full bg-[#0088cc] hover:bg-[#0077b6] text-white font-bold py-3.5 px-6 rounded-full text-base transition-all shadow-lg shadow-[#0088cc]/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              <span>Updating...</span>
            </>
          ) : (
            'Reset Password'
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
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-200px)] bg-slate-50 flex items-center justify-center py-20 px-4">
        <Suspense fallback={
          <div className="p-8 bg-white rounded-3xl shadow-xl text-center">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary mb-2">progress_activity</span>
            <p className="text-slate-500 text-sm">Loading page...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
