import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import './JobApplicationForm.css';

const JobApplicationForm = ({ jobSlug, onSuccess }) => {
    const { user } = useContext(UserContext);
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    
    const [resume, setResume] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResume(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setError("You must be logged in to apply for this job.");
            return;
        }

        if (!resume) {
            setError("Please upload your resume to apply.");
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('resume', resume);
            if (coverLetter) {
                formData.append('cover_letter', coverLetter);
            }

            await axios.post(`${djangoApi}/api/v1/jobs/${jobSlug}/apply/`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setSuccessMessage("Your application has been submitted successfully!");
            setResume(null);
            setCoverLetter('');
            if (onSuccess) onSuccess();
            
        } catch (err) {
            console.error("Error applying to job:", err);
            setError(err.response?.data?.detail || err.response?.data?.error || "Failed to submit application. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (successMessage) {
        return (
            <div className="job-apply-form success-state">
                <i className='bx bxs-check-circle'></i>
                <h4>Application Submitted!</h4>
                <p>{successMessage}</p>
            </div>
        );
    }

    return (
        <div className="job-apply-form">
            <h3>Apply for this Job</h3>
            
            {!user ? (
                <div className="login-prompt">
                    <p>Please log in or register to apply for this position.</p>
                    <a href="/account" className="login-btn">Login / Register</a>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {error && <div className="form-error">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="resume">Resume/CV (PDF or DOCX) *</label>
                        <div className="file-upload-wrapper">
                            <input 
                                type="file" 
                                id="resume" 
                                accept=".pdf,.doc,.docx" 
                                onChange={handleFileChange}
                                required
                            />
                            <div className="file-upload-ui">
                                <i className='bx bx-cloud-upload'></i>
                                <span>{resume ? resume.name : 'Click to upload your resume'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="coverLetter">Cover Letter (Optional)</label>
                        <textarea 
                            id="coverLetter" 
                            rows="5" 
                            placeholder="Write a brief message to the employer explaining why you're a good fit for this role..."
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                        ></textarea>
                    </div>
                    
                    <button type="submit" className="submit-application-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default JobApplicationForm;
