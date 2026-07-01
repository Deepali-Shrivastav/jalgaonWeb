import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdDownload, MdSearch } from 'react-icons/md';

const AdminJobApplications = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${djangoApi}/api/v1/jobs/admin/applications/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching job applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = applications.filter(app => 
        app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page admin-job-applications-page">
            <div className="admin-page-header">
                <h2>All Job Applications</h2>
                <div className="admin-search-bar">
                    <MdSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by job title or applicant..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-table-container">
                {loading ? (
                    <div className="admin-loading">Loading applications...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Job Title</th>
                                <th>Status</th>
                                <th>Applied Date</th>
                                <th>Resume</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">No applications found.</td>
                                </tr>
                            ) : (
                                filteredApplications.map(app => (
                                    <tr key={app.id}>
                                        <td>
                                            <div><strong>{app.applicant_name}</strong></div>
                                            <div style={{fontSize: '0.85rem', color: '#64748b'}}>{app.applicant_email}</div>
                                        </td>
                                        <td>{app.job_title}</td>
                                        <td>
                                            <span className={`status-badge ${app.status.toLowerCase()}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                                        <td>
                                            {app.resume ? (
                                                <a 
                                                    href={`${djangoApi}${app.resume}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="btn-icon"
                                                    title="Download Resume"
                                                >
                                                    <MdDownload />
                                                </a>
                                            ) : (
                                                <span style={{color: '#94a3b8'}}>No Resume</span>
                                            )}
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

export default AdminJobApplications;
