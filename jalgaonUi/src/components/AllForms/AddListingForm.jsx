import React, { useEffect, useState, useContext } from 'react';
import Select from 'react-select';
import axios from 'axios';
import './AddListingForm.css';
import { UserContext } from '../../context/UserContext';
import { useParams } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

function AddListingForm({ is_edit = false }) {
    const { shopId } = useParams();
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const apiUrl = `${djangoApi}/api/v1/listings/categories/`;
    const apiUrl_subCategory = `${djangoApi}/api/v1/listings/subcategories/`;
    const apiUrl_editShop = `${djangoApi}/api/v1/listings/edit-data/`;

    const { user } = useContext(UserContext);
    const [selectedMainCategory, setSelectedMainCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        user: user?.id || null,
        main_category: null,
        sub_category: null,
        business_name: '',
        business_rating: 0,
        business_address: '',
        business_banner: null,
        sub_domain_one: '',
        sub_domain_two: '',
        sub_domain_three: '',
        sub_domain_four: '',
        sub_domain_five: '',
        sub_domain_six: '',
        sub_domain_seven: '',
        business_origin: 'India',
        business_dob: 'N/A',
        business_gst: 'N/A',
        business_description: '',
        business_img_one: null,
        business_img_two: null,
        business_img_three: null,
        business_no: '',
        business_email: '',
        insta_link: '',
        facebook_link: '',
        website_link: '',
        gmap_link: ''
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
        const fetchData = async () => {
            try {
                const response = await axios.get(apiUrl);
                const categories = response.data.categories;
                const categoryOptions = categories.map(category => ({
                    value: category.main_category.toLowerCase().replace(/\s+/g, '_'),
                    label: category.main_category,
                    mainCategoryId: category.id
                }));
                setMainCategories(categoryOptions);

                const sub_response = await axios.get(apiUrl_subCategory);
                const sub_categories = sub_response.data.categories;
                const subCategoryOptions = sub_categories.map(category => ({
                    value: category.sub_category.toLowerCase().replace(/\s+/g, '_'),
                    label: category.sub_category,
                    main_category: category.main_category,
                    subCategoryId: category.id
                }));
                setSubCategories(subCategoryOptions);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            }
        };

        fetchData();

        if (is_edit && shopId) {
            const getShopData = async () => {
                const csrfToken = await getCsrfToken();

                try {
                    const response = await axios.get(apiUrl_editShop, {
                        headers: {
                            'X-CSRFToken': csrfToken,
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                        params: {
                            shop_id: shopId,
                        },
                    });

                    setFormData(response.data);
                    console.log(response.data);
                    
                } catch (error) {
                    console.error('Error fetching shop data:', error.response ? error.response.data : error.message);
                }
            }
            getShopData();
        }
    }, [is_edit, shopId]);

    const handleMainCategoryChange = (selectedOption) => {
        setSelectedMainCategory(selectedOption.mainCategoryId);
        const filtered = subCategories.filter(category => category.main_category === selectedOption.label);
        setFilteredSubCategories(filtered);
        setFormData((prevFormData) => ({
            ...prevFormData,
            main_category: selectedOption.mainCategoryId
        }));
    };

    const handleSubChange = (selectedOption) => {
        setSelectedSubCategory(selectedOption.subCategoryId);
        setFormData((prevFormData) => ({
            ...prevFormData,
            sub_category: selectedOption.subCategoryId
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'file' ? files[0] : value
            
        }));
    };


    const handleFileChange = (e) => {
        const { type, files } = e.target;
    
        if (type === 'file' && files.length > 0) {
            const selectedFile = files[0];




            setFormData(prevData => ({
                ...prevData,
                business_banner: selectedFile,
                business_img_one: selectedFile,
                business_img_two: selectedFile,
                business_img_three: selectedFile,
            }));
        }
    };
    


    // const handleFileChange = async (e) => {
    //     const { type, files } = e.target;
    
    //     if (type === 'file' && files.length > 0) {
    //         const selectedFile = files[0];
    
    //         // Define compression options
    //         const options = {
    //             maxSizeMB: 0.17, // Compress to a maximum size of 170KB
    //             maxWidthOrHeight: 1920, // Optional: adjust based on your needs
    //             useWebWorker: true, // Use web worker for faster compression
    //         };


    //         try {
    //             // Compress the image
    //             const compressedFile = await imageCompression(selectedFile, options);
    //             console.log(compressedFile);
                
    //             // Update formData with the compressed file
    //             setFormData(prevData => ({
    //                 ...prevData,
    //                 business_banner: compressedFile,
    //                 business_img_one: compressedFile,
    //                 business_img_two: compressedFile,
    //                 business_img_three: compressedFile,
    //             }));
    //         } catch (error) {
    //             console.error("Error compressing the image:", error);
    //         }
    //     }
    // };

    const getUserLocation = (e) => {
        e.preventDefault();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                const locationUrlGmap = `https://www.google.com/maps/search/?api=1&query=${pos.lat},${pos.lng}`;
                setUserLocation(locationUrlGmap);
                setFormData(prevData => ({
                    ...prevData,
                    gmap_link: locationUrlGmap
                }));
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const csrfToken = await getCsrfToken();

        console.log(token);
        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }


        console.log(formData);
        // Log FormData to verify its contents
        for (let pair of data.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        console.log(data);


        try {
            const response = await axios.post(
                //   'http://127.0.0.1:8000/api/v1/listings/',
                `${djangoApi}/api/v1/listings/`,
                data,
                {
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,  // Replace with actual token
                    },
                }
            );
            console.log(response.data);
            alert("Form Submitted")
        } catch (error) {
            console.error('Error uploading data:', error);
        }


    };
    
    const updateShopListing = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        console.log('Token:', token);
    
        const data = new FormData();
        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                data.append(key, formData[key]);
            }
        }
        console.log("FormData entries:");
        for (let pair of data.entries()) {
            console.log(pair[0]+ ', '+ pair[1]); 
        }
        try {
            const response = await axios.put(
                `${djangoApi}/api/v1/listings/update/`,
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    },
                    params: {
                        shop_id: formData.id, // Ensure this is the correct ID of the shop to update
                    }
                }
            );
            console.log(response.data);
            alert("Data Updated");
        } catch (error) {
            console.error('Error submitting form:', error.response ? error.response.data : error.message);
        }
    };
    
    

    return (
        <div className="addListingForm_section">
            <div className="addListingForm_heading">
                <h1>List your business to Jalgaon.Com</h1>
            </div>
            <div className="addListingForm_form">
                {is_edit && shopId ? (                    
                    // for edit shop informtaion
                    <form onSubmit={updateShopListing} encType="multipart/form-data">
                        <hr className="form_hr" />
                        <div className="business_info_div business_details">
                            <h3>Add Business Details</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="businessName">Business Name</label>
                                    <input
                                        type="text"
                                        name="business_name"
                                        value={formData.business_name}
                                        onChange={handleChange}
                                        placeholder="Business Name"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="legalName">Legal Business Name</label>
                                    <input
                                        type="text"
                                        name="legalName"
                                        value=""
                                        // onChange={handleChange}
                                        placeholder="Legal Business Name"
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
                                        name="business_email"
                                        value={formData.business_email}
                                        onChange={handleChange}
                                        placeholder="Contact Email"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="conPhone">Phone Number</label>
                                    <input
                                        type="text"
                                        name="business_no"
                                        value={formData.business_no}
                                        onChange={handleChange}
                                        placeholder="Phone Number"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_categories">
                            <h3>Add Business Category</h3>
                            <div className="form_input_fields">
                                <div className="business_mainCategory">
                                    <Select
                                        options={mainCategories}
                                        onChange={handleMainCategoryChange}
                                        placeholder="Select a main category..."
                                        isSearchable={true}
                                    />
                                </div>
                                <div className="business_subCategory">
                                    <Select
                                        options={filteredSubCategories}
                                        onChange={handleSubChange}
                                        placeholder="Select a sub category..."
                                        isSearchable={true}
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_description">
                            <h3>Add Business Description</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="businessDesc">Description</label>
                                    <textarea
                                        name="business_description"
                                        value={formData.business_description}
                                        onChange={handleChange}
                                        placeholder="Business Description"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_subDomains">
                            <h3>Business Sub-Domains</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="domainOne">Sub-Domains</label>
                                    <input
                                        type="text"
                                        name="sub_domain_one"
                                        value={formData.sub_domain_one}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 1"
                                    />
                                    <input
                                        type="text"
                                        name="sub_domain_two"
                                        value={formData.sub_domain_two}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 2"
                                    />
                                    <input
                                        type="text"
                                        name="sub_domain_three"
                                        value={formData.sub_domain_three}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 3"
                                    />
                                    <input
                                        type="text"
                                        name="sub_domain_four"
                                        value={formData.sub_domain_four}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 4"
                                    />
                                    <input
                                        type="text"
                                        name="sub_domain_five"
                                        value={formData.sub_domain_five}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 5"
                                    />
                                    <input
                                        type="text"
                                        name="sub_domain_six"
                                        value={formData.sub_domain_six}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 6"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_profile">
                            <h3>Business Profile</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="businessOrigin">Country of Origin</label>
                                    <input
                                        type="text"
                                        name="business_origin"
                                        value={formData.business_origin}
                                        onChange={handleChange}
                                        placeholder="Country of Origin"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="businessEstab">Year of Establishment</label>
                                    <input
                                        type="text"
                                        name="business_dob"
                                        value={formData.business_dob}
                                        onChange={handleChange}
                                        placeholder="Year of Establishment"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="businessGst">GST Number</label>
                                    <input
                                        type="text"
                                        name="business_gst"
                                        value={formData.business_gst}
                                        onChange={handleChange}
                                        placeholder="GST Number"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_socialLinks">
                            <h3>Social Media</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="business_ig">Instagram</label>
                                    <input
                                        type="text"
                                        name="insta_link"
                                        value={formData.insta_link}
                                        onChange={handleChange}
                                        placeholder="Instagram"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="business_fb">Facebook</label>
                                    <input
                                        type="text"
                                        name="facebook_link"
                                        value={formData.facebook_link}
                                        onChange={handleChange}
                                        placeholder="Facebook"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="business_web">Website</label>
                                    <input
                                        type="text"
                                        name="website_link"
                                        value={formData.website_link}
                                        onChange={handleChange}
                                        placeholder="Website"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_imgs">
                            <h3>Business Media</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="banner">Business Banner</label>
                                    <input
                                        type="file"
                                        name="business_banner"
                                        // onChange={(e)=>{
                                        //     setBusinessBanner(e.target.files[0])
                                        //     setFormData(prevData => ({
                                        //         ...prevData,
                                        //         ["business_banner"]: busniessBanner
                                        //     }));
                                        // }}
                                        onChange={handleFileChange}
                                        required
                                    />
                                </div>
                                {/* <div className="input_data">
                                    <label htmlFor="imgOne">Business Photos</label>
                                    <input
                                        type="file"
                                        name="business_img_one"
                                        // onChange={(e)=>{setBusinessImgOne(e.target.files[0])}}
                                        onChange={handleChange}
                                        // required
                                    />
                                    <input
                                        type="file"
                                        name="business_img_two"
                                        // onChange={(e)=>{setBusinessImgTwo(e.target.files[0])}}
                                        onChange={handleChange}
                                        // required
                                    />
                                    <input
                                        type="file"
                                        name="business_img_three"
                                        // onChange={(e)=>{setBusinessImgThree(e.target.files[0])}}
                                        onChange={handleChange}
                                        // required
                                    />
                                </div> */}
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_address">
                            <h3>Add Business Address</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="businessAddrss">Business Address</label>
                                    <div className="get_location">
                                        <div onClick={getUserLocation}>
                                            <i className='bx bxs-map'></i>
                                            <p>Get Current Location</p>
                                        </div>
                                        {userLocation && (
                                            <a href={userLocation} target='_blank' rel="noopener noreferrer">
                                                View on Google Maps
                                            </a>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        name="business_address"
                                        value={formData.business_address}
                                        onChange={handleChange}
                                        placeholder='Address'
                                    />
                                    <input
                                        type="hidden"
                                        name="gmap_link"
                                    value={formData.gmap_link}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="submit_form">
                            <input type="submit" value="Submit Form" />
                        </div>
                    </form>
                ) : (
                    // for store shop informtaion
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <hr className="form_hr" />
                        <div className="business_info_div business_details">
                            <h3>Add Business Details</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="businessName">Business Name</label>
                                    <input
                                        type="text"
                                        name="business_name"
                                        // value={formData.business_name}
                                        onChange={handleChange}
                                        placeholder="Business Name"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="legalName">Legal Business Name</label>
                                    <input
                                        type="text"
                                        name="legalName"
                                        // value=""
                                        // onChange={handleChange}
                                        placeholder="Legal Business Name"
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
                                        name="business_email"
                                        // value={formData.business_email}
                                        onChange={handleChange}
                                        placeholder="Contact Email"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="conPhone">Phone Number</label>
                                    <input
                                        type="text"
                                        name="business_no"
                                        // value={formData.business_no}
                                        onChange={handleChange}
                                        placeholder="Phone Number"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_categories">
                            <h3>Add Business Category</h3>
                            <div className="form_input_fields">
                                <div className="business_mainCategory">
                                    <Select
                                        options={mainCategories}
                                        onChange={handleMainCategoryChange}
                                        placeholder="Select a main category..."
                                        isSearchable={true}
                                    />
                                </div>
                                <div className="business_subCategory">
                                    <Select
                                        options={filteredSubCategories}
                                        onChange={handleSubChange}
                                        placeholder="Select a sub category..."
                                        isSearchable={true}
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_description">
                            <h3>Add Business Description</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="businessDesc">Description</label>
                                    <textarea
                                        name="business_description"
                                        // value={formData.business_description}
                                        onChange={handleChange}
                                        placeholder="Business Description"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_subDomains">
                            <h3>Business Sub-Domains</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="domainOne">Sub-Domains</label>
                                    <input
                                        type="text"
                                        name="sub_domain_one"
                                        // value={formData.sub_domain_one}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 1"
                                    />
                                    <input
                                        type="text"
                                        name="sub_domain_two"
                                        // value={formData.sub_domain_two}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 2"
                                    />
                                    <input
                                        type="text"
                                        name="sub_domain_three"
                                        // value={formData.sub_domain_three}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 3"
                                    />
                                    <input
                                        type="text"
                                        name="sub_domain_four"
                                        // value={formData.sub_domain_four}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 4"
                                    />
                                    <input
                                        type="text"
                                        name="sub_domain_five"
                                        // value={formData.sub_domain_five}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 5"
                                    />
                                    <input
                                        type="text"
                                        name="sub_domain_six"
                                        // value={formData.sub_domain_six}
                                        onChange={handleChange}
                                        placeholder="Sub-domain 6"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_profile">
                            <h3>Business Profile</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="businessOrigin">Country of Origin</label>
                                    <input
                                        type="text"
                                        name="business_origin"
                                        // value={formData.business_origin}
                                        onChange={handleChange}
                                        placeholder="Country of Origin"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="businessEstab">Year of Establishment</label>
                                    <input
                                        type="text"
                                        name="business_dob"
                                        // value={formData.business_dob}
                                        onChange={handleChange}
                                        placeholder="Year of Establishment"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="businessGst">GST Number</label>
                                    <input
                                        type="text"
                                        name="business_gst"
                                        // value={formData.business_gst}
                                        onChange={handleChange}
                                        placeholder="GST Number"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_socialLinks">
                            <h3>Social Media</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="business_ig">Instagram</label>
                                    <input
                                        type="text"
                                        name="insta_link"
                                        // value={formData.insta_link}
                                        onChange={handleChange}
                                        placeholder="Instagram"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="business_fb">Facebook</label>
                                    <input
                                        type="text"
                                        name="facebook_link"
                                        // value={formData.facebook_link}
                                        onChange={handleChange}
                                        placeholder="Facebook"
                                    />
                                </div>
                                <div className="input_data">
                                    <label htmlFor="business_web">Website</label>
                                    <input
                                        type="text"
                                        name="website_link"
                                        // value={formData.website_link}
                                        onChange={handleChange}
                                        placeholder="Website"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_imgs">
                            <h3>Business Media</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="banner">Business Banner</label>
                                    <input
                                        type="file"
                                        name="business_banner"
                                        // onChange={(e)=>{
                                        //     setBusinessBanner(e.target.files[0])
                                        //     setFormData(prevData => ({
                                        //         ...prevData,
                                        //         ["business_banner"]: busniessBanner
                                        //     }));
                                        // }}
                                        onChange={handleFileChange}
                                    />
                                </div>
                                {/* <div className="input_data">
                                    <label htmlFor="imgOne">Business Photos</label>
                                    <input
                                        type="file"
                                        name="business_img_one"
                                        // onChange={(e)=>{setBusinessImgOne(e.target.files[0])}}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="file"
                                        name="business_img_two"
                                        // onChange={(e)=>{setBusinessImgTwo(e.target.files[0])}}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="file"
                                        name="business_img_three"
                                        // onChange={(e)=>{setBusinessImgThree(e.target.files[0])}}
                                        onChange={handleChange}
                                    />
                                </div> */}
                            </div>
                        </div>
                        <hr className="form_hr" />
                        <div className="business_address">
                            <h3>Add Business Address</h3>
                            <div className="form_input_fields">
                                <div className="input_data">
                                    <label htmlFor="businessAddrss">Business Address</label>
                                    <div className="get_location">
                                        <div onClick={getUserLocation}>
                                            <i className='bx bxs-map'></i>
                                            <p>Get Current Location</p>
                                        </div>
                                        {userLocation && (
                                            <a href={userLocation} target='_blank' rel="noopener noreferrer">
                                                View on Google Maps
                                            </a>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        name="business_address"
                                        // value={formData.business_address}
                                        onChange={handleChange}
                                        placeholder='Address'
                                    />
                                    <input
                                        type="hidden"
                                        name="gmap_link"
                                    // value={formData.gmap_link}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="submit_form">
                            <input type="submit" value="Submit Form" />
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default AddListingForm;
