"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

interface Founder {
  id: number;
  name: string;
  role: string;
  photo: string | null;
  linkedin: string | null;
  bio: string | null;
  sort_order: number;
}

export default function AdminEditStartupPage() {
  const router = useRouter();
  const params = useParams();
  const startupId = params?.id;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [industries, setIndustries] = useState<any[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    industry_id: '',
    founding_year: '',
    stage: 'idea',
    description: '',
    status: 'pending',
    is_verified: 'false',
    is_featured: 'false',
    website: '',
    linkedin: '',
    twitter: '',
    email: '',
    phone: '',
    address: ''
  });

  const [founders, setFounders] = useState<Founder[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Founder creation state
  const [newFounder, setNewFounder] = useState({
    name: '',
    role: '',
    bio: '',
    linkedin: ''
  });
  const [founderPhotoFile, setFounderPhotoFile] = useState<File | null>(null);
  const [addingFounder, setAddingFounder] = useState(false);

  // Fetch industries and startup details
  useEffect(() => {
    if (!startupId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const indRes = await fetch(`${baseUrl}/api/v1/startups/industries/`);
        const startupRes = await fetch(`${baseUrl}/api/v1/startups/admin/startups/${startupId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (indRes.ok && startupRes.ok) {
          const indJson = await indRes.json();
          const startupJson = await startupRes.json();

          setIndustries(indJson.results || indJson || []);
          setFormData({
            name: startupJson.name || '',
            industry_id: startupJson.industry_id?.toString() || startupJson.industry?.id?.toString() || '',
            founding_year: startupJson.founding_year?.toString() || '',
            stage: startupJson.stage || 'idea',
            description: startupJson.description || '',
            status: startupJson.status || 'pending',
            is_verified: startupJson.is_verified ? 'true' : 'false',
            is_featured: startupJson.is_featured ? 'true' : 'false',
            website: startupJson.website || '',
            linkedin: startupJson.linkedin || '',
            twitter: startupJson.twitter || '',
            email: startupJson.email || '',
            phone: startupJson.phone || '',
            address: startupJson.address || ''
          });
          setCurrentLogoUrl(startupJson.logo);
          setFounders(startupJson.founders || []);
        } else {
          toast.error("Failed to load startup details.");
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred while fetching details.");
      } finally {
        setLoadingIndustries(false);
        setLoadingData(false);
      }
    };

    fetchData();
  }, [startupId, baseUrl]);

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

  // Submit Startup edits
  const handleStartupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'is_verified' || key === 'is_featured') {
          submitData.append(key, val === 'true' ? 'true' : 'false');
        } else {
          submitData.append(key, val);
        }
      });

      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      const res = await fetch(`${baseUrl}/api/v1/startups/admin/startups/${startupId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to update startup details.');
      }

      toast.success("Startup updated successfully!");
      // Reload logo if changed
      const freshRes = await fetch(`${baseUrl}/api/v1/startups/admin/startups/${startupId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (freshRes.ok) {
        const freshJson = await freshRes.json();
        setCurrentLogoUrl(freshJson.logo);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Add Founder handler
  const handleAddFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFounder.name || !newFounder.role) {
      toast.error("Founder name and role are required.");
      return;
    }

    setAddingFounder(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('startup', startupId as string);
      fd.append('name', newFounder.name);
      fd.append('role', newFounder.role);
      fd.append('bio', newFounder.bio);
      fd.append('linkedin', newFounder.linkedin);
      fd.append('sort_order', founders.length.toString());

      if (founderPhotoFile) {
        fd.append('photo', founderPhotoFile);
      }

      const res = await fetch(`${baseUrl}/api/v1/startups/admin/founders/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fd
      });

      if (res.ok) {
        toast.success("Founder added successfully!");
        setNewFounder({ name: '', role: '', bio: '', linkedin: '' });
        setFounderPhotoFile(null);
        // Refresh founders list
        const updatedRes = await fetch(`${baseUrl}/api/v1/startups/admin/startups/${startupId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (updatedRes.ok) {
          const json = await updatedRes.json();
          setFounders(json.founders || []);
        }
      } else {
        toast.error("Failed to add founder.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding founder.");
    } finally {
      setAddingFounder(false);
    }
  };

  // Delete Founder handler
  const handleDeleteFounder = async (founderId: number) => {
    if (!window.confirm("Are you sure you want to remove this founder?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/v1/startups/admin/founders/${founderId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Founder removed successfully!");
        setFounders(founders.filter(f => f.id !== founderId));
      } else {
        toast.error("Failed to remove founder.");
      }
    } catch {
      toast.error("Error removing founder.");
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Toaster position="top-center" />
      
      <div className="flex items-center gap-3">
        <Link href="/admin/startups" className="text-slate-500 hover:text-slate-700">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Startup Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Modify information, approve submissions, and assign key leadership.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Basic Form Panel */}
        <form onSubmit={handleStartupSubmit} className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-xl">rocket</span> Startup Details
            </h2>

            {currentLogoUrl && (
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <img
                  src={currentLogoUrl.startsWith('http') ? currentLogoUrl : `${baseUrl}${currentLogoUrl}`}
                  alt="Startup Logo"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-700">Current Logo</h4>
                  <p className="text-slate-500 text-[10px]">Select a new file in the logo picker below to update.</p>
                </div>
              </div>
            )}
            
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
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Industry Sector *</label>
                <select
                  name="industry_id"
                  value={formData.industry_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
                >
                  <option value="">Select Sector</option>
                  {!loadingIndustries && industries.map(ind => (
                    <option key={ind.id} value={ind.id}>{ind.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Upload New Logo</label>
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

          {/* Moderation Details */}
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

          {/* Description */}
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
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Contact details */}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

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
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Founders Leadership CRUD Panel */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-xl">group</span> Leadership & Founders Management
          </h2>

          {/* Existing Founders List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Current Founders</h3>
            {founders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {founders.map(founder => (
                  <div key={founder.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center border border-slate-300 shrink-0">
                        {founder.photo ? (
                          <img
                            src={founder.photo.startsWith('http') ? founder.photo : `${baseUrl}${founder.photo}`}
                            alt={founder.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-slate-400">person</span>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{founder.name}</h4>
                        <p className="text-slate-500 text-xs truncate">{founder.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFounder(founder.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-50"
                      title="Remove founder"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic">No founders assigned yet.</p>
            )}
          </div>

          {/* Add a Founder Form Inline */}
          <form onSubmit={handleAddFounder} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">person_add</span> Add Founder Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Founder Name *</label>
                <input
                  type="text"
                  value={newFounder.name}
                  onChange={(e) => setNewFounder({ ...newFounder, name: e.target.value })}
                  placeholder="e.g. Rohan Patil"
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Role / Designation *</label>
                <input
                  type="text"
                  value={newFounder.role}
                  onChange={(e) => setNewFounder({ ...newFounder, role: e.target.value })}
                  placeholder="e.g. Founder & CTO"
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Bio / Description</label>
                <textarea
                  value={newFounder.bio}
                  onChange={(e) => setNewFounder({ ...newFounder, bio: e.target.value })}
                  placeholder="Tell us about this founder..."
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={newFounder.linkedin}
                  onChange={(e) => setNewFounder({ ...newFounder, linkedin: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Founder Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFounderPhotoFile(e.target.files?.[0] || null)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-1 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={addingFounder}
                className="bg-primary text-white font-semibold text-xs px-6 py-2 rounded-lg hover:bg-primary-deep transition-all disabled:opacity-50"
              >
                {addingFounder ? "Adding..." : "Add Founder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
