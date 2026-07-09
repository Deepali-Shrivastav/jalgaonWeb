"use client";

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthContext } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

interface MemberInput {
  name: string;
  role: string;
  sort_order: number;
}

interface ActivityInput {
  title: string;
  description: string;
  activity_date: string;
  activity_type: string;
  is_featured: boolean;
}

export default function AddClubClient() {
  const router = useRouter();
  const { user, isLogin } = useContext(AuthContext);

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    founded_year: '',
    short_description: '',
    description: '',
    address: '',
    contact_phone: '',
    contact_email: '',
    website: '',
    facebook: '',
    instagram: '',
  });

  const [members, setMembers] = useState<MemberInput[]>([
    { name: '', role: '', sort_order: 0 }
  ]);

  const [activities, setActivities] = useState<ActivityInput[]>([
    { title: '', description: '', activity_date: '', activity_type: 'other', is_featured: false }
  ]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Fetch active categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/v1/clubs/categories/`);
        if (res.ok) {
          const data = await res.json();
          // Filter out active categories only
          const results = data.results || data || [];
          setCategories(results.filter((cat: any) => cat.is_active !== false));
        }
      } catch (err) {
        console.error('Failed to load club categories', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [baseUrl]);

  // Auth redirect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLogin) {
        router.push('/login?redirect=/add-club');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLogin, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        toast.error(`${type === 'logo' ? 'Logo' : 'Banner'} image size must be less than 3MB`);
        return;
      }
      if (type === 'logo') {
        setLogoFile(file);
      } else {
        setBannerFile(file);
      }
    }
  };

  // Committee members dynamic list handlers
  const handleMemberChange = (index: number, field: keyof MemberInput, value: string | number) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const addMember = () => {
    setMembers([...members, { name: '', role: '', sort_order: members.length }]);
  };

  const removeMember = (index: number) => {
    if (members.length === 1) {
      toast.error("At least one key contact/member must be listed.");
      return;
    }
    const updated = members.filter((_, idx) => idx !== index).map((m, i) => ({ ...m, sort_order: i }));
    setMembers(updated);
  };

  // Activities list handlers
  const handleActivityChange = (index: number, field: keyof ActivityInput, value: string | boolean) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
  };

  const addActivity = () => {
    setActivities([...activities, { title: '', description: '', activity_date: '', activity_type: 'other', is_featured: false }]);
  };

  const removeActivity = (index: number) => {
    const updated = activities.filter((_, idx) => idx !== index);
    setActivities(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id || !formData.short_description || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();

      // Append general fields
      Object.entries(formData).forEach(([key, val]) => {
        if (val) {
          submitData.append(key, val);
        }
      });

      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      if (bannerFile) {
        submitData.append('banner_image', bannerFile);
      }

      // Filter empty members
      const cleanMembers = members.filter(m => m.name.trim() !== '');
      if (cleanMembers.length > 0) {
        submitData.append('members_data', JSON.stringify(cleanMembers));
      }

      // Filter empty activities
      const cleanActivities = activities.filter(a => a.title.trim() !== '');
      if (cleanActivities.length > 0) {
        submitData.append('activities_data', JSON.stringify(cleanActivities));
      }

      const res = await fetch(`${baseUrl}/api/v1/clubs/submit/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorValues = Object.values(errorData) as any[];
        const errorMsg = errorData.detail || errorData.non_field_errors?.[0] || (errorValues.length > 0 ? errorValues[0]?.[0] : null) || 'Failed to submit club profile.';
        throw new Error(errorMsg);
      }

      setSuccess(true);
      toast.success("Club profile submitted successfully!");
      setTimeout(() => {
        router.push('/clubs');
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
          <span className="material-symbols-outlined text-7xl text-emerald-500 mb-6 animate-bounce">celebration</span>
          <h1 className="text-4xl font-extrabold text-ink-deep mb-4">Club Registered Successfully!</h1>
          <p className="text-lg text-secondary mb-8">Your registration has been submitted and is currently pending verification by our moderation team.</p>
          <p className="text-sm text-secondary animate-pulse">Redirecting to Clubs Directory...</p>
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
            <h1 className="text-4xl font-extrabold text-ink-deep mb-4">Register Your Club</h1>
            <p className="text-secondary text-lg">List your group, sports club, or volunteer organization to increase reach.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-8 flex items-center gap-3 font-medium shadow-sm">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Basic Info */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <h2 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2 border-b border-hairline-soft pb-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">groups</span>
                Club Basic Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-ink-deep mb-2">Club Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., Jalgaon Runners Club"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Category *</label>
                  <div className="relative">
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">Select Category</option>
                      {!loadingCategories && categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Founded Year</label>
                  <input
                    type="number"
                    name="founded_year"
                    value={formData.founded_year}
                    onChange={handleChange}
                    placeholder="e.g., 2018"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Club Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                  />
                  <p className="text-xs text-secondary mt-1">Square format, max 3MB</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Cover / Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner')}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                  />
                  <p className="text-xs text-secondary mt-1">Landscape format, max 3MB</p>
                </div>
              </div>
            </div>

            {/* 2. Overview & Description */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <h2 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2 border-b border-hairline-soft pb-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">description</span>
                Club Description
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Short Description (Summary) *</label>
                  <input
                    type="text"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    placeholder="Brief 1-2 sentence tagline of what your club represents..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Detailed Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Give a complete overview of registration fees, regular venues, meeting intervals, coaching or community drives organized..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y"
                  />
                </div>
              </div>
            </div>

            {/* 3. Links & Contact */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <h2 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2 border-b border-hairline-soft pb-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">contact_mail</span>
                Links & Contact Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Contact Phone</label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 90123 45678"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    placeholder="e.g. contact@runnersclub.com"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

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
                  <label className="block text-sm font-bold text-ink-deep mb-2">Facebook Page</label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Instagram Page</label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Club Address / Base Venue</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. Shivaji Nagar, Jalgaon"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 4. Core Members Team Section */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <div className="flex justify-between items-center mb-6 border-b border-hairline-soft pb-4">
                <h2 className="text-xl font-bold text-ink-deep flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">person</span>
                  Key Contacts / Committee
                </h2>
                <button
                  type="button"
                  onClick={addMember}
                  className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> Add Member
                </button>
              </div>

              <div className="space-y-6">
                {members.map((member, idx) => (
                  <div key={idx} className="bg-surface-container-low rounded-2xl p-5 border border-hairline-soft relative">
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="absolute top-4 right-4 text-secondary hover:text-red-500 transition-colors"
                      title="Remove member"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                    
                    <h3 className="font-extrabold text-sm text-secondary uppercase tracking-widest mb-4">Member #{idx + 1}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-ink-deep mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={member.name}
                          required
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Swapnil Chaudhari"
                          className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink-deep mb-1">Role / Designation *</label>
                        <input
                          type="text"
                          value={member.role}
                          required
                          onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                          placeholder="e.g. Club Secretary"
                          className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Activities Section */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <div className="flex justify-between items-center mb-6 border-b border-hairline-soft pb-4">
                <h2 className="text-xl font-bold text-ink-deep flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">event</span>
                  Recent Activities / Events
                </h2>
                <button
                  type="button"
                  onClick={addActivity}
                  className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> Add Activity
                </button>
              </div>

              <div className="space-y-6">
                {activities.map((act, idx) => (
                  <div key={idx} className="bg-surface-container-low rounded-2xl p-5 border border-hairline-soft relative">
                    <button
                      type="button"
                      onClick={() => removeActivity(idx)}
                      className="absolute top-4 right-4 text-secondary hover:text-red-500 transition-colors"
                      title="Remove activity"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                    
                    <h3 className="font-extrabold text-sm text-secondary uppercase tracking-widest mb-4">Activity #{idx + 1}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-ink-deep mb-1">Activity Title *</label>
                        <input
                          type="text"
                          value={act.title}
                          required
                          onChange={(e) => handleActivityChange(idx, 'title', e.target.value)}
                          placeholder="e.g. Annual Winter Marathon 2024"
                          className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink-deep mb-1">Activity Date *</label>
                        <input
                          type="date"
                          value={act.activity_date}
                          required
                          onChange={(e) => handleActivityChange(idx, 'activity_date', e.target.value)}
                          className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink-deep mb-1">Activity Type</label>
                        <div className="relative">
                          <select
                            value={act.activity_type}
                            onChange={(e) => handleActivityChange(idx, 'activity_type', e.target.value)}
                            className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          >
                            <option value="event">Event</option>
                            <option value="workshop">Workshop</option>
                            <option value="camp">Camp</option>
                            <option value="meeting">Meeting</option>
                            <option value="competition">Competition</option>
                            <option value="social_drive">Social Drive</option>
                            <option value="other">Other</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">expand_more</span>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-ink-deep mb-1">Description *</label>
                        <textarea
                          value={act.description}
                          required
                          onChange={(e) => handleActivityChange(idx, 'description', e.target.value)}
                          placeholder="Describe the activity, number of participants, outcomes..."
                          rows={3}
                          className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y"
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
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Submit Club Profile
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
