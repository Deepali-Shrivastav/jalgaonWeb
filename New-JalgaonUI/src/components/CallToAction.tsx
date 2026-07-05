import React from 'react';
import Link from 'next/link';

export default function CallToAction() {
  return (
    <section id="list-your-business" className="bg-surface-container-low px-base py-xl sm:px-xxl sm:py-xxl" aria-labelledby="business-cta-heading">
      <div className="relative mx-auto max-w-container-max overflow-hidden rounded-[28px] bg-[#071317] text-white shadow-xl">
        <div className="pointer-events-none absolute -right-32 -top-52 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-64 left-1/4 h-[440px] w-[440px] rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 grid grid-cols-1 items-center gap-xxxl px-xl py-xxxl sm:px-xxxl lg:grid-cols-[1.05fr_1fr] lg:gap-section lg:px-[72px] lg:py-[66px]">
          <div className="w-full">
            <h2 id="business-cta-heading" className="text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl">
              Ready to list your business?
            </h2>
            <p className="mt-xl text-base leading-relaxed text-white/65 sm:text-lg">
              Join the premier directory of Jalgaon and connect with thousands of local customers daily.
            </p>
            <div className="mt-xxxl flex flex-col gap-base sm:flex-row">
              <Link href="/add-listing" className="rounded-full bg-primary px-xxxl py-md font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-deep text-center">
                Add Your Business
              </Link>
              <Link href="/advertise" className="rounded-full border border-white/15 bg-white/10 px-xxxl py-md font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15 text-center">
                Contact Support
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-base sm:grid-cols-2 sm:gap-xl">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.055] p-xl backdrop-blur-sm transition-colors hover:bg-white/[0.08]">
              <span className="material-symbols-outlined mb-xl text-3xl text-primary" aria-hidden="true">verified</span>
              <h3 className="font-extrabold">Verified Trust</h3>
              <p className="mt-xs text-sm leading-relaxed text-white/55">Every listing is manually reviewed for authenticity.</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.055] p-xl backdrop-blur-sm transition-colors hover:bg-white/[0.08]">
              <span className="material-symbols-outlined mb-xl text-3xl text-primary" aria-hidden="true">analytics</span>
              <h3 className="font-extrabold">Deep Insights</h3>
              <p className="mt-xs text-sm leading-relaxed text-white/55">Get monthly traffic reports for your business page.</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.055] p-xl backdrop-blur-sm transition-colors hover:bg-white/[0.08]">
              <span className="material-symbols-outlined mb-xl text-3xl text-primary" aria-hidden="true">bolt</span>
              <h3 className="font-extrabold">Fast Setup</h3>
              <p className="mt-xs text-sm leading-relaxed text-white/55">Go live within 24 hours of submission.</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.055] p-xl backdrop-blur-sm transition-colors hover:bg-white/[0.08]">
              <span className="material-symbols-outlined mb-xl text-3xl text-primary" aria-hidden="true">forum</span>
              <h3 className="font-extrabold">Direct Lead</h3>
              <p className="mt-xs text-sm leading-relaxed text-white/55">Customers contact you directly via WhatsApp or call.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
