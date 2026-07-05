"use client";

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

export default function AddNGOClient() {
  const router = useRouter();
  const { user, isLogin } = useContext(AuthContext);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    registration_number: '',
    established_date: '',
    description: '',
    mission_statement: '',
    address: '',
    contact_phone: '',
    contact_email: '',
    website: ''
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${baseUrl}/api/v1/ngo/categories/`)
      .then(res => res.json())
      .then(data => setCategories(data.results || data))
      .catch(err => console.error(err));
  }, [baseUrl]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLogin) {
        router.push('/login?redirect=/add-ngo');
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
        submitData.append('logo', logoFile);
      }

      const res = await fetch(`${baseUrl}/api/v1/ngo/submit/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: submitData
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorValues = Object.values(errorData) as any[];
        const errorMsg = errorData.detail || errorData.non_field_errors?.[0] || (errorValues.length > 0 ? errorValues[0]?.[0] : null) || 'Failed to submit NGO registration.';
        throw new Error(errorMsg);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/ngo');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
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
        <span className="material-symbols-outlined text-7xl text-emerald-500 mb-6 animate-bounce">volunteer_activism</span>
        <h1 className="text-4xl font-extrabold text-ink-deep mb-4">NGO Registered Successfully!</h1>
        <p className="text-lg text-secondary mb-8">Your NGO registration has been sent for verification.</p>
        <p className="text-sm text-secondary animate-pulse">Redirecting to NGO Directory...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-ink-deep mb-4">Register Your NGO</h1>
          <p className="text-secondary text-lg">Join the largest network of social organizations in Jalgaon.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-8 flex items-center gap-3 font-medium shadow-sm">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-hairline-soft overflow-hidden">
          {/* Organization Details */}
          <div className="p-8 md:p-10 border-b border-hairline-soft">
            <h3 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">corporate_fare</span> Organization Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-deep mb-2">NGO Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Jalgaon Social Welfare Foundation"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Category *</label>
                <div className="relative">
                  <select 
                    name="category_id" 
                    value={formData.category_id} 
                    onChange={handleChange} 
                    required
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

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Logo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange} 
                  className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Govt. Registration Number (Optional)</label>
                <input 
                  type="text" 
                  name="registration_number" 
                  value={formData.registration_number} 
                  onChange={handleChange} 
                  placeholder="e.g. E-1234/Jalgaon"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Established Date (Optional)</label>
                <input 
                  type="date" 
                  name="established_date" 
                  value={formData.established_date} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Mission & Description */}
          <div className="p-8 md:p-10 border-b border-hairline-soft bg-surface-container-lowest">
            <h3 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lightbulb</span> Mission & Vision
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Mission Statement *</label>
                <textarea 
                  name="mission_statement" 
                  value={formData.mission_statement} 
                  onChange={handleChange} 
                  required
                  rows={2}
                  placeholder="Briefly state your organization's core purpose..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Detailed Description *</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required
                  rows={5}
                  placeholder="Describe your activities, goals, and impact..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-8 md:p-10 border-b border-hairline-soft">
            <h3 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contacts</span> Contact Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-deep mb-2">Full Address *</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  required 
                  rows={2}
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Contact Phone *</label>
                <input 
                  type="text" 
                  name="contact_phone" 
                  value={formData.contact_phone} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. 9876543210"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Contact Email *</label>
                <input 
                  type="email" 
                  name="contact_email" 
                  value={formData.contact_email} 
                  onChange={handleChange} 
                  required 
                  placeholder="contact@ngo.org"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-deep mb-2">Website URL (Optional)</label>
                <input 
                  type="url" 
                  name="website" 
                  value={formData.website} 
                  onChange={handleChange} 
                  placeholder="https://www.yourngo.org"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
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
                  Registering...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  Register NGO
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
