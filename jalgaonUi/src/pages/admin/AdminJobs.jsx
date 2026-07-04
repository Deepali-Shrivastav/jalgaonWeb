import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdCheckCircle, MdCancel, MdDelete, MdSearch } from 'react-icons/md';
import './AdminJobs.css';

const AdminJobs = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${djangoApi}/api/v1/jobs/admin/jobs/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching admin jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${djangoApi}/api/v1/jobs/admin/jobs/${id}/status/`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchJobs();
        } catch (error) {
            console.error("Error updating job status:", error);
            alert("Failed to update status.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${djangoApi}/api/v1/jobs/admin/jobs/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchJobs();
        } catch (error) {
            console.error("Error deleting job:", error);
            alert("Failed to delete job.");
        }
    };

    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page admin-jobs-page">
            <div className="admin-page-header">
                <h2>Manage Job Listings</h2>
                <div className="admin-search-bar">
                    <MdSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search jobs or companies..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-table-container">
                {loading ? (
                    <div className="admin-loading">Loading jobs...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Company</th>
                                <th>Status</th>
                                <th>Posted Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">No jobs found.</td>
                                </tr>
                            ) : (
                                filteredJobs.map(job => (
                                    <tr key={job.id}>
                                        <td>{job.title}</td>
                                        <td>{job.company}</td>
                                        <td>
                                            <span className={`status-badge ${job.status}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td>{new Date(job.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="admin-action-buttons">
                                                {job.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            className="btn-icon success" 
                                                            onClick={() => handleStatusChange(job.id, 'active')}
                                                            title="Approve"
                                                        >
                                                            <MdCheckCircle />
                                                        </button>
                                                        <button 
                                                            className="btn-icon danger" 
                                                            onClick={() => handleStatusChange(job.id, 'rejected')}
                                                            title="Reject"
                                                        >
                                                            <MdCancel />
                                                        </button>
                                                    </>
                                                )}
                                                {job.status === 'active' && (
                                                    <button 
                                                        className="btn-icon warning" 
                                                        onClick={() => handleStatusChange(job.id, 'closed')}
                                                        title="Close Job"
                                                    >
                                                        <MdCancel />
                                                    </button>
                                                )}
                                                <button 
                                                    className="btn-icon danger" 
                                                    onClick={() => handleDelete(job.id)}
                                                    title="Delete"
                                                >
                                                    <MdDelete />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminJobs;
