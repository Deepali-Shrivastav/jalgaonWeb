"use client";

import React, { useState } from 'react';

interface JobApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  baseUrl: string;
}

export default function JobApplyModal({ isOpen, onClose, job, baseUrl }: JobApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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

      // If backend requires multipart/form-data for resume, we would use FormData
      // For now, assuming cover_letter is the main text requirement for quick apply
      const formData = new FormData();
      formData.append('cover_letter', coverLetter);

      const res = await fetch(`${baseUrl}/api/v1/jobs/${job.slug}/apply/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData[0] || errorData.error || errorData.detail || 'Failed to submit application. Please try again later.');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Apply error:', err);
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg relative shadow-2xl animate-fade-in">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <h2 className="text-2xl font-bold text-ink-deep mb-2 flex items-center gap-2">
          Apply for {job.title}
        </h2>
        <p className="text-secondary mb-6 text-sm">at {job.company}</p>
        
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
                <label className="block text-sm font-semibold text-ink-deep mb-2">Cover Letter / Message to Employer</label>
                <textarea 
                  name="cover_letter" 
                  value={coverLetter} 
                  onChange={(e) => setCoverLetter(e.target.value)} 
                  required 
                  rows={6}
                  placeholder="Introduce yourself and explain why you're a great fit for this role..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
                />
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 flex items-start gap-2">
                 <span className="material-symbols-outlined text-[20px]">info</span>
                 Your default resume attached to your profile will be sent automatically with this application.
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
    </div>
  );
}
