"use client";

import React, { useState, useEffect } from "react";

export interface JobOpening {
  id?: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type?: string;
  icon?: string;
}
export default function JobOpenings() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/`
          : '/api/v1/jobs/';
        const res = await fetch(url);
        if (!res.ok) {
          console.warn('Jobs API not available yet');
          setJobs([]);
          return;
        }
        const json = await res.json();
        const results = json.results || json.data || json || [];
        setJobs(results.slice(0, 3));
      } catch (err) {
        // Silently swallow network errors so Next.js doesn't pop up the dev overlay
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <section id="jobs" className="bg-white py-section" aria-labelledby="jobs-heading">
      <div className="mx-auto max-w-container-max px-base sm:px-xxl">
        <div className="mb-xxl flex items-end justify-between gap-xl">
          <div>
            <p className="mb-xs text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Build your future</p>
            <h2 id="jobs-heading" className="text-3xl font-extrabold text-ink-deep md:text-4xl">Recent Job Openings</h2>
          </div>
          <span className="hidden rounded-full bg-primary/10 px-base py-xs text-xs font-extrabold text-primary sm:block">
            {jobs.length > 0 ? `${jobs.length} new opportunities` : 'New opportunities'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-xl md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-hairline-soft bg-surface p-xl sm:p-xxl animate-pulse">
                <div className="mb-xl flex items-center justify-between gap-base">
                  <div className="h-12 w-12 rounded-xl bg-surface-container-low"></div>
                  <div className="h-6 w-20 rounded-full bg-surface-container-low"></div>
                </div>
                <div className="h-6 w-3/4 rounded bg-surface-container-low mb-2"></div>
                <div className="h-4 w-1/2 rounded bg-surface-container-low mb-6"></div>
                <div className="mt-xl space-y-3 border-t border-hairline-soft pt-base">
                  <div className="h-4 w-2/3 rounded bg-surface-container-low"></div>
                  <div className="h-4 w-1/2 rounded bg-surface-container-low"></div>
                </div>
                <div className="mt-xl h-5 w-1/3 rounded bg-surface-container-low"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-secondary text-center py-8">No recent job openings available.</p>
        ) : (
          <div className="grid grid-cols-1 gap-xl md:grid-cols-3">
            {jobs.map((job) => (
              <article key={job.id || job.title} className="group rounded-xl border border-hairline-soft bg-surface p-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl sm:p-xxl">
                <div className="mb-xl flex items-center justify-between gap-base">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined" aria-hidden="true">{job.icon || 'work'}</span>
                  </span>
                  <span className="rounded-full bg-white px-base py-xs text-[10px] font-extrabold uppercase tracking-widest text-secondary shadow-sm">
                    {job.type || 'Full-time'}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-ink-deep">{job.title}</h3>
                <p className="mt-xxs font-medium text-secondary">{job.company}</p>
                <div className="mt-xl space-y-xs border-t border-hairline-soft pt-base text-sm">
                  <p className="flex items-center gap-xs text-secondary"><span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">location_on</span>{job.location}</p>
                  <p className="flex items-center gap-xs font-bold text-ink-deep"><span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">payments</span>{job.salary || 'Competitive'}</p>
                </div>
                <div className="mt-xl flex items-center gap-xs font-extrabold text-primary">
                  Applications open <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
