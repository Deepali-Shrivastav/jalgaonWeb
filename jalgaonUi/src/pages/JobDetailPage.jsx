import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import JobApplicationForm from '../components/Jobs/JobApplicationForm';
import SocialShareBar from '../components/News/SocialShareBar';
import JobSchemaLD from '../components/Jobs/JobSchemaLD';
import './JobDetailPage.css';

const JobDetailPage = () => {
    const { slug } = useParams();
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/jobs/${slug}/`);
                setJob(response.data);
            } catch (err) {
                console.error("Error fetching job details:", err);
                setError("Job not found or has expired.");
            } finally {
                setLoading(false);
            }
        };
        
        if (slug) fetchJob();
    }, [slug, djangoApi]);

    if (loading) {
        return (
            <div className="job-detail-page">
                <Navbar />
                <div className="container">
                    <div className="job-loading">Loading job details...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="job-detail-page">
                <Navbar />
                <div className="container">
                    <div className="job-error">
                        <h2>{error}</h2>
                        <Link to="/jobs" className="back-link">Back to Jobs</Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="job-detail-page">
            <JobSchemaLD job={job} />
            <Navbar />
            
            <div className="job-header-bg">
                <div className="container">
                    <Link to="/jobs" className="back-link-top"><i className='bx bx-left-arrow-alt'></i> Back to Jobs</Link>
                </div>
            </div>

            <main className="container job-detail-main">
                <div className="job-content-wrapper">
                    <div className="job-main-column">
                        <div className="job-header-card">
                            <div className="job-header-top">
                                {job.category && <span className="job-category-tag">{job.category.name}</span>}
                                <span className="job-type-tag">{job.job_type.replace('_', ' ')}</span>
                            </div>
                            
                            <h1 className="job-detail-title">{job.title}</h1>
                            
                            <div className="job-company-row">
                                {job.company_logo ? (
                                    <img src={`${djangoApi}${job.company_logo}`} alt={job.company} className="job-detail-logo" />
                                ) : (
                                    <div className="job-detail-logo-placeholder">{job.company.charAt(0)}</div>
                                )}
                                <div className="job-company-details">
                                    <h3 className="job-detail-company">{job.company}</h3>
                                    <span className="job-detail-location"><i className='bx bx-map'></i> {job.location}</span>
                                </div>
                            </div>
                            
                            <div className="job-quick-stats">
                                <div className="stat-item">
                                    <i className='bx bx-rupee'></i>
                                    <div>
                                        <span>Salary</span>
                                        <strong>
                                            {job.salary_min || job.salary_max 
                                                ? `${job.salary_min ? job.salary_min.toLocaleString() : '0'} - ${job.salary_max ? job.salary_max.toLocaleString() : 'Not Disclosed'}` 
                                                : 'Not Disclosed'}
                                        </strong>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <i className='bx bx-calendar'></i>
                                    <div>
                                        <span>Posted</span>
                                        <strong>{new Date(job.created_at).toLocaleDateString()}</strong>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <i className='bx bx-time-five'></i>
                                    <div>
                                        <span>Deadline</span>
                                        <strong>{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="job-description-section">
                            <h2>Job Description</h2>
                            <div className="formatted-content">
                                {job.description.split('\n').map((para, i) => <p key={i}>{para}</p>)}
                            </div>
                        </div>

                        <div className="job-requirements-section">
                            <h2>Requirements</h2>
                            <div className="formatted-content">
                                {job.requirements.split('\n').map((para, i) => <p key={i}>{para}</p>)}
                            </div>
                        </div>

                        <div id="apply-section">
                            {job.apply_url ? (
                                <div className="external-apply-box">
                                    <h3>Apply for this Job</h3>
                                    <p>This job requires you to apply on the employer's website.</p>
                                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="apply-external-btn">
                                        Apply on Company Site <i className='bx bx-link-external'></i>
                                    </a>
                                </div>
                            ) : (
                                <JobApplicationForm jobSlug={job.slug} />
                            )}
                        </div>
                    </div>

                    <aside className="job-sidebar-column">
                        <div className="job-sidebar-card">
                            <h3>Share this Job</h3>
                            <SocialShareBar url={currentUrl} title={`${job.title} at ${job.company}`} />
                        </div>
                        
                        <div className="job-sidebar-card apply-sticky-card">
                            <h3>Interested?</h3>
                            <p>Don't miss out on this opportunity.</p>
                            <a href="#apply-section" className="apply-jump-btn">Apply Now</a>
                        </div>
                    </aside>
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default JobDetailPage;
