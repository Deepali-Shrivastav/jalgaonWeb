"use client";

import React, { useState } from 'react';

interface BusinessReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: any;
  baseUrl: string;
}

export default function BusinessReportModal({ isOpen, onClose, business, baseUrl }: BusinessReportModalProps) {
  const [formData, setFormData] = useState({ reason: 'fake', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${baseUrl}/api/v1/listings/${business.slug}/report/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData[0] || errorData.error || 'Failed to submit report. Please try again later.');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Report error:', err);
      setError(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl p-8 w-[90vw] md:w-[500px] max-w-[500px] relative shadow-2xl animate-fade-in box-border min-w-[320px]">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-secondary hover:text-red-500 transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <h2 className="text-2xl font-bold text-ink-deep mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-500">flag</span>
          Report Business
        </h2>
        
        {success ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4 animate-bounce">check_circle</span>
            <h3 className="text-xl font-bold text-ink-deep mb-2">Report Submitted</h3>
            <p className="text-secondary mb-6 leading-relaxed">
              Thank you for helping us maintain a safe community. Our moderation team will review this listing.
            </p>
            <button 
              onClick={onClose} 
              className="bg-ink-deep hover:bg-ink-dark text-white font-bold py-3 px-6 rounded-xl w-full transition-colors shadow-sm"
            >
              Close Window
            </button>
          </div>
        ) : (
          <>
            <p className="text-secondary mb-6 text-sm leading-relaxed">
              You are reporting <strong>{business.business_name}</strong>. Please provide details below.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex gap-2 items-start border border-red-100">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Reason for reporting *</label>
                <div className="relative">
                  <select 
                    name="reason" 
                    value={formData.reason} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full p-3 rounded-xl border border-outline-variant bg-surface focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all appearance-none"
                  >
                    <option value="fake">Fake/Spam Business</option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="closed">Business Permanently Closed</option>
                    <option value="wrong_info">Incorrect Information</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-secondary pointer-events-none">expand_more</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Description (Optional)</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows={4}
                  placeholder="Please provide any additional details..."
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-y"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl w-full transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
