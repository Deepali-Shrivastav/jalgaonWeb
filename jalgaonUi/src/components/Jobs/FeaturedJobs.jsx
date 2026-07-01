import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from './JobCard';
import './FeaturedJobs.css';
import { Link } from 'react-router-dom';

const FeaturedJobs = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedJobs = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/jobs/featured/`);
                setJobs(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching featured jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedJobs();
    }, [djangoApi]);

    if (loading) {
        return (
            <div className="featured-jobs-section">
                <div className="section-header">
                    <h2><i className='bx bx-briefcase-alt-2'></i> Latest Jobs in Jalgaon</h2>
                </div>
                <div className="featured-jobs-scroll">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="job-card-skeleton" style={{minWidth: '300px'}}>
                            <div className="skeleton-header">
                                <div className="skeleton-logo"></div>
                                <div className="skeleton-title-group">
                                    <div className="skeleton-title"></div>
                                    <div className="skeleton-company"></div>
                                </div>
                            </div>
                            <div className="skeleton-details"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!jobs || jobs.length === 0) return null;

    return (
        <div className="featured-jobs-section container">
            <div className="section-header">
                <h2><i className='bx bx-briefcase-alt-2'></i> Latest Jobs in Jalgaon</h2>
                <Link to="/jobs" className="view-all-link">View All Jobs <i className='bx bx-right-arrow-alt'></i></Link>
            </div>
            <div className="featured-jobs-scroll">
                {jobs.map(job => (
                    <div className="featured-job-wrapper" key={job.id}>
                        <JobCard job={job} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedJobs;
