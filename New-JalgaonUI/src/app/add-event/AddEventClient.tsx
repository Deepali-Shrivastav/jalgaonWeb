'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthContext } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function AddEventClient() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const isAuthenticated = !!user;

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    start_datetime: '',
    end_datetime: '',
    venue_name: '',
    venue_address: '',
    organizer_name: '',
    organizer_contact: '',
    registration_link: '',
    short_description: '',
    description: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${baseUrl}/api/v1/events/categories/`);
        if (res.ok) {
          const json = await res.json();
          setCategories(json.results || json);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("You must be logged in to submit an event.");
      return;
    }
    
    if (!formData.title || !formData.start_datetime) {
      toast.error("Please fill in required fields (Title, Start Time).");
      return;
    }

    setSubmitting(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const token = localStorage.getItem("token");

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData];
      if (value) {
        submitData.append(key, value);
      }
    });

    if (imageFile) {
      submitData.append('featured_image', imageFile);
    }

    try {
      let res = await fetch(`${baseUrl}/api/v1/events/submit/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (res.status === 401) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const refreshRes = await fetch(`${baseUrl}/api/v1/auth/token/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh: refreshToken })
          });
          
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            localStorage.setItem("token", refreshData.access);
            // Retry with new token
            res = await fetch(`${baseUrl}/api/v1/events/submit/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${refreshData.access}`
              },
              body: submitData
            });
          } else {
            toast.error("Your session has expired. Please log in again.");
            setSubmitting(false);
            return;
          }
        } else {
          toast.error("Your session has expired. Please log in again.");
          setSubmitting(false);
          return;
        }
      }

      if (res.ok) {
        toast.success("Event submitted successfully! Awaiting admin approval.");
        setTimeout(() => {
          router.push('/events');
        }, 2000);
      } else {
        const errorData = await res.json().catch(() => null);
        console.error("Submission error:", errorData);
        
        let errorMessage = "Failed to submit event. Please check required fields.";
        
        if (errorData) {
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'object') {
            // Find the first array containing string error messages (typical DRF validation format)
            const firstErrorField = Object.values(errorData).find(val => Array.isArray(val) && val.length > 0 && typeof val[0] === 'string');
            if (firstErrorField && Array.isArray(firstErrorField)) {
              errorMessage = firstErrorField[0];
            } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
              errorMessage = errorData.non_field_errors[0];
            }
          }
        }
        
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = false;

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Toaster position="top-center" />
      <main className="py-xxxl mb-12 px-base md:px-xxl max-w-container-max mx-auto bg-surface">
        
        {/* Header Section */}
        <div className="mb-xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-ink-deep tracking-tight mb-sm">
            List Your <span className="text-primary">Local Event</span>
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Connect with thousands of residents by publishing your event on Jalgaon&apos;s leading local directory.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-8 text-center shadow-sm">
            <span className="material-symbols-outlined text-4xl text-amber-500 mb-4 block">lock</span>
            <h2 className="text-xl font-bold text-ink-deep mb-2">Authentication Required</h2>
            <p className="text-secondary mb-6">You must be logged in to submit an event to the directory.</p>
            <button 
              onClick={() => router.push('/account')}
              className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-primary-deep transition-colors"
            >
              Sign In or Register
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-lg">
            {/* 1. Basic Details */}
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <h2 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2 border-b border-hairline-soft pb-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">event</span>
                Basic Event Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-ink-deep mb-2">Event Title *</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., Jalgaon Tech Meetup 2026"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-bold text-ink-deep mb-2">Category</label>
                  <div className="relative">
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">Select a Category</option>
                      {!loadingCats && categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-bold text-ink-deep mb-2">Featured Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                  />
                  <p className="text-xs text-secondary mt-1">Max size: 5MB</p>
                </div>
              </div>
            </div>

            {/* 2. Schedule */}
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <h2 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2 border-b border-hairline-soft pb-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">schedule</span>
                Date & Time
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Start Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    name="start_datetime"
                    value={formData.start_datetime}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="end_datetime"
                    value={formData.end_datetime}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 3. Venue & Organizer */}
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <h2 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2 border-b border-hairline-soft pb-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">location_on</span>
                Venue & Organizer
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-ink-deep mb-2">Venue Name</label>
                  <input 
                    type="text" 
                    name="venue_name"
                    value={formData.venue_name}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., Jalgaon Central Hall"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-ink-deep mb-2">Venue Address</label>
                  <textarea 
                    name="venue_address"
                    value={formData.venue_address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="Full street address..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Organizer Name</label>
                  <input 
                    type="text" 
                    name="organizer_name"
                    value={formData.organizer_name}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Who is organizing?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Organizer Contact</label>
                  <input 
                    type="text" 
                    name="organizer_contact"
                    value={formData.organizer_contact}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Email or Phone"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-ink-deep mb-2">Registration Link (Optional)</label>
                  <input 
                    type="url" 
                    name="registration_link"
                    value={formData.registration_link}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* 4. Details */}
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-hairline-soft">
              <h2 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2 border-b border-hairline-soft pb-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">description</span>
                Description
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Short Description</label>
                  <textarea 
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="A brief summary..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-ink-deep mb-2">Full Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about the event..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-secondary font-medium order-2 md:order-1">
                By submitting, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a>. All events are subject to admin review.
              </p>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full md:w-auto bg-primary text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-primary-deep transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 md:order-2"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Submit Event
                  </>
                )}
              </button>
            </div>
            
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
