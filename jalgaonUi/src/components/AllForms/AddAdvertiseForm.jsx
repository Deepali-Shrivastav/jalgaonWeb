import React, { useState, useContext, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import './AddListingForm.css';
import { UserContext } from '../../context/UserContext';
const adTypeOptions = [
    { value: 'BA', label: 'Banner Ads' },
    { value: 'CA', label: 'Carousel Ads' }
];
function AddAdvertiseForm() {
    const djangoApi = import.meta.env.VITE_DJANGO_API;

    const apiUrl = `${import.meta.env.VITE_DJANGO_API}/api/v1/ads/submit/`;
    const { user } = useContext(UserContext);

    const getCsrfToken = async () => {
        try {
          const response = await axios.get(`${djangoApi}/api/v1/auth/csrf-token/`);
          return response.data.csrfToken;
        } catch (error) {
          console.error('Error fetching CSRF token:', error);
          return '';
        }
      };

    const [formData, setFormData] = useState({
        user: user ? user.id : null,
        name: '',
        contact_number: '',
        contact_email: '',
        ad_type: adTypeOptions[0],  // default to Banner Ads
        ad_image: null,
    });


    useEffect(()=>{
        
    },[])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, ad_image: e.target.files[0] });
        // setFormData({ ...formData, ['user']: user.id });

    };

    const handleSelectChange = (selectedOption) => {
        setFormData({ ...formData, ad_type: selectedOption });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        const token = localStorage.getItem('tokenKey');
        const csrfToken = await getCsrfToken();

        // setFormData({ ...formData, ['user']: user.id });


        const data = new FormData();
        data.append('user', formData.user);
        data.append('name', formData.name);
        data.append('contact_number', formData.contact_number);
        data.append('contact_email', formData.contact_email);
        data.append('ad_type', formData.ad_type.value);
        data.append('ad_image', formData.ad_image);

        try {
            const response = await axios.post(
                apiUrl,
                data,               
                {
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Token ${token}`,  // Replace with actual token
                    },
                }
            );
            console.log('Success:', response.data);
            alert("Form Submitted")

        } catch (error) {
            console.error('Error:', error.response);
            alert("Something went wrong")

        }
    };

    return (
        <div className="addListingForm_section">
            <div className="addListingForm_heading">
                <h1>List your business to Jalgaon.Com</h1>
            </div>
            <div className="addListingForm_form">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <hr className="form_hr" />
                    <div className="business_info_div business_details">
                        <h3>Add Business Details</h3>
                        <div className="form_input_fields">
                            <div className="input_data">
                                <label htmlFor="businessName">Business Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <hr className="form_hr" />
                    <div className="business_contactdet">
                        <h3>Add Business Contact Info</h3>
                        <div className="form_input_fields">
                            <div className="input_data">
                                <label htmlFor="conEmail">Contact Email</label>
                                <input
                                    type="text"
                                    name="contact_email"
                                    onChange={handleChange}
                                    placeholder="Contact Email"
                                    required
                                />
                            </div>
                            <div className="input_data">
                                <label htmlFor="conPhone">Phone Number</label>
                                <input
                                    type="text"
                                    name="contact_number"
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <hr className="form_hr" />
                    <div className="business_categories">
                        <h3>Advertise Type</h3>
                        <div className="form_input_fields">
                            <div className="business_mainCategory">
                                <Select
                                    options={adTypeOptions}
                                    onChange={handleSelectChange}
                                    placeholder="Select a main category..."
                                    isSearchable={true}
                                    name='ad_type'
                                />
                            </div>
                        </div>
                    </div>
                    <hr className="form_hr" />
                    <div className="business_imgs">
                        <h3>Advertise Image</h3>
                        <div className="form_input_fields">
                            <div className="input_data">
                                <label htmlFor="banner">Advertise Media</label>
                                <input
                                    type="file"
                                    name="ad_image"
                                    onChange={handleFileChange}
                                    required 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="submit_form">
                        <input type="submit" value="Submit Form" />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddAdvertiseForm;
