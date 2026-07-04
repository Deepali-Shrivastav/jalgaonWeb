import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import JobGrid from '../components/Jobs/JobGrid';
import JobCategoryFilter from '../components/Jobs/JobCategoryFilter';
import JobFilterSidebar from '../components/Jobs/JobFilterSidebar';
import FeaturedJobs from '../components/Jobs/FeaturedJobs';
import './JobsIndexPage.css';

const JobsIndexPage = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchJobs = useCallback(async (pageNum = 1, append = false) => {
        setLoading(true);
        try {
            let params = { page: pageNum };
            if (currentCategory) params.category = currentCategory;
            if (searchQuery) params.search = searchQuery;
            if (filters.location) params.location = filters.location;
            if (filters.job_type) params.job_type = filters.job_type;
            if (filters.salary_min) params.salary_min = filters.salary_min;

            const response = await axios.get(`${djangoApi}/api/v1/jobs/`, { params });
            const newJobs = response.data.results || response.data;
            
            if (append) {
                setJobs(prev => [...prev, ...newJobs]);
            } else {
                setJobs(newJobs);
            }
            
            setHasMore(!!response.data.next);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    }, [djangoApi, currentCategory, searchQuery, filters]);

    useEffect(() => {
        setPage(1);
        fetchJobs(1);
    }, [fetchJobs]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchJobs(1);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchJobs(nextPage, true);
    };

    const handleSaveToggle = async (slug) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please login to save jobs.");
            return;
        }
        
        try {
            const response = await axios.post(`${djangoApi}/api/v1/jobs/${slug}/save/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local state to reflect save toggle
            setJobs(jobs.map(job => {
                if (job.slug === slug) {
                    return { ...job, is_saved: response.data.status === 'saved' };
                }
                return job;
            }));
        } catch (err) {
            console.error("Error toggling save:", err);
        }
    };

    return (
        <div className="jobs-index-page">
            <Navbar />
            
            <div className="jobs-hero">
                <div className="container">
                    <h1>Find Your Dream Job in Jalgaon</h1>
                    <p>Discover opportunities from top companies in the city.</p>
                    <form className="jobs-search-form" onSubmit={handleSearchSubmit}>
                        <div className="search-input-wrapper">
                            <i className='bx bx-search'></i>
                            <input 
                                type="text" 
                                placeholder="Job title, keyword, or company..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="search-btn">Search Jobs</button>
                    </form>
                </div>
            </div>

            {!searchQuery && Object.keys(filters).length === 0 && !currentCategory && (
                <FeaturedJobs />
            )}

            <div className="container jobs-main-content">
                <div className="jobs-layout">
                    <aside className="jobs-sidebar">
                        <JobFilterSidebar 
                            filters={filters} 
                            onFilterChange={setFilters} 
                        />
                    </aside>
                    
                    <main className="jobs-feed">
                        <JobCategoryFilter 
                            currentCategory={currentCategory}
                            onCategoryChange={setCurrentCategory}
                        />
                        
                        <div className="jobs-results-header">
                            <h2>{loading && page === 1 ? 'Loading...' : `${jobs.length} Jobs Found`}</h2>
                        </div>
                        
                        <JobGrid 
                            jobs={jobs} 
                            loading={loading && page === 1} 
                            onSaveToggle={handleSaveToggle}
                        />
                        
                        {hasMore && (
                            <div className="load-more-wrapper">
                                <button 
                                    className="load-more-btn"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Load More Jobs'}
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default JobsIndexPage;
