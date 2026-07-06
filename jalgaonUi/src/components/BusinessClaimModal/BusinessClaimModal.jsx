import React, { useState } from 'react';
import axios from 'axios';
import { MdClose } from 'react-icons/md';

const BusinessClaimModal = ({ isOpen, onClose, business, djangoApi }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        message: '',
        contact_number: ''
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
            if (!token) {
                setError('You must be logged in to claim a business.');
                setSubmitting(false);
                return;
            }

            await axios.post(`${djangoApi}/api/v1/listings/${business.slug}/claim/`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setSuccess(true);
        } catch (err) {
            console.error('Claim error:', err);
            setError(err.response?.data?.[0] || err.response?.data?.error || 'Failed to submit claim. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', position: 'relative', boxSizing: 'border-box' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>
                    <MdClose />
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>Claim Business</h2>
                
                {success ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '48px', color: '#22c55e', marginBottom: '10px' }}><i className='bx bxs-check-circle'></i></div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Claim Submitted!</h3>
                        <p style={{ color: '#475569', marginBottom: '20px' }}>Your claim for <strong>{business.business_name}</strong> has been submitted. Our team will verify your details and contact you shortly.</p>
                        <button onClick={onClose} style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 'bold', boxSizing: 'border-box' }}>
                            Close Window
                        </button>
                    </div>
                ) : (
                    <>
                        <p style={{ color: '#475569', marginBottom: '20px' }}>
                            Are you the owner of <strong>{business.business_name}</strong>? Provide your details below so we can verify your claim.
                        </p>

                        {error && (
                            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', boxSizing: 'border-box' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Contact Number *</label>
                                <input 
                                    type="text" 
                                    name="contact_number" 
                                    value={formData.contact_number} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="e.g., 9876543210"
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>Verification Message *</label>
                                <textarea 
                                    name="message" 
                                    value={formData.message} 
                                    onChange={handleInputChange} 
                                    required 
                                    rows="4"
                                    placeholder="Please provide any details or GST info that proves your ownership."
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                style={{ padding: '12px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', width: '100%', fontWeight: 'bold', fontSize: '16px', opacity: submitting ? 0.7 : 1, boxSizing: 'border-box' }}
                            >
                                {submitting ? 'Submitting Claim...' : 'Submit Claim Request'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default BusinessClaimModal;
