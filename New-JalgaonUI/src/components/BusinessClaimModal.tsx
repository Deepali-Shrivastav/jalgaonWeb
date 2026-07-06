"use client";

import React, { useState } from 'react';

interface BusinessClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: any;
  baseUrl: string;
}

export default function BusinessClaimModal({ isOpen, onClose, business, baseUrl }: BusinessClaimModalProps) {
  const [formData, setFormData] = useState({ message: '', contact_number: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to claim a business.');
        setSubmitting(false);
        return;
      }

      const res = await fetch(`${baseUrl}/api/v1/listings/${business.slug}/claim/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData[0] || errorData.error || 'Failed to submit claim. Please try again later.');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Claim error:', err);
      setError(err.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl p-8 w-[90vw] md:w-[500px] max-w-[500px] relative shadow-2xl animate-fade-in box-border min-w-[320px]">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <h2 className="text-2xl font-bold text-ink-deep mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">verified</span>
          Claim Business
        </h2>
        
        {success ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4 animate-bounce">check_circle</span>
            <h3 className="text-xl font-bold text-ink-deep mb-2">Claim Submitted!</h3>
            <p className="text-secondary mb-6 leading-relaxed">
              Your claim for <strong>{business.business_name}</strong> has been submitted. Our team will verify your details and contact you shortly.
            </p>
            <button 
              onClick={onClose} 
              className="bg-primary hover:bg-primary-deep text-white font-bold py-3 px-6 rounded-xl w-full transition-colors shadow-sm"
            >
              Close Window
            </button>
          </div>
        ) : (
          <>
            <p className="text-secondary mb-6 text-sm leading-relaxed">
              Are you the owner of <strong>{business.business_name}</strong>? Provide your details below so we can verify your claim.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex gap-2 items-start border border-red-100">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Contact Number *</label>
                <input 
                  type="text" 
                  name="contact_number" 
                  value={formData.contact_number} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g., 9876543210"
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Verification Message *</label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleInputChange} 
                  required 
                  rows={4}
                  placeholder="Please provide any details or GST info that proves your ownership."
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="bg-primary hover:bg-primary-deep text-white font-bold py-3 px-6 rounded-xl w-full transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  'Submit Claim Request'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
