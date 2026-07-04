import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import './SubmitEventPage.css';

const SubmitEventPage = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const navigate = useNavigate();
    const { isLogin, loading: authLoading } = useContext(UserContext);

    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        title: '',
        short_description: '',
        description: '',
        category: '',
        start_datetime: '',
        end_datetime: '',
        venue_name: '',
        venue_address: '',
        venue_lat: '',
        venue_lng: '',
        maps_url: '',
        organizer_name: '',
        organizer_contact: '',
        registration_link: ''
    });

    const [imageFile, setImageFile] = useState(null);

    // Auth Guard
    useEffect(() => {
        if (!authLoading && !isLogin) {
            navigate('/account');
        }
    }, [isLogin, authLoading, navigate]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${djangoApi}/api/v1/events/categories/`);
                setCategories(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, [djangoApi]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setFieldErrors(prev => ({ ...prev, featured_image: 'File size must not exceed 5MB' }));
                return;
            }
            setImageFile(file);
            setFieldErrors(prev => ({ ...prev, featured_image: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');
        setFieldErrors({});

        const token = localStorage.getItem('token');
        const data = new FormData();

        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                data.append(key, formData[key]);
            }
        });

        if (imageFile) {
            data.append('featured_image', imageFile);
        }

        try {
            await axios.post(`${djangoApi}/api/v1/events/submit/`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccessMsg("Event submitted successfully! Your event is pending admin review and will go live once approved.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setFormData({
                title: '', short_description: '', description: '', category: '',
                start_datetime: '', end_datetime: '', venue_name: '', venue_address: '',
                venue_lat: '', venue_lng: '', maps_url: '', organizer_name: '',
                organizer_contact: '', registration_link: ''
            });
            setImageFile(null);
        } catch (error) {
            console.error("Error submitting event:", error);
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'object') {
                    setFieldErrors(error.response.data);
                }
                setErrorMsg(error.response.data.detail || "Failed to submit event. Please check the form errors.");
            } else {
                setErrorMsg("An unexpected error occurred. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="submit-event-page-wrapper">
            <Navbar />

            <main className="submit-event-container">
                <div className="form-header">
                    <h1>Submit an Event</h1>
                    <p>Host an event in Jalgaon? List it for free to reach thousands of local residents.</p>
                </div>

                {successMsg && (
                    <div className="alert alert-success">
                        <i className='bx bx-check-circle' style={{ fontSize: '1.5rem' }}></i>
                        <div>
                            <strong>Submission Received!</strong>
                            <p>{successMsg}</p>
                            <Link to="/events" className="alert-link">Return to Events Index →</Link>
                        </div>
                    </div>
                )}

                {errorMsg && (
                    <div className="alert alert-danger">
                        <i className='bx bx-error-circle' style={{ fontSize: '1.5rem' }}></i>
                        <div>
                            <strong>Submission Error</strong>
                            <p>{errorMsg}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="submit-event-form">
                    {/* Section 1: Event Info */}
                    <div className="form-section">
                        <h2>1. Event Details</h2>

                        <div className="form-group">
                            <label>Event Title <span className="req">*</span></label>
                            <input 
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g. Jalgaon Annual Music Fest 2026"
                                required
                            />
                            {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Category</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Category (Optional)</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Featured Banner Image (Max 5MB)</label>
                                <input 
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleFileChange}
                                />
                                {fieldErrors.featured_image && <span className="field-error">{fieldErrors.featured_image}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Short Description (Card Summary) <span className="req">*</span></label>
                            <input 
                                type="text"
                                name="short_description"
                                maxLength={300}
                                value={formData.short_description}
                                onChange={handleInputChange}
                                placeholder="A brief 1-2 sentence summary shown on event cards."
                                required
                            />
                            <span className="char-count">{formData.short_description.length}/300</span>
                            {fieldErrors.short_description && <span className="field-error">{fieldErrors.short_description}</span>}
                        </div>

                        <div className="form-group">
                            <label>Full Description <span className="req">*</span></label>
                            <textarea 
                                name="description"
                                rows={6}
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Detailed event schedule, rules, highlights, speakers, etc."
                                required
                            />
                            {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
                        </div>
                    </div>

                    {/* Section 2: Schedule */}
                    <div className="form-section">
                        <h2>2. Schedule</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date & Time <span className="req">*</span></label>
                                <input 
                                    type="datetime-local"
                                    name="start_datetime"
                                    value={formData.start_datetime}
                                    onChange={handleInputChange}
                                    required
                                />
                                {fieldErrors.start_datetime && <span className="field-error">{fieldErrors.start_datetime}</span>}
                            </div>

                            <div className="form-group">
                                <label>End Date & Time (Optional)</label>
                                <input 
                                    type="datetime-local"
                                    name="end_datetime"
                                    value={formData.end_datetime}
                                    onChange={handleInputChange}
                                />
                                {fieldErrors.end_datetime && <span className="field-error">{fieldErrors.end_datetime}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Venue */}
                    <div className="form-section">
                        <h2>3. Venue & Location</h2>

                        <div className="form-group">
                            <label>Venue Name <span className="req">*</span></label>
                            <input 
                                type="text"
                                name="venue_name"
                                value={formData.venue_name}
                                onChange={handleInputChange}
                                placeholder="e.g. MJ College Ground, Kantara Hall, Town Hall"
                                required
                            />
                            {fieldErrors.venue_name && <span className="field-error">{fieldErrors.venue_name}</span>}
                        </div>

                        <div className="form-group">
                            <label>Full Venue Address <span className="req">*</span></label>
                            <textarea 
                                name="venue_address"
                                rows={3}
                                value={formData.venue_address}
                                onChange={handleInputChange}
                                placeholder="Street address, landmark, area in Jalgaon"
                                required
                            />
                            {fieldErrors.venue_address && <span className="field-error">{fieldErrors.venue_address}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Latitude (Optional, for Google Map)</label>
                                <input 
                                    type="number"
                                    step="any"
                                    name="venue_lat"
                                    value={formData.venue_lat}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 21.0077"
                                />
                            </div>
                            <div className="form-group">
                                <label>Longitude (Optional, for Google Map)</label>
                                <input 
                                    type="number"
                                    step="any"
                                    name="venue_lng"
                                    value={formData.venue_lng}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 75.5626"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Google Maps Link (Optional)</label>
                            <input 
                                type="url"
                                name="maps_url"
                                value={formData.maps_url}
                                onChange={handleInputChange}
                                placeholder="https://maps.google.com/?q=..."
                            />
                        </div>
                    </div>

                    {/* Section 4: Organizer */}
                    <div className="form-section">
                        <h2>4. Organizer & Registration</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Organizer Name <span className="req">*</span></label>
                                <input 
                                    type="text"
                                    name="organizer_name"
                                    value={formData.organizer_name}
                                    onChange={handleInputChange}
                                    placeholder="Company, NGO, or Individual name"
                                    required
                                />
                                {fieldErrors.organizer_name && <span className="field-error">{fieldErrors.organizer_name}</span>}
                            </div>

                            <div className="form-group">
                                <label>Organizer Contact (Phone / Email)</label>
                                <input 
                                    type="text"
                                    name="organizer_contact"
                                    value={formData.organizer_contact}
                                    onChange={handleInputChange}
                                    placeholder="+91 98765 43210 or info@org.com"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Registration Link / RSVP URL (Optional)</label>
                            <input 
                                type="url"
                                name="registration_link"
                                value={formData.registration_link}
                                onChange={handleInputChange}
                                placeholder="https://jalgaon.com/register/event-name"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-form-btn"
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Event for Review'}
                        </button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
};

export default SubmitEventPage;
