'use client';

import React, { useState, useEffect, useContext, useMemo } from 'react';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import JobApplyModal from '@/components/JobApplyModal';
import { AuthContext } from '@/context/AuthContext';

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
  posted_by_name: string;
  posted_by_phone: string;
  posted_by_email: string;
  status: string;
}

export default function JobDetailClient({ slug }: { slug: string }) {
  const safeSlug = (() => {
    try {
      return encodeURIComponent(decodeURIComponent(slug));
    } catch {
      return encodeURIComponent(slug);
    }
  })();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLogin } = useContext(AuthContext);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveActionMsg, setSaveActionMsg] = useState("");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const isExpired = useMemo(() => {
    if (!job) return false;
    if (job.status === 'expired') return true;
    if (job.deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(job.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate < today;
    }
    return false;
  }, [job]);

  const handleSaveJob = async () => {
    if (!isLogin) {
      setSaveActionMsg("Please login to save this job.");
      return;
    }

    setIsSaving(true);
    setSaveActionMsg("");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/v1/jobs/${job?.slug}/save/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setIsSaved(true);
        setSaveActionMsg("Job saved successfully!");
      } else {
        const errorData = await res.json();
        setSaveActionMsg(errorData[0] || errorData.error || "Failed to save job.");
      }
    } catch (err: any) {
      setSaveActionMsg("Failed to save job.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveActionMsg(""), 5000);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${baseUrl}/api/v1/jobs/${safeSlug}/`, { headers });
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
  }, [safeSlug]);

  // Execute scripts within the job containers when the content changes
  useEffect(() => {
    if (!job) return;

    const executeScripts = (containerId: string) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      const scripts = container.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');

        // Copy all attributes
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });

        // Copy inner content
        if (oldScript.innerHTML) {
          newScript.innerHTML = oldScript.innerHTML;
        } else if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }

        // Replace old script with new script to force execution
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    };

    if (job.description) executeScripts('job-description-container');
    if (job.requirements) executeScripts('job-requirements-container');
  }, [job]);

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

      {saveActionMsg && (
        <div className={`p-4 rounded-xl mb-6 shadow-sm font-medium ${saveActionMsg.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {saveActionMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="flex items-start gap-3 bg-surface-container-lowest p-4 rounded-xl border border-hairline-soft h-full">
          <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5">location_on</span>
          <div>
            <p className="text-xs text-secondary font-bold uppercase mb-1">Location</p>
            <p className="font-semibold text-ink-deep">{job.location}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-surface-container-lowest p-4 rounded-xl border border-hairline-soft h-full">
          <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5">payments</span>
          <div>
            <p className="text-xs text-secondary font-bold uppercase mb-1">Salary</p>
            <p className="font-semibold text-ink-deep">{formatSalary(job.salary_min, job.salary_max)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-surface-container-lowest p-4 rounded-xl border border-hairline-soft h-full">
          <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5">schedule</span>
          <div>
            <p className="text-xs text-secondary font-bold uppercase mb-1">Posted On</p>
            <p className="font-semibold text-ink-deep">
              {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-surface-container-lowest p-4 rounded-xl border border-hairline-soft h-full">
          <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5">contact_phone</span>
          <div className="break-all">
            <p className="text-xs text-secondary font-bold uppercase mb-1">Recruiter Contact</p>
            <p className="font-semibold text-ink-deep">{job.posted_by_phone || 'Not Available'}</p>
            {job.posted_by_email && (
              <p className="text-sm text-secondary mt-1">{job.posted_by_email}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-bold text-ink-deep mb-4">Job Description</h3>
        <div
          id="job-description-container"
          className="prose prose-lg max-w-none text-secondary leading-relaxed"
          dangerouslySetInnerHTML={{ __html: job.description || '' }}
        />
      </div>

      {job.requirements && (
        <div className="mb-10">
          <h3 className="text-xl font-bold text-ink-deep mb-4">Requirements</h3>
          <div
            id="job-requirements-container"
            className="prose prose-lg max-w-none text-secondary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: job.requirements || '' }}
          />
        </div>
      )}

      {!isExpired && (
        <div className="flex justify-center items-center gap-4 pt-8 border-t border-hairline-soft">
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="bg-primary hover:bg-primary-deep text-white px-8 py-3 rounded-full font-semibold text-base shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5"
          >
            Apply Now
          </button>
          <button
            onClick={handleSaveJob}
            disabled={isSaving || isSaved}
            className={`px-8 py-3 rounded-full font-semibold text-base transition-all flex items-center gap-2 disabled:opacity-50 transform hover:-translate-y-0.5 ${
              isSaved
                ? 'bg-green-100 text-green-700 border-2 border-green-200 cursor-not-allowed hover:translate-y-0'
                : 'bg-transparent text-primary border-2 border-primary hover:bg-primary/5'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSaving ? 'progress_activity' : (isSaved ? 'bookmark_added' : 'bookmark_border')}
            </span>
            {isSaving ? 'Saving...' : (isSaved ? 'Saved' : 'Save Job')}
          </button>
        </div>
      )}

      <JobApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        job={job}
        baseUrl={baseUrl}
      />
    </article>
  );
}
