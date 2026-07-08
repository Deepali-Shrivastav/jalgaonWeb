"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function AdminCreateStartupPage() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [industries, setIndustries] = useState<any[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    industry_id: '',
    founding_year: '',
    stage: 'idea',
    description: '',
    status: 'approved',
    is_verified: 'false',
    is_featured: 'false',
    website: '',
    linkedin: '',
    twitter: '',
    email: '',
    phone: '',
    address: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const token = localStorage.getItem("token");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.industry_id || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, val]) => {
        if (val) {
          if (key === 'is_verified' || key === 'is_featured') {
            submitData.append(key, val === 'true' ? 'true' : 'false');
          } else {
            submitData.append(key, val);
          }
        }
      });

      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      const res = await fetch(`${baseUrl}/api/v1/startups/admin/startups/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorValues = Object.values(errorData) as any[];
        const errorMsg = errorData.detail || errorData.non_field_errors?.[0] || (errorValues.length > 0 ? errorValues[0]?.[0] : null) || 'Failed to create startup.';
        throw new Error(errorMsg);
      }

      toast.success("Startup created successfully!");
      setTimeout(() => {
        router.push('/admin/startups');
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Toaster position="top-center" />
      <div className="flex items-center gap-3">
        <Link href="/admin/startups" className="text-slate-500 hover:text-slate-700">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Add New Startup</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manually create a new startup listing in the ecosystem directory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Startup Basic Details */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-xl">rocket</span> Startup Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Startup Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Jalgaon Biotech"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Industry Sector *</label>
              <select
                name="industry_id"
                value={formData.industry_id}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Sector</option>
                {!loadingIndustries && industries.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-1.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Founding Year</label>
              <input
                type="number"
                name="founding_year"
                value={formData.founding_year}
                onChange={handleChange}
                placeholder="e.g. 2025"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Stage</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              >
                <option value="idea">Idea Stage</option>
                <option value="mvp">MVP</option>
                <option value="early_stage">Early Stage</option>
                <option value="growth">Growth Stage</option>
                <option value="established">Established</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status & Moderation Details */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-xl">admin_panel_settings</span> Moderation & Badges
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Is Verified</label>
              <select
                name="is_verified"
                value={formData.is_verified}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              >
                <option value="false">No Checkmark</option>
                <option value="true">Verified Checkmark</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Is Featured</label>
              <select
                name="is_featured"
                value={formData.is_featured}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              >
                <option value="false">Standard Listing</option>
                <option value="true">Featured in Home Slider</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pitch / Description */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-xl">description</span> Startup Pitch
          </h2>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Explain the startup's product/services..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Links & Contact */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-xl">link</span> Contact Details & Links
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Website URL</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">LinkedIn Page</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Twitter / X URL</label>
              <input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contact Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="info@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Office Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Office location..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex justify-end gap-3 p-4 bg-white border border-slate-200 rounded-xl">
          <Link
            href="/admin/startups"
            className="px-6 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white font-semibold px-8 py-2.5 rounded-lg hover:bg-primary-deep transition-colors text-sm disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Startup"}
          </button>
        </div>

      </form>
    </div>
  );
}
