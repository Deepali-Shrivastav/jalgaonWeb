"use client";

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function AddJobClient() {
  const router = useRouter();
  const { user, isLogin } = useContext(AuthContext);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'full_time',
    category: '',
    salary_min: '',
    salary_max: '',
    description: '',
    requirements: '',
    apply_url: '',
    deadline: ''
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Fetch categories
    fetch(`${baseUrl}/api/v1/jobs/categories/`)
      .then(res => res.json())
      .then(data => setCategories(data.results || data))
      .catch(err => console.error(err));
  }, [baseUrl]);

  // Auth Guard
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLogin) {
        router.push('/login?redirect=/add-job');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLogin, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitData.append(key, value);
        }
      });
      
      if (logoFile) {
        submitData.append('company_logo', logoFile);
      }

      const res = await fetch(`${baseUrl}/api/v1/jobs/submit/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: submitData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.non_field_errors?.[0] || 'Failed to submit job.');
      }

      setSuccess(true);
      toast.success("Job Posted Successfully!");
      setTimeout(() => {
        router.push('/account');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLogin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary mb-4">progress_activity</span>
        <h2 className="text-xl font-bold text-ink-deep">Checking Authorization...</h2>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <span className="material-symbols-outlined text-7xl text-emerald-500 mb-6 animate-bounce">check_circle</span>
        <h1 className="text-4xl font-extrabold text-ink-deep mb-4">Job Posted Successfully!</h1>
        <p className="text-lg text-secondary mb-8">Your job listing has been created and is now active.</p>
        <p className="text-sm text-secondary animate-pulse">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen py-12">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-ink-deep mb-4">Post a New Job</h1>
          <p className="text-secondary text-lg">Reach thousands of job seekers in Jalgaon by posting your requirements.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-8 flex items-center gap-3 font-medium shadow-sm">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-hairline-soft overflow-hidden">
          {/* Section 1: Basic Info */}
          <div className="p-8 md:p-10 border-b border-hairline-soft">
            <h3 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">work</span> Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-deep mb-2">Job Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Company Name *</label>
                <input 
                  type="text" 
                  name="company" 
                  value={formData.company} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Tech Solutions Inc."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Company Logo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange} 
                  className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Location *</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Jalgaon, MIDC"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Category</label>
                <div className="relative">
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                  >
                    <option value="">Select Category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-4 text-secondary pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Details */}
          <div className="p-8 md:p-10 border-b border-hairline-soft">
            <h3 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span> Job Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Job Type</label>
                <div className="relative">
                  <select 
                    name="job_type" 
                    value={formData.job_type} 
                    onChange={handleChange} 
                    className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="temporary">Temporary</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-4 text-secondary pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Application Deadline</label>
                <input 
                  type="date" 
                  name="deadline" 
                  value={formData.deadline} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Minimum Salary (₹)</label>
                <input 
                  type="number" 
                  name="salary_min" 
                  value={formData.salary_min} 
                  onChange={handleChange} 
                  placeholder="e.g. 15000"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Maximum Salary (₹)</label>
                <input 
                  type="number" 
                  name="salary_max" 
                  value={formData.salary_max} 
                  onChange={handleChange} 
                  placeholder="e.g. 35000"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-ink-deep mb-2">Job Description *</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
                rows={6}
                placeholder="Describe the responsibilities and day-to-day tasks..."
                className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-ink-deep mb-2">Requirements / Qualifications</label>
              <textarea 
                name="requirements" 
                value={formData.requirements} 
                onChange={handleChange} 
                rows={4}
                placeholder="List the skills, experience, and education required..."
                className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-deep mb-2">External Apply URL (Optional)</label>
              <input 
                type="url" 
                name="apply_url" 
                value={formData.apply_url} 
                onChange={handleChange} 
                placeholder="https://yourcompany.com/careers/apply"
                className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <p className="text-xs text-secondary mt-2">If provided, applicants will be redirected to this link instead of applying natively on Jalgaon.com.</p>
            </div>
          </div>

          <div className="p-8 md:p-10 bg-surface-container-lowest flex items-center justify-end gap-4">
            <button 
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 font-bold text-ink-deep hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-primary hover:bg-primary-deep text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Posting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Post Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
