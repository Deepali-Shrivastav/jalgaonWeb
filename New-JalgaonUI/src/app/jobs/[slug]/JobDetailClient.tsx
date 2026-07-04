'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

interface JobDetail {
  id: number;
  title: string;
  slug: string;
  company: string;
  company_logo: string | null;
  location: string;
  job_type: string;
  category: { id: number, name: string, slug: string } | null;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  requirements: string | null;
  apply_url: string | null;
  deadline: string | null;
  view_count: number;
  created_at: string;
}

export default function JobDetailClient({ slug }: { slug: string }) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/jobs/${encodeURIComponent(slug)}/`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Job not found');
          throw new Error('Failed to fetch job details');
        }
        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-20">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
        <h2 className="text-2xl font-bold text-ink-deep mb-4">{error || 'Job not found'}</h2>
        <Link href="/jobs" className="text-primary font-bold hover:underline">
          &larr; Back to Jobs
        </Link>
      </div>
    );
  }

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not Disclosed';
    if (min && !max) return `₹${min.toLocaleString()}+ / yr`;
    if (!min && max) return `Up to ₹${max.toLocaleString()} / yr`;
    return `₹${min?.toLocaleString()} - ₹${max?.toLocaleString()} / yr`;
  };

  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-hairline-soft overflow-hidden p-8 md:p-12">
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8 pb-8 border-b border-hairline-soft">
        <div className="w-20 h-20 bg-surface-container-low rounded-xl flex items-center justify-center shrink-0 border border-hairline-soft overflow-hidden">
          {job.company_logo ? (
            <img src={job.company_logo} alt={job.company} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-4xl text-secondary">business</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {job.job_type.replace('_', ' ')}
            </span>
            {isExpired && (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Expired
              </span>
            )}
            <span className="text-secondary text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              {job.view_count} views
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-ink-deep mb-2">{job.title}</h1>
          <p className="text-lg text-secondary font-medium">{job.company}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="flex items-center gap-3 bg-surface-container-lowest p-4 rounded-xl border border-hairline-soft">
          <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
          <div>
            <p className="text-xs text-secondary font-bold uppercase">Location</p>
            <p className="font-semibold text-ink-deep">{job.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-lowest p-4 rounded-xl border border-hairline-soft">
          <span className="material-symbols-outlined text-primary text-2xl">payments</span>
          <div>
            <p className="text-xs text-secondary font-bold uppercase">Salary</p>
            <p className="font-semibold text-ink-deep">{formatSalary(job.salary_min, job.salary_max)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-lowest p-4 rounded-xl border border-hairline-soft">
          <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
          <div>
            <p className="text-xs text-secondary font-bold uppercase">Posted On</p>
            <p className="font-semibold text-ink-deep">
              {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-bold text-ink-deep mb-4">Job Description</h3>
        <div 
          className="prose prose-lg max-w-none text-secondary leading-relaxed"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description || '') }}
        />
      </div>

      {job.requirements && (
        <div className="mb-10">
          <h3 className="text-xl font-bold text-ink-deep mb-4">Requirements</h3>
          <div 
            className="prose prose-lg max-w-none text-secondary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.requirements || '') }}
          />
        </div>
      )}

      {!isExpired && (
        <div className="flex justify-center pt-8 border-t border-hairline-soft">
          {job.apply_url ? (
            <a 
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary hover:bg-primary-deep text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              Apply Externally <span className="material-symbols-outlined">open_in_new</span>
            </a>
          ) : (
            <Link 
              href={`/jobs/${job.slug}/apply`}
              className="bg-primary hover:bg-primary-deep text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Apply Now
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
