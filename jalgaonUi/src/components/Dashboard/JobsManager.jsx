import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdAdd, MdClose } from 'react-icons/md';

const JobsManager = ({ business }) => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [jobs, setJobs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [categories, setCategories] = useState([]);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        location: business.city || '',
        job_type: 'full_time',
        category: '',
        salary_min: '',
        salary_max: '',
        description: '',
        requirements: ''
    });

    useEffect(() => {
        fetchJobs();
        fetchCategories();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${djangoApi}/api/v1/jobs/my-jobs/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Filter jobs that belong to this business
            const businessJobs = (res.data.results || res.data).filter(j => j.company === business.business_name);
            setJobs(businessJobs);
        } catch (error) {
            console.error('Error fetching jobs', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${djangoApi}/api/v1/jobs/categories/`);
            setCategories(res.data.results || res.data);
        } catch (error) {
            console.error('Error fetching job categories', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const csrf = localStorage.getItem('csrftoken');
            
            const payload = {
                ...formData,
                company: business.business_name,
                shop_listing: business.id
            };

            await axios.post(`${djangoApi}/api/v1/jobs/submit/`, payload, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'X-CSRFToken': csrf
                }
            });
            
            alert('Job posted successfully!');
            setShowForm(false);
            fetchJobs();
            
            // Reset form
            setFormData({
                title: '',
                location: business.city || '',
                job_type: 'full_time',
                category: '',
                salary_min: '',
                salary_max: '',
                description: '',
                requirements: ''
            });
        } catch (error) {
            console.error('Error submitting job', error);
            alert('Failed to submit job. Please check fields.');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Jobs at {business.business_name}</h2>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: '8px 16px', background: showForm ? '#ef4444' : '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    {showForm ? <><MdClose /> Cancel</> : <><MdAdd /> Post Job</>}
                </button>
            </div>
            
            {showForm && (
                <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Create New Job Posting</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Job Title*</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Location*</label>
                                <input type="text" name="location" value={formData.location} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Job Type</label>
                                <select name="job_type" value={formData.job_type} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Min Salary (₹)</label>
                                <input type="number" name="salary_min" value={formData.salary_min} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Max Salary (₹)</label>
                                <input type="number" name="salary_max" value={formData.salary_max} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Job Description*</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="4" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}></textarea>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Requirements</label>
                            <textarea name="requirements" value={formData.requirements} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}></textarea>
                        </div>

                        <button type="submit" style={{ padding: '10px 20px', background: '#0081C7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Publish Job
                        </button>
                    </form>
                </div>
            )}

            {!showForm && (
                <div>
                    {jobs.length > 0 ? (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {jobs.map(job => (
                                <div key={job.id} style={{ padding: '15px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{job.title}</h4>
                                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '15px' }}>
                                            <span><i className='bx bx-map'></i> {job.location}</span>
                                            <span><i className='bx bx-time'></i> {job.job_type.replace('_', ' ')}</span>
                                            {job.salary_max && <span><i className='bx bx-rupee'></i> {job.salary_min} - {job.salary_max}</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: job.status === 'active' ? '#dcfce7' : '#fef9c3', color: job.status === 'active' ? '#166534' : '#854d0e' }}>
                                            {job.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                            You haven't posted any jobs for this business yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobsManager;
