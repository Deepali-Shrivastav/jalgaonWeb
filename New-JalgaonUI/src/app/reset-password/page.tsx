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
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 w-full text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Invalid Link</h1>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
          This password reset link is missing required parameters or is invalid. Please request a new link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md active:scale-95 text-center text-sm"
        >
          Request New Reset Link
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 w-full text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl">task_alt</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Password Changed!</h1>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
          Your password has been reset successfully. You can now log in to your account with your new password.
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md active:scale-95 text-center text-sm"
        >
          Go to Home & Log In
        </Link>
      </div>
    );
  }

  return (
    <div 
      className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 w-full text-center"
      style={{ maxWidth: '448px', minWidth: '280px' }}
    >
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="material-symbols-outlined text-3xl">key</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
        Set New Password
      </h1>
      <p className="text-slate-500 mb-8 leading-relaxed text-sm">
        Enter your new password below to update your account credentials.
      </p>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-left flex items-start gap-2">
          <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        <div className="text-left">
          <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter at least 6 characters"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-12 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="text-left">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
          <input 
            type={showPassword ? 'text' : 'password'} 
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              <span>Updating Password...</span>
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="mt-8">
        <Link 
          href="/"
          className="text-primary hover:underline font-bold text-sm transition-colors"
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
