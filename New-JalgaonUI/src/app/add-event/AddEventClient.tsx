"use client";

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

export default function AddEventClient() {
  const router = useRouter();
  const { user, isLogin } = useContext(AuthContext);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    organizer_name: '',
    organizer_contact: '',
    venue_name: '',
    venue_address: '',
    maps_url: '',
    start_datetime: '',
    end_datetime: '',
    registration_link: '',
    category: ''
  });
  
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${baseUrl}/api/v1/events/categories/`)
      .then(res => res.json())
      .then(data => setCategories(data.results || data))
      .catch(err => console.error(err));
  }, [baseUrl]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLogin) {
        router.push('/login?redirect=/add-event');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLogin, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFeaturedImage(e.target.files[0]);
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
      
      if (featuredImage) {
        submitData.append('featured_image', featuredImage);
      }

      const res = await fetch(`${baseUrl}/api/v1/events/submit/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: submitData
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Check for specific field errors
        let errorMsg = 'Failed to submit event.';
        if (errorData.start_datetime) errorMsg = errorData.start_datetime[0];
        else if (errorData.end_datetime) errorMsg = errorData.end_datetime[0];
        else if (errorData.featured_image) errorMsg = errorData.featured_image[0];
        else if (errorData.detail) errorMsg = errorData.detail;
        else if (errorData.non_field_errors) errorMsg = errorData.non_field_errors[0];
        else if (Array.isArray(errorData) && errorData[0]) errorMsg = errorData[0];
        
        throw new Error(errorMsg);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/events');
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
        <span className="material-symbols-outlined text-7xl text-emerald-500 mb-6 animate-bounce">celebration</span>
        <h1 className="text-4xl font-extrabold text-ink-deep mb-4">Event Submitted!</h1>
        <p className="text-lg text-secondary mb-8">Your event has been successfully sent for review.</p>
        <p className="text-sm text-secondary animate-pulse">Redirecting to Events page...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-ink-deep mb-4">Host an Event</h1>
          <p className="text-secondary text-lg">Promote your upcoming event to the Jalgaon community.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-8 flex items-center gap-3 font-medium shadow-sm">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-hairline-soft overflow-hidden">
          {/* Basic Details */}
          <div className="p-8 md:p-10 border-b border-hairline-soft">
            <h3 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">event</span> Event Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-deep mb-2">Event Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Jalgaon Tech Meetup 2026"
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

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Featured Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange} 
                  className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                />
                <p className="text-xs text-secondary mt-2">Max size: 5MB</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-deep mb-2">Short Description *</label>
                <input 
                  type="text" 
                  name="short_description" 
                  value={formData.short_description} 
                  onChange={handleChange} 
                  required 
                  maxLength={150}
                  placeholder="Brief summary (max 150 characters)"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-deep mb-2">Full Description *</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  rows={6}
                  placeholder="Detailed information about the event agenda, speakers, etc."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="p-8 md:p-10 border-b border-hairline-soft bg-surface-container-lowest">
            <h3 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span> Date & Time
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Start Date & Time *</label>
                <input 
                  type="datetime-local" 
                  name="start_datetime" 
                  value={formData.start_datetime} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">End Date & Time</label>
                <input 
                  type="datetime-local" 
                  name="end_datetime" 
                  value={formData.end_datetime} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="p-8 md:p-10 border-b border-hairline-soft">
            <h3 className="text-xl font-bold text-ink-deep mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span> Location & Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-deep mb-2">Venue Name *</label>
                <input 
                  type="text" 
                  name="venue_name" 
                  value={formData.venue_name} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Rotary Bhavan"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-deep mb-2">Venue Address *</label>
                <textarea 
                  name="venue_address" 
                  value={formData.venue_address} 
                  onChange={handleChange} 
                  required 
                  rows={2}
                  placeholder="Complete physical address of the venue..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Google Maps URL</label>
                <input 
                  type="url" 
                  name="maps_url" 
                  value={formData.maps_url} 
                  onChange={handleChange} 
                  placeholder="https://maps.google.com/..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">External Registration Link</label>
                <input 
                  type="url" 
                  name="registration_link" 
                  value={formData.registration_link} 
                  onChange={handleChange} 
                  placeholder="https://eventbrite.com/..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Organizer Name *</label>
                <input 
                  type="text" 
                  name="organizer_name" 
                  value={formData.organizer_name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Name of the person or organization"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Organizer Contact *</label>
                <input 
                  type="text" 
                  name="organizer_contact" 
                  value={formData.organizer_contact} 
                  onChange={handleChange} 
                  required 
                  placeholder="Phone or Email"
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
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Submit Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
