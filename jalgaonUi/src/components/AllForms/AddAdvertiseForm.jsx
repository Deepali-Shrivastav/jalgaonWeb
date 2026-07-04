import React, { useState, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';
import './AddListingForm.css';
import { UserContext } from '../../context/UserContext';

const adTypeOptions = [
    { value: 'BA', label: 'Banner Ad' },
    { value: 'CA', label: 'Carousel Ad' }
];

const targetPageOptions = [
    { value: 'hero_banner', label: 'Homepage Hero Banner' },
    { value: 'category_banner', label: 'Category Page Banner' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'listing_interstitial', label: 'Between Listings' }
];

const packageOptions = [
    { value: 'basic', label: 'Basic Package (3 Days - ₹499)' },
    { value: 'standard', label: 'Standard Package (7 Days - ₹999)' },
    { value: 'premium', label: 'Premium Package (30 Days - ₹2,499)' }
];

function AddAdvertiseForm() {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const apiUrl = `${djangoApi}/api/v1/ads/submit/`;
    const { user } = useContext(UserContext);
    const [searchParams] = useSearchParams();

    const initialPackageParam = searchParams.get('package');
    const selectedInitialPackage = packageOptions.find(p => p.value === initialPackageParam) || packageOptions[0];

    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        contact_number: user?.phone_number || '',
        contact_email: '',
        ad_type: adTypeOptions[0],
        target_page: targetPageOptions[0],
        package: selectedInitialPackage,
        start_date: '',
        end_date: '',
        ad_image: null,
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                contact_number: prev.contact_number || user.phone_number || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrorMsg('File size must not exceed 5MB');
                return;
            }
            setErrorMsg('');
            setFormData(prev => ({ ...prev, ad_image: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');

        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('contact_number', formData.contact_number);
        data.append('contact_email', formData.contact_email);
        data.append('ad_type', formData.ad_type.value);
        data.append('target_page', formData.target_page.value);
        data.append('package', formData.package.value);

        if (formData.start_date) data.append('start_date', formData.start_date);
        if (formData.end_date) data.append('end_date', formData.end_date);
        if (formData.ad_image) data.append('ad_image', formData.ad_image);

        try {
            await axios.post(
                apiUrl,
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                }
            );

            setSuccessMsg("Advertisement request submitted successfully! Our team will review your campaign details.");
            setFormData({
                name: '',
                contact_number: user?.phone_number || '',
                contact_email: '',
                ad_type: adTypeOptions[0],
                target_page: targetPageOptions[0],
                package: packageOptions[0],
                start_date: '',
                end_date: '',
                ad_image: null,
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error submitting ad:', error);
            if (error.response?.data?.detail) {
                setErrorMsg(error.response.data.detail);
            } else if (typeof error.response?.data === 'object') {
                const messages = Object.entries(error.response.data)
                    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                    .join(' | ');
                setErrorMsg(messages || "Failed to submit advertisement request.");
            } else {
                setErrorMsg("Failed to submit advertisement request. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="addListingForm_section">
            <div className="addListingForm_heading">
                <h1>Submit Advertisement for Jalgaon.com</h1>
                <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
                    Fill out campaign details and upload your creative to start reaching local customers.
                </p>
            </div>

            {successMsg && (
                <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    margin: '20px 0',
                    fontWeight: '500'
                }}>
                    <i className='bx bx-check-circle' style={{ marginRight: '8px', fontSize: '20px', verticalAlign: 'middle' }}></i>
                    {successMsg}
                </div>
            )}

            {errorMsg && (
                <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    margin: '20px 0',
                    fontWeight: '500'
                }}>
                    <i className='bx bx-error-circle' style={{ marginRight: '8px', fontSize: '20px', verticalAlign: 'middle' }}></i>
                    {errorMsg}
                </div>
            )}

            <div className="addListingForm_form">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <hr className="form_hr" />
                    <div className="business_info_div business_details">
                        <h3>Campaign & Business Info</h3>
                        <div className="form_input_fields">
                            <div className="input_data">
                                <label htmlFor="name">Campaign / Business Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Acme Electronics Summer Sale"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="form_hr" />
                    <div className="business_contactdet">
                        <h3>Contact Information</h3>
                        <div className="form_input_fields">
                            <div className="input_data">
                                <label htmlFor="contact_email">Contact Email *</label>
                                <input
                                    type="email"
                                    name="contact_email"
                                    value={formData.contact_email}
                                    onChange={handleChange}
                                    placeholder="contact@business.com"
                                    required
                                />
                            </div>
                            <div className="input_data">
                                <label htmlFor="contact_number">Contact Phone Number *</label>
                                <input
                                    type="text"
                                    name="contact_number"
                                    value={formData.contact_number}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="form_hr" />
                    <div className="business_categories">
                        <h3>Ad Type & Placement Zone</h3>
                        <div className="form_input_fields" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            <div className="input_data">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ad Format *</label>
                                <Select
                                    options={adTypeOptions}
                                    value={formData.ad_type}
                                    onChange={(opt) => setFormData(prev => ({ ...prev, ad_type: opt }))}
                                    name='ad_type'
                                />
                            </div>

                            <div className="input_data">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Target Placement Zone *</label>
                                <Select
                                    options={targetPageOptions}
                                    value={formData.target_page}
                                    onChange={(opt) => setFormData(prev => ({ ...prev, target_page: opt }))}
                                    name='target_page'
                                />
                            </div>

                            <div className="input_data">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Package Plan *</label>
                                <Select
                                    options={packageOptions}
                                    value={formData.package}
                                    onChange={(opt) => setFormData(prev => ({ ...prev, package: opt }))}
                                    name='package'
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="form_hr" />
                    <div className="business_contactdet">
                        <h3>Scheduling & Duration (Optional)</h3>
                        <div className="form_input_fields">
                            <div className="input_data">
                                <label htmlFor="start_date">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input_data">
                                <label htmlFor="end_date">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="form_hr" />
                    <div className="business_imgs">
                        <h3>Ad Creative Media</h3>
                        <div className="form_input_fields">
                            <div className="input_data">
                                <label htmlFor="ad_image">Upload Banner / Creative Image (Max 5MB) *</label>
                                <input
                                    type="file"
                                    name="ad_image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="submit_form" style={{ marginTop: '30px' }}>
                        <input
                            type="submit"
                            value={submitting ? "Submitting Request..." : "Submit Advertisement Request"}
                            disabled={submitting}
                            style={{ cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddAdvertiseForm;
