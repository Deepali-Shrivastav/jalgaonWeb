"use client";

import React, { useState, useEffect } from "react";

export interface NgoOrganization {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
}
export default function NgoSpotlight() {
  const [organisations, setOrganisations] = useState<NgoOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ngo/`
          : '/api/v1/ngo/';
        const res = await fetch(url);
        if (!res.ok) {
          console.warn('NGO API not available yet');
          setOrganisations([]);
          return;
        }
        const json = await res.json();
        const results = json.results || json.data || json || [];
        setOrganisations(results.slice(0, 3));
      } catch (err) {
        // Silently swallow network errors so Next.js doesn't pop up the dev overlay
      } finally {
        setLoading(false);
      }
    };
    fetchNgos();
  }, []);

  return (
    <section id="ngo-spotlight" className="bg-white py-section" aria-labelledby="ngo-heading">
      <div className="mx-auto max-w-container-max px-base sm:px-xxl">
        <h2 id="ngo-heading" className="mb-xl text-2xl font-extrabold text-ink-deep sm:text-3xl">NGO Spotlight</h2>

        {loading ? (
          <div className="grid grid-cols-1 gap-base md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-h-[260px] rounded-[24px] bg-surface-container-low animate-pulse"></div>
            ))}
          </div>
        ) : organisations.length === 0 ? (
          <p className="text-secondary text-center py-8">No featured NGOs currently available.</p>
        ) : (
          <div className="grid grid-cols-1 gap-base md:grid-cols-3">
            {organisations.map((organisation) => (
            <article key={organisation.name} className="group flex min-h-[260px] flex-col rounded-[24px] border border-hairline-soft bg-primary/[0.055] p-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg sm:p-xxl">
              <div className="mb-xl flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">{organisation.icon || 'volunteer_activism'}</span>
              </div>
              <h3 className="text-xl font-extrabold text-ink-deep">{organisation.name}</h3>
              <p className="mt-base text-sm leading-relaxed text-secondary">{organisation.description}</p>
              <p className="mt-auto flex items-center gap-xxs pt-xl text-xs font-extrabold text-primary">
                Support This Cause <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
              </p>
            </article>
          ))}
        </div>
      )}
      </div>
    </section>
  );
}
