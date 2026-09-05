"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { AuthContext } from '@/context/AuthContext';

interface JobApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  baseUrl: string;
}

export default function JobApplyModal({ isOpen, onClose, job, baseUrl }: JobApplyModalProps) {
  const { user } = React.useContext(AuthContext);
  
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setApplicantName(user.get_full_name || user.first_name || '');
      setApplicantEmail(user.email || '');
      setApplicantPhone(user.phone_number || '');
    }
  }, [user]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to apply for a job.');
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('applicant_name', applicantName);
      formData.append('applicant_email', applicantEmail);
      formData.append('applicant_phone', applicantPhone);
      formData.append('cover_letter', coverLetter);
      if (resume) {
        formData.append('resume', resume);
      }

      const res = await fetch(`${baseUrl}/api/v1/jobs/${job.slug}/apply/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        let errorMessage = 'Failed to submit application. Please try again later.';
        
        if (errorData.detail) errorMessage = errorData.detail;
        else if (errorData.error) errorMessage = errorData.error;
        else if (errorData.non_field_errors) errorMessage = errorData.non_field_errors[0];
        else if (typeof errorData === 'object' && !Array.isArray(errorData) && Object.keys(errorData).length > 0) {
           const firstKey = Object.keys(errorData)[0];
           if (Array.isArray(errorData[firstKey])) {
             // Format key nicely (e.g. cover_letter -> Cover letter)
             const formattedKey = firstKey.replace('_', ' ').charAt(0).toUpperCase() + firstKey.replace('_', ' ').slice(1);
             errorMessage = `${formattedKey}: ${errorData[firstKey][0]}`;
           } else if (typeof errorData[firstKey] === 'string') {
             errorMessage = errorData[firstKey];
           }
        } else if (Array.isArray(errorData) && errorData.length > 0 && typeof errorData[0] === 'string') {
           errorMessage = errorData[0];
        }

        throw new Error(errorMessage);
      }

      setSuccess(true);
    } catch (err: any) {
      console.warn('Apply error:', err.message || err);
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl p-6 w-[95vw] md:w-[500px] max-h-[90vh] overflow-y-auto relative shadow-2xl animate-fade-in shrink-0">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <h2 className="text-2xl font-bold text-ink-deep mb-2 flex items-center gap-2">
          Apply for {job.title}
        </h2>
        <p className="text-secondary mb-2 text-sm">at {job.company}</p>
                
        {success ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4 animate-bounce">check_circle</span>
            <h3 className="text-xl font-bold text-ink-deep mb-2">Application Submitted!</h3>
            <p className="text-secondary mb-6 leading-relaxed">
              Your application has been successfully sent to the employer. Good luck!
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
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex gap-2 items-start border border-red-100">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Full Name *</label>
                <input 
                  type="text" 
                  value={applicantName} 
                  onChange={(e) => setApplicantName(e.target.value)} 
                  required 
                  placeholder="e.g. John Doe"
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-deep mb-2">Email *</label>
                  <input 
                    type="email" 
                    value={applicantEmail} 
                    onChange={(e) => setApplicantEmail(e.target.value)} 
                    required 
                    placeholder="e.g. john@example.com"
                    className="w-full p-3 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-deep mb-2">Phone Number *</label>
                  <input 
                    type="tel" 
                    value={applicantPhone} 
                    onChange={(e) => setApplicantPhone(e.target.value)} 
                    required 
                    placeholder="e.g. +91 9876543210"
                    className="w-full p-3 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Cover Letter / Message to Employer</label>
                <textarea 
                  name="cover_letter" 
                  value={coverLetter} 
                  onChange={(e) => setCoverLetter(e.target.value)} 
                  required 
                  rows={4}
                  placeholder="Introduce yourself and explain why you're a great fit for this role..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-deep mb-2">Resume (PDF/DOC, max 500KB) <span className="font-normal text-slate-500">(Optional)</span></label>
                <input 
                  type="file" 
                  name="resume" 
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files?.[0] || null)} 
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="bg-primary hover:bg-primary-deep text-white font-bold py-3 px-6 rounded-xl w-full transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
