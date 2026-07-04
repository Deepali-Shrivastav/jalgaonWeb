import React, { useEffect, useState, useContext } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddListingForm.css';
import { UserContext } from '../../context/UserContext';

function AddListingForm() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const djangoApi = import.meta.env.VITE_DJANGO_API;

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);

    const [formData, setFormData] = useState({
        business_name: '',
        main_category: null,
        sub_category: null,
        business_email: '',
        business_no: '',
        whatsapp: '',
        city: 'Jalgaon',
        business_address: '',
        gmap_link: '',
        business_description: '',
        business_dob: '',
        business_gst: '',
        website_link: '',
        insta_link: '',
        facebook_link: '',
        business_banner: null
    });

    const getCsrfToken = async () => {
        try {
            const response = await axios.get(`${djangoApi}/api/v1/auth/csrf-token/`);
            return response.data.csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            return '';
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const resMain = await axios.get(`${djangoApi}/api/v1/listings/categories/`);
                
                const mainOpts = resMain.data.results || resMain.data;
                setMainCategories(mainOpts.map(c => ({ value: c.id, label: c.main_category })));
                
                // Extract subcategories from main categories
                const allSubs = [];
                mainOpts.forEach(mainCat => {
                    if (mainCat.subcategories) {
                        mainCat.subcategories.forEach(sub => {
                            allSubs.push({ ...sub, main_category_id: mainCat.id });
                        });
                    }
                });
                setSubCategories(allSubs);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, [djangoApi]);

    const handleMainCategoryChange = (selected) => {
        setFormData({ ...formData, main_category: selected.value, sub_category: null });
        const subs = subCategories.filter(s => s.main_category === selected.label || s.main_category_id === selected.value);
        setFilteredSubCategories(subs.map(s => ({ value: s.id, label: s.sub_category })));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFormData({ ...formData, business_banner: e.target.files[0] });
        }
    };

    const getUserLocation = (e) => {
        e.preventDefault();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                const link = `https://www.google.com/maps/search/?api=1&query=${pos.coords.latitude},${pos.coords.longitude}`;
                setFormData({ ...formData, gmap_link: link });
            });
        }
    };

    const validateStep = (step) => {
        if (step === 1) {
            if (!formData.business_name || !formData.main_category || !formData.sub_category || !formData.business_no) {
                alert("Please fill all required fields (Business Name, Main Category, Sub Category, Contact Number).");
                return false;
            }
        } else if (step === 2) {
            if (!formData.business_address) {
                alert("Please enter the full address.");
                return false;
            }
        } else if (step === 3) {
            if (!formData.business_description) {
                alert("Please provide a business description.");
                return false;
            }
        } else if (step === 5) {
            if (!formData.business_banner) {
                alert("Please upload a cover image.");
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };
    
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateStep(5)) {
            return;
        }
        
        const token = localStorage.getItem('token');
        const csrf = await getCsrfToken();
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });

        try {
            await axios.post(`${djangoApi}/api/v1/listings/create/`, data, {
                headers: {
                    'X-CSRFToken': csrf,
                    'Authorization': `Bearer ${token}`
                }
            });
            alert('Listing submitted successfully! It is now pending review.');
            navigate('/account');
        } catch (error) {
            console.error(error);
            alert('Failed to submit listing. Please check required fields.');
        }
    };

    return (
        <div className="addListingForm_section">
            <div className="wizard_header">
                <h1>List Your Business</h1>
                <p>Reach thousands of customers in Jalgaon</p>
            </div>

            <div className="progress_bar">
                {[1, 2, 3, 4, 5].map(step => (
                    <div key={step} className={`step_indicator ${currentStep === step ? 'active' : currentStep > step ? 'completed' : ''}`}>
                        {currentStep > step ? '✓' : step}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {currentStep === 1 && (
                    <div className="wizard_step_content">
                        <h3>1. Basic Information</h3>
                        <div className="form_grid">
                            <div className="input_group full_width">
                                <label>Business Name *</label>
                                <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} required placeholder="E.g. Royal Cafe" />
                            </div>
                            <div className="input_group">
                                <label>Main Category *</label>
                                <Select options={mainCategories} onChange={handleMainCategoryChange} />
                            </div>
                            <div className="input_group">
                                <label>Sub Category *</label>
                                <Select options={filteredSubCategories} onChange={s => setFormData({...formData, sub_category: s.value})} />
                            </div>
                            <div className="input_group">
                                <label>Business Email</label>
                                <input type="email" name="business_email" value={formData.business_email} onChange={handleChange} placeholder="contact@example.com" />
                            </div>
                            <div className="input_group">
                                <label>Contact Number *</label>
                                <input type="text" name="business_no" value={formData.business_no} onChange={handleChange} required placeholder="9876543210" />
                            </div>
                            <div className="input_group">
                                <label>WhatsApp Number</label>
                                <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="9876543210" />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="wizard_step_content">
                        <h3>2. Location details</h3>
                        <div className="form_grid">
                            <div className="input_group">
                                <label>City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Jalgaon" />
                            </div>
                            <div className="input_group full_width">
                                <label>Full Address *</label>
                                <textarea name="business_address" value={formData.business_address} onChange={handleChange} required placeholder="Enter full address..."></textarea>
                            </div>
                            <div className="input_group full_width">
                                <label>Google Maps Link</label>
                                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                    <input type="text" name="gmap_link" value={formData.gmap_link} onChange={handleChange} style={{flex: 1}} placeholder="Paste URL here..." />
                                    <button type="button" className="location_btn" onClick={getUserLocation}>
                                        <i className='bx bx-target-lock'></i> Auto Detect
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="wizard_step_content">
                        <h3>3. About Business</h3>
                        <div className="form_grid">
                            <div className="input_group full_width">
                                <label>Business Description *</label>
                                <textarea name="business_description" value={formData.business_description} onChange={handleChange} required placeholder="Tell customers what you offer..."></textarea>
                            </div>
                            <div className="input_group">
                                <label>Year of Establishment</label>
                                <input type="text" name="business_dob" value={formData.business_dob} onChange={handleChange} placeholder="E.g. 2015" />
                            </div>
                            <div className="input_group">
                                <label>GST Number (Optional)</label>
                                <input type="text" name="business_gst" value={formData.business_gst} onChange={handleChange} placeholder="27XXXXX..." />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="wizard_step_content">
                        <h3>4. Web & Social Media</h3>
                        <div className="form_grid">
                            <div className="input_group full_width">
                                <label>Website URL</label>
                                <input type="url" name="website_link" value={formData.website_link} onChange={handleChange} placeholder="https://www.yourwebsite.com" />
                            </div>
                            <div className="input_group">
                                <label>Instagram Link</label>
                                <input type="url" name="insta_link" value={formData.insta_link} onChange={handleChange} placeholder="https://instagram.com/..." />
                            </div>
                            <div className="input_group">
                                <label>Facebook Link</label>
                                <input type="url" name="facebook_link" value={formData.facebook_link} onChange={handleChange} placeholder="https://facebook.com/..." />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 5 && (
                    <div className="wizard_step_content">
                        <h3>5. Media Gallery</h3>
                        <div className="form_grid">
                            <div className="input_group full_width">
                                <label>Business Cover/Banner Image *</label>
                                <div className="file_upload_wrapper" onClick={() => document.getElementById('banner_upload').click()}>
                                    <i className='bx bx-cloud-upload' style={{fontSize: '48px', color: '#0081C7'}}></i>
                                    <p style={{marginTop: '10px', color: '#64748b'}}>
                                        {formData.business_banner ? formData.business_banner.name : 'Click to browse and upload cover image'}
                                    </p>
                                    <input 
                                        type="file" 
                                        id="banner_upload" 
                                        onChange={handleFileChange} 
                                        style={{display: 'none'}} 
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="wizard_actions">
                    {currentStep > 1 ? (
                        <button type="button" className="btn_prev" onClick={prevStep}>Back</button>
                    ) : <div></div>}

                    {currentStep < totalSteps ? (
                        <button type="button" className="btn_next" onClick={nextStep}>Next Step</button>
                    ) : (
                        <button type="submit" className="btn_next">Submit Listing</button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default AddListingForm;
