import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './JobCard.css';

const JobCard = ({ job, onSaveToggle }) => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const isSaved = job.is_saved; // Assuming API returns this if authenticated, we might need a separate call or pass it

    const formatSalary = (min, max) => {
        if (!min && !max) return 'Not Disclosed';
        if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
        return min ? `From ₹${min.toLocaleString()}` : `Up to ₹${max.toLocaleString()}`;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSaveToggle) {
            onSaveToggle(job.slug);
        }
    };

    const getJobTypeLabel = (type) => {
        const types = {
            'full_time': 'Full Time',
            'part_time': 'Part Time',
            'contract': 'Contract',
            'internship': 'Internship'
        };
        return types[type] || type;
    };

    return (
        <div className="job-card">
            <Link to={`/jobs/${job.slug}`} className="job-card-link">
                <div className="job-card-header">
                    <div className="job-card-company-info">
                        {job.company_logo ? (
                            <img src={`${djangoApi}${job.company_logo}`} alt={job.company} className="job-logo" />
                        ) : (
                            <div className="job-logo-placeholder">{job.company.charAt(0)}</div>
                        )}
                        <div>
                            <h3 className="job-title">{job.title}</h3>
                            <p className="job-company">{job.company}</p>
                        </div>
                    </div>
                    <button className="save-btn" onClick={handleSave} title="Save Job">
                        <i className={`bx ${isSaved ? 'bxs-bookmark' : 'bx-bookmark'}`}></i>
                    </button>
                </div>
                
                <div className="job-card-details">
                    <div className="detail-item">
                        <i className='bx bx-map'></i> {job.location}
                    </div>
                    <div className="detail-item">
                        <i className='bx bx-rupee'></i> {formatSalary(job.salary_min, job.salary_max)}
                    </div>
                    <div className="detail-item">
                        <i className='bx bx-briefcase'></i> {getJobTypeLabel(job.job_type)}
                    </div>
                </div>
                
                <div className="job-card-footer">
                    <span className="job-date">
                        <i className='bx bx-time'></i> {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    <span className="apply-link">View Details <i className='bx bx-right-arrow-alt'></i></span>
                </div>
            </Link>
        </div>
    );
};

export default JobCard;
