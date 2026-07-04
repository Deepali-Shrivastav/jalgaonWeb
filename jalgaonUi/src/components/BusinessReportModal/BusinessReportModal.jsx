import React, { useState } from 'react';
import axios from 'axios';
import { MdClose } from 'react-icons/md';

const BusinessReportModal = ({ isOpen, onClose, business, djangoApi }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        reason: 'fake',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            await axios.post(`${djangoApi}/api/v1/listings/${business.slug}/report/`, formData, {
                headers
            });

            setSuccess(true);
        } catch (err) {
            console.error('Report error:', err);
            setError(err.response?.data?.[0] || err.response?.data?.error || 'Failed to submit report. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>
                    <MdClose />
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>Report Business</h2>
                
                {success ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '48px', color: '#22c55e', marginBottom: '10px' }}><i className='bx bxs-check-circle'></i></div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Report Submitted</h3>
                        <p style={{ color: '#475569', marginBottom: '20px' }}>Thank you for helping us maintain a safe community. Our moderation team will review this listing.</p>
                        <button onClick={onClose} style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
                            Close Window
                        </button>
                    </div>
                ) : (
                    <>
                        <p style={{ color: '#475569', marginBottom: '20px', fontSize: '14px' }}>
                            You are reporting <strong>{business.business_name}</strong>. Please provide details below.
                        </p>

                        {error && (
                            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Reason for reporting *</label>
                                <select 
                                    name="reason" 
                                    value={formData.reason} 
                                    onChange={handleInputChange} 
                                    required 
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
                                >
                                    <option value="fake">Fake/Spam Business</option>
                                    <option value="inappropriate">Inappropriate Content</option>
                                    <option value="closed">Business Permanently Closed</option>
                                    <option value="wrong_info">Incorrect Information</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Description (Optional)</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                    rows="4"
                                    placeholder="Please provide any additional details..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                style={{ padding: '12px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', width: '100%', fontWeight: 'bold', fontSize: '16px', opacity: submitting ? 0.7 : 1 }}
                            >
                                {submitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default BusinessReportModal;
