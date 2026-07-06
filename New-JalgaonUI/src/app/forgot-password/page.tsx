import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-[448px] w-full border border-slate-100 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Reset Password
          </h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Please contact the administrator or support team to reset your password. Automated password recovery is currently under development.
          </p>
          <Link 
            href="/"
            className="inline-block bg-primary hover:bg-primary-deep text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
