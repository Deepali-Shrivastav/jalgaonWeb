import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { UserContext } from '../context/UserContext';
import './PostJobPage.css';

const PostJobPage = () => {
    const { user, loading: userLoading } = useContext(UserContext);
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const navigate = useNavigate();
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        job_type: 'full_time',
        category: '',
        salary_min: '',
        salary_max: '',
        description: '',
        requirements: '',
        deadline: '',
        apply_url: ''
    });

    useEffect(() => {
        if (!userLoading) {
            if (!user) {
                navigate('/account');
            } else {
                fetchCategories();
            }
        }
    }, [user, userLoading, navigate]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${djangoApi}/api/v1/jobs/categories/`);
            setCategories(response.data.results || response.data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const dataToSubmit = { ...formData };
            if (!dataToSubmit.salary_min) delete dataToSubmit.salary_min;
            if (!dataToSubmit.salary_max) delete dataToSubmit.salary_max;
            if (!dataToSubmit.deadline) delete dataToSubmit.deadline;
            
            await axios.post(`${djangoApi}/api/v1/jobs/submit/`, dataToSubmit, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSuccess(true);
        } catch (err) {
            console.error("Error submitting job:", err);
            setError("Failed to submit job. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="post-job-page">
                <Navbar />
                <div className="container" style={{padding: '80px 0', textAlign: 'center'}}>
                    <div className="success-box">
                        <i className='bx bxs-check-circle'></i>
                        <h2>Job Submitted Successfully!</h2>
                        <p>Your job post has been submitted and is currently pending admin approval.</p>
                        <p>It will appear on the platform once approved.</p>
                        <button className="btn-primary" onClick={() => navigate('/jobs')}>Back to Jobs</button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="post-job-page">
            <Navbar />
            
            <div className="post-job-header">
                <div className="container">
                    <h1>Post a Job</h1>
                    <p>Find the best talent in Jalgaon</p>
                </div>
            </div>
            
            <div className="container post-job-main">
                <form className="post-job-form" onSubmit={handleSubmit}>
                    {error && <div className="error-alert">{error}</div>}
                    
                    <div className="form-section">
                        <h3>Basic Details</h3>
                        
                        <div className="form-group">
                            <label>Job Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Senior Software Engineer" />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Company Name *</label>
                                <input type="text" name="company" value={formData.company} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Location *</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Jalgaon, MH" />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Job Type *</label>
                                <select name="job_type" value={formData.job_type} onChange={handleChange} required>
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3>Job Details</h3>
                        
                        <div className="form-group">
                            <label>Description *</label>
                            <textarea name="description" rows="6" value={formData.description} onChange={handleChange} required></textarea>
                        </div>
                        
                        <div className="form-group">
                            <label>Requirements *</label>
                            <textarea name="requirements" rows="6" value={formData.requirements} onChange={handleChange} required></textarea>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3>Additional Information</h3>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Min Salary (Monthly ₹)</label>
                                <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Max Salary (Monthly ₹)</label>
                                <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Application Deadline</label>
                                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>External Apply URL (Optional)</label>
                                <input type="url" name="apply_url" value={formData.apply_url} onChange={handleChange} placeholder="https://..." />
                                <small>Leave empty to allow applicants to apply directly on this platform.</small>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Job Post'}
                        </button>
                    </div>
                </form>
            </div>
            
            <Footer />
        </div>
    );
};

export default PostJobPage;
