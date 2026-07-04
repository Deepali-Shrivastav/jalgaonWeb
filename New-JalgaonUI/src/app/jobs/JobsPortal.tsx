'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const experienceLevels = [
  'Entry Level (0-2 Yrs)',
  'Mid Level (2-5 Yrs)',
  'Senior Level (5+ Yrs)',
];

export interface JobListing {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  type: string;
  typeBg?: string;
  logo: string;
  logoAlt?: string;
}


export default function JobsPortal() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Full-time']);
  const [selectedExp, setSelectedExp] = useState('Mid Level (2-5 Yrs)');

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchJobs = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/`
          : '/api/v1/jobs/';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const json = await res.json();
        setJobs(json.results || json.data || json || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <>
      <Header />
      <main className="pt-6 pb-16">
        {/* ─── Content Grid ─── */}
        <section
          id="jobs-content"
          className="max-w-container-max mx-auto px-xxl flex flex-col md:flex-row gap-xl"
          aria-label="Job listings"
        >
          {/* ─── Sidebar Filters ─── */}
          <aside className="w-full md:w-1/4" aria-label="Job filters">
            <div className="sticky top-24 bg-white rounded-xl border border-hairline-soft p-6 space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-3 text-primary">Filters</h2>
                <div className="h-1 w-12 bg-primary rounded-full mb-6" />
              </div>

              {/* Job Type */}
              <fieldset>
                <legend className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-4">
                  Job Type
                </legend>
                <div className="space-y-3">
                  {jobTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Experience Level */}
              <fieldset>
                <legend className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-4">
                  Experience Level
                </legend>
                <div className="space-y-3">
                  {experienceLevels.map((level) => (
                    <label
                      key={level}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="experience"
                        checked={selectedExp === level}
                        onChange={() => setSelectedExp(level)}
                        className="w-5 h-5 border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedExp('');
                }}
                className="w-full py-3 rounded-full border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* ─── Jobs List ─── */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-ink-deep">
                Latest Job Openings
              </h1>
              <span className="text-secondary text-sm">Showing {jobs.length} Jobs</span>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
                <h3 className="text-lg font-bold text-ink-deep">Loading jobs...</h3>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-500">
                <span className="material-symbols-outlined text-4xl mb-4">error</span>
                <h3 className="text-lg font-bold">Failed to load jobs</h3>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg text-secondary">No jobs found matching your criteria.</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {jobs.map((job) => (
                  <article
                    key={job.id}
                    className="bg-white rounded-xl border border-hairline-soft p-6 hover:shadow-lg hover:border-primary transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row gap-5 items-start">
                      {/* Company Logo */}
                      <div className="w-14 h-14 rounded-lg bg-surface-container-low flex items-center justify-center p-2 border border-hairline-soft shrink-0">
                        {job.logo ? (
                          <img
                            className="w-full h-full object-contain"
                            src={job.logo}
                            alt={job.logoAlt || job.company}
                            loading="lazy"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-secondary">business</span>
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <span
                            className={`${job.typeBg || 'bg-blue-50 text-primary'} px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap`}
                          >
                            {job.type}
                          </span>
                        </div>
                        <p className="text-secondary mb-3">{job.company}</p>
                        <div className="flex flex-wrap gap-4 text-secondary text-sm">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">
                              location_on
                            </span>
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">
                              payments
                            </span>
                            {job.salary}
                          </span>
                          <time className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">
                              schedule
                            </span>
                            {job.posted}
                          </time>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-3 md:mt-0 shrink-0">
                        <button className="flex-1 md:flex-initial bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primary-deep transition-all text-center active:scale-95 shadow-sm">
                          Apply Now
                        </button>
                        <button
                          className="p-3 border border-hairline-soft rounded-full hover:bg-surface-container-low transition-colors"
                          aria-label={`Bookmark ${job.title}`}
                        >
                          <span className="material-symbols-outlined">
                            bookmark
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
