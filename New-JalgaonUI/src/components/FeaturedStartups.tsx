"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface StartupItem {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  stage: string;
  is_verified: boolean;
  industry: { id: number; name: string } | null;
  description: string;
}

export default function FeaturedStartups({ initialData }: { initialData?: StartupItem[] }) {
  const [startups, setStartups] = useState<StartupItem[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (initialData) return;
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/v1/startups/featured/`);
        if (res.ok) {
          const json = await res.json();
          const results = json.results || json.data || json || [];
          setStartups(results.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load featured startups", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [initialData, baseUrl]);

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "idea": return "Idea Stage";
      case "mvp": return "MVP";
      case "early_stage": return "Early Stage";
      case "growth": return "Growth";
      case "established": return "Established";
      default: return stage;
    }
  };

  return (
    <section id="startups" className="bg-surface py-section border-y border-hairline-soft" aria-labelledby="startups-heading">
      <div className="mx-auto max-w-container-max px-base sm:px-xxl">
        <div className="mb-xxl flex flex-col md:flex-row md:items-end justify-between gap-xl">
          <div>
            <p className="mb-xs text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Jalgaon Innovation</p>
            <h2 id="startups-heading" className="text-3xl font-extrabold text-ink-deep md:text-4xl">Featured Startups</h2>
          </div>
          <Link
            href="/startups"
            className="group flex items-center gap-xs font-bold text-primary hover:text-primary-deep transition-all text-sm self-start md:self-auto"
          >
            Explore Startup Directory
            <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-hairline-soft bg-white p-xl animate-pulse">
                <div className="mb-xl flex items-center justify-between">
                  <div className="h-14 w-14 rounded-2xl bg-surface"></div>
                  <div className="h-5 w-16 rounded bg-surface"></div>
                </div>
                <div className="h-6 w-3/4 rounded bg-surface mb-2"></div>
                <div className="h-4 w-1/2 rounded bg-surface mb-6"></div>
                <div className="h-10 w-full rounded bg-surface mt-xl"></div>
              </div>
            ))}
          </div>
        ) : startups.length === 0 ? (
          <div className="text-center bg-white rounded-3xl border border-hairline-soft p-12 max-w-xl mx-auto shadow-sm">
            <span className="material-symbols-outlined text-5xl text-secondary mb-4 block">rocket_launch</span>
            <h3 className="text-xl font-bold text-ink-deep mb-2">Are you a startup founder?</h3>
            <p className="text-secondary text-sm mb-6">List your venture in Jalgaon's tech ecosystem directory and gain visibility.</p>
            <Link
              href="/add-startup"
              className="bg-primary text-white font-bold px-8 py-3 rounded-full text-sm shadow-md hover:bg-primary-deep transition-colors inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Submit Your Startup
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 md:grid-cols-4">
            {startups.map((startup) => (
              <article
                key={startup.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-hairline-soft bg-white p-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/20"
              >
                <div>
                  <div className="mb-xl flex items-center justify-between">
                    <div className="w-14 h-14 bg-surface rounded-2xl border border-hairline-soft overflow-hidden flex items-center justify-center p-2 shrink-0">
                      {startup.logo ? (
                        <img
                          src={startup.logo.startsWith("http") ? startup.logo : `${baseUrl}${startup.logo}`}
                          alt={`${startup.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 text-3xl">rocket</span>
                      )}
                    </div>
                    <span className="bg-primary/10 text-primary border border-primary/15 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                      {getStageLabel(startup.stage)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="text-lg font-bold text-ink-deep group-hover:text-primary transition-colors line-clamp-1">
                      {startup.name}
                    </h3>
                    {startup.is_verified && (
                      <span className="material-symbols-outlined text-blue-500 text-base" title="Verified Startup" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                    )}
                  </div>

                  <p className="text-secondary text-xs font-semibold mb-3">
                    {startup.industry?.name || "Innovation"}
                  </p>

                  <p className="text-secondary text-xs line-clamp-3 mb-6">
                    {startup.description}
                  </p>
                </div>

                <Link
                  href={`/startups/${startup.slug}`}
                  className="w-full text-center bg-surface hover:bg-primary hover:text-white border border-outline-variant hover:border-transparent text-ink-deep font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  View Profile
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
