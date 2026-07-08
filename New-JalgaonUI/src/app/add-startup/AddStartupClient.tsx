"use client";

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthContext } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

interface FounderInput {
  name: string;
  role: string;
  bio: string;
  linkedin: string;
  sort_order: number;
}

export default function AddStartupClient() {
  const router = useRouter();
  const { user, isLogin } = useContext(AuthContext);

  const [industries, setIndustries] = useState<any[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    industry_id: '',
    founding_year: '',
    stage: 'idea',
    description: '',
    website: '',
    linkedin: '',
    twitter: '',
    email: '',
    phone: '',
    address: ''
  });

  const [founders, setFounders] = useState<FounderInput[]>([
    { name: '', role: '', bio: '', linkedin: '', sort_order: 0 }
  ]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Fetch active industries
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/v1/startups/industries/`);
        if (res.ok) {
          const data = await res.json();
          setIndustries(data.results || data || []);
        }
      } catch (err) {
        console.error('Failed to load industries', err);
      } finally {
        setLoadingIndustries(false);
      }
    };
    fetchIndustries();
  }, [baseUrl]);

  // Auth redirect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLogin) {
        router.push('/login?redirect=/add-startup');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLogin, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo image size must be less than 2MB");
        return;
      }
      setLogoFile(file);
    }
  };

  // Founder dynamic list handlers
  const handleFounderChange = (index: number, field: keyof FounderInput, value: string | number) => {
    const updated = [...founders];
    updated[index] = { ...updated[index], [field]: value };
    setFounders(updated);
  };

  const addFounder = () => {
    setFounders([...founders, { name: '', role: '', bio: '', linkedin: '', sort_order: founders.length }]);
  };

  const removeFounder = (index: number) => {
    if (founders.length === 1) {
      toast.error("At least one founder must be listed.");
      return;
    }
    const updated = founders.filter((_, idx) => idx !== index).map((f, i) => ({ ...f, sort_order: i }));
    setFounders(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.industry_id || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();

      // Append startup fields
      Object.entries(formData).forEach(([key, val]) => {
        if (val) {
          submitData.append(key, val);
        }
      });

      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      // Filter empty founders
      const cleanFounders = founders.filter(f => f.name.trim() !== '');
      if (cleanFounders.length > 0) {
        submitData.append('founders_data', JSON.stringify(cleanFounders));
      }

      const res = await fetch(`${baseUrl}/api/v1/startups/submit/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorValues = Object.values(errorData) as any[];
        const errorMsg = errorData.detail || errorData.non_field_errors?.[0] || (errorValues.length > 0 ? errorValues[0]?.[0] : null) || 'Failed to submit startup profile.';
        throw new Error(errorMsg);
      }

      setSuccess(true);
      toast.success("Startup submitted successfully!");
      setTimeout(() => {
        router.push('/startups');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      toast.error(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLogin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-surface">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary mb-4">progress_activity</span>
        <h2 className="text-xl font-bold text-ink-deep">Checking Authorization...</h2>
      </div>
    );
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto py-20 px-4 text-center min-h-[70vh] flex flex-col justify-center items-center">
          <span className="material-symbols-outlined text-7xl text-emerald-500 mb-6 animate-bounce">rocket_launch</span>
          <h1 className="text-4xl font-extrabold text-ink-deep mb-4">Startup Submitted Successfully!</h1>
          <p className="text-lg text-secondary mb-8">Your registration has been submitted and is currently pending verification by the site admin.</p>
          <p className="text-sm text-secondary animate-pulse">Redirecting to Startup Directory...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Toaster position="top-center" />
      <main className="py-12 bg-surface">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-ink-deep mb-4">Register Your Startup</h1>
            <p className="text-secondary text-lg">List your venture in the Jalgaon Startup Directory and get visibility.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-8 flex items-center gap-3 font-medium shadow-sm">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Basic Startup Info */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <h2 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2 border-b border-hairline-soft pb-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">rocket</span>
                Startup Basic Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-ink-deep mb-2">Startup Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., Jalgaon AgriTech Solutions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Industry / Sector *</label>
                  <div className="relative">
                    <select
                      name="industry_id"
                      value={formData.industry_id}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">Select Sector</option>
                      {!loadingIndustries && industries.map(ind => (
                        <option key={ind.id} value={ind.id}>{ind.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Startup Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                  />
                  <p className="text-xs text-secondary mt-1">Recommended: Square format, max 2MB</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Founding Year</label>
                  <input
                    type="number"
                    name="founding_year"
                    value={formData.founding_year}
                    onChange={handleChange}
                    placeholder="e.g., 2024"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Funding / Growth Stage</label>
                  <div className="relative">
                    <select
                      name="stage"
                      value={formData.stage}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="idea">Idea Stage</option>
                      <option value="mvp">MVP</option>
                      <option value="early_stage">Early Stage</option>
                      <option value="growth">Growth Stage</option>
                      <option value="established">Established</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Pitch / Description */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <h2 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2 border-b border-hairline-soft pb-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">description</span>
                Startup Description
              </h2>
              <div>
                <label className="block text-sm font-bold text-ink-deep mb-2">Description / Pitch *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Explain what your startup does, the problem it solves, and its vision..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y"
                />
              </div>
            </div>

            {/* 3. Links & Location */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <h2 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2 border-b border-hairline-soft pb-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">link</span>
                Links & Contact Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Website URL</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">LinkedIn Page</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Twitter / X URL</label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hello@yourstartup.com"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Contact Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Office Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Office location in Jalgaon..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 4. Founders Team Section */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <div className="flex justify-between items-center mb-6 border-b border-hairline-soft pb-4">
                <h2 className="text-xl font-bold text-ink-deep flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">group</span>
                  Founders & Leadership
                </h2>
                <button
                  type="button"
                  onClick={addFounder}
                  className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> Add Founder
                </button>
              </div>

              <div className="space-y-6">
                {founders.map((founder, idx) => (
                  <div key={idx} className="bg-surface-container-low rounded-2xl p-5 border border-hairline-soft relative">
                    <button
                      type="button"
                      onClick={() => removeFounder(idx)}
                      className="absolute top-4 right-4 text-secondary hover:text-red-500 transition-colors"
                      title="Remove founder"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                    
                    <h3 className="font-extrabold text-sm text-secondary uppercase tracking-widest mb-4">Founder #{idx + 1}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-ink-deep mb-1">Founder Name *</label>
                        <input
                          type="text"
                          value={founder.name}
                          required
                          onChange={(e) => handleFounderChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Rohan Patil"
                          className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink-deep mb-1">Role / Designation *</label>
                        <input
                          type="text"
                          value={founder.role}
                          required
                          onChange={(e) => handleFounderChange(idx, 'role', e.target.value)}
                          placeholder="e.g. Co-Founder & CEO"
                          className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-ink-deep mb-1">Short Bio</label>
                        <textarea
                          value={founder.bio}
                          onChange={(e) => handleFounderChange(idx, 'bio', e.target.value)}
                          placeholder="Brief background or credentials..."
                          rows={2}
                          className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-ink-deep mb-1">LinkedIn Profile</label>
                        <input
                          type="url"
                          value={founder.linkedin}
                          onChange={(e) => handleFounderChange(idx, 'linkedin', e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-4 p-8 bg-white border border-hairline-soft rounded-3xl shadow-sm">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-3.5 font-bold text-ink-deep hover:text-primary transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary-deep text-white font-bold py-3.5 px-10 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                    Submit Profile
                  </>
                )}
              </button>
            </div>
            
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
