import React from 'react';
import JobCard from './JobCard';
import './JobGrid.css';

const JobGrid = ({ jobs, loading, onSaveToggle }) => {
    if (loading) {
        return (
            <div className="job-grid loading">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="job-card-skeleton">
                        <div className="skeleton-header">
                            <div className="skeleton-logo"></div>
                            <div className="skeleton-title-group">
                                <div className="skeleton-title"></div>
                                <div className="skeleton-company"></div>
                            </div>
                        </div>
                        <div className="skeleton-details"></div>
                        <div className="skeleton-footer"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!jobs || jobs.length === 0) {
        return (
            <div className="job-grid-empty">
                <i className='bx bx-search-alt'></i>
                <h3>No Jobs Found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
        );
    }

    return (
        <div className="job-grid">
            {jobs.map(job => (
                <JobCard key={job.id} job={job} onSaveToggle={onSaveToggle} />
            ))}
        </div>
    );
};

export default JobGrid;
