'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthContext } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { getCurrentLocation, reverseGeocode, LocationDetails } from '@/utils/locationService';

// Dynamically import LocationMapPicker with SSR disabled to prevent window is not defined error for leaflet
const LocationMapPicker = dynamic(() => import('@/components/LocationMapPicker'), { ssr: false });

export default function AddListingClient() {
  const { isLogin, user } = useContext(AuthContext);
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    business_name: '',
    legal_name: '', // optional, won't map exactly to backend if not supported
    business_email: '',
    business_no: '',
    main_category: '',
    sub_category: '',
    business_description: '',
    sub_domain_one: '',
    sub_domain_two: '',
    sub_domain_three: '',
    sub_domain_four: '',
    country: 'India',
    business_dob: '',
    business_gst: '',
    insta_link: '',
    facebook_link: '',
    business_address: '',
    city: 'Jalgaon',
    lat: '',
    lng: ''
  });
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Location Picker State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/listings/categories/`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        } else {
          toast.error("Failed to load categories");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading categories");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.", { id: 'file-size-error' });
        e.target.value = '';
        setBannerFile(null);
        setErrors(prev => ({ ...prev, business_banner: 'Image size must be less than 2MB' }));
        return;
      }
      setBannerFile(file);
      if (errors.business_banner) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.business_banner;
          return next;
        });
      }
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLocating(true);
    const toastId = toast.loading("Detecting your location...", { id: 'location-toast' });
    try {
      const coords = await getCurrentLocation();
      const addressDetails = await reverseGeocode(coords.lat, coords.lng);
      
      setFormData(prev => ({
        ...prev,
        lat: coords.lat.toFixed(8),
        lng: coords.lng.toFixed(8),
        business_address: addressDetails.detailedAddress,
        city: addressDetails.city || prev.city
      }));
      
      if (errors.business_address) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.business_address;
          return next;
        });
      }
      
      toast.success("Location detected successfully!", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to get current location. Please check permissions.", { id: toastId });
    } finally {
      setIsLocating(false);
    }
  };

  const handleLocationConfirmed = (lat: number, lng: number, address: LocationDetails) => {
    setFormData(prev => ({
      ...prev,
      lat: lat.toFixed(8),
      lng: lng.toFixed(8),
      business_address: address.detailedAddress,
      city: address.city || prev.city
    }));
    
    if (errors.business_address) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.business_address;
        return next;
      });
    }
    
    setIsMapOpen(false);
  };

  const selectedMainCategory = categories.find(c => c.id.toString() === formData.main_category);
  const subCategories = selectedMainCategory ? selectedMainCategory.subcategories : [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.business_name || formData.business_name.trim().length < 3) {
      newErrors.business_name = "Business name must be at least 3 characters.";
    }
    if (formData.business_email && !/\S+@\S+\.\S+/.test(formData.business_email)) {
      newErrors.business_email = "Please enter a valid email address.";
    }
    if (!formData.business_no) {
      newErrors.business_no = "Phone number is required.";
    } else if (!/^[0-9]{10}$/.test(formData.business_no)) {
      newErrors.business_no = "Please enter a valid 10-digit phone number.";
    }
    if (!formData.main_category) {
      newErrors.main_category = "Please select a main category.";
    }
    if (!formData.sub_category) {
      newErrors.sub_category = "Please select a sub-category.";
    }
    if (!formData.business_description || formData.business_description.trim().length < 10) {
      newErrors.business_description = "Description must be at least 10 characters.";
    }
    if (!formData.business_address || formData.business_address.trim().length === 0) {
      newErrors.business_address = "Detailed address is required.";
    }
    if (!formData.lat || !formData.lng) {
      newErrors.business_address = "Please pick a location on the map or use your current location.";
    }
    // Optional fields format checks
    if (formData.business_gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.business_gst)) {
      newErrors.business_gst = "Please enter a valid 15-character GSTIN.";
    }
    if (formData.insta_link && !/^https?:\/\/.+/.test(formData.insta_link)) {
      newErrors.insta_link = "Please enter a valid URL starting with http:// or https://";
    }
    if (formData.facebook_link && !/^https?:\/\/.+/.test(formData.facebook_link)) {
      newErrors.facebook_link = "Please enter a valid URL starting with http:// or https://";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss();
    
    if (!isLogin) {
      toast.error("Please login to submit a business listing.", { id: 'auth-error' });
      return;
    }

    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      toast.error("Please fill all required fields correctly.", { id: 'validation-error' });
      
      // Scroll to first error field
      setTimeout(() => {
        const firstErrorKey = Object.keys(clientErrors)[0];
        const element = document.getElementsByName(firstErrorKey)[0];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 100);
      return;
    }

    setSubmitting(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem("token");

    const submitData = new FormData();
    // Append all string fields
    Object.keys(formData).forEach(key => {
      if (key !== 'legal_name' && key !== 'country' && formData[key as keyof typeof formData]) {
        submitData.append(key, formData[key as keyof typeof formData]);
      }
    });

    if (bannerFile) {
      submitData.append('business_banner', bannerFile);
    }

    try {
      const res = await fetch(`${baseUrl}/api/v1/listings/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (res.ok) {
        toast.success("Listing submitted successfully! Awaiting admin approval.", { id: 'submit-success' });
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const errorData = await res.json();
        console.log("Submission error:", errorData);
        const backendErrors: Record<string, string> = {};
        if (typeof errorData === 'object' && errorData !== null) {
          Object.entries(errorData).forEach(([key, val]) => {
            if (Array.isArray(val)) {
              backendErrors[key] = val.join(' ');
            } else if (typeof val === 'string') {
              backendErrors[key] = val;
            }
          });
        }
        setErrors(backendErrors);
        
        const errorFields = Object.keys(backendErrors).map(key => key.replace('_', ' ')).join(', ');
        if (errorFields) {
          toast.error(`Failed to submit listing. Errors in: ${errorFields}`, { id: 'backend-error' });
          setTimeout(() => {
            const firstErrorKey = Object.keys(backendErrors)[0];
            const element = document.getElementsByName(firstErrorKey)[0];
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.focus();
            }
          }, 100);
        } else {
          toast.error("Failed to submit listing. Please check required fields.", { id: 'backend-error' });
        }
      }
    } catch (err) {
      console.warn("Exception during submission:", err);
      toast.error("An error occurred during submission.", { id: 'submit-exception' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="py-xxxl mb-12 px-base md:px-xxl max-w-container-max mx-auto bg-surface">
        {/* Hero Section */}
        <section className="text-center mb-xxl mt-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-sm">List your business to Jalgaon.com</h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Join Jalgaon&apos;s most comprehensive business directory and connect with thousands of local customers daily. Fast, reliable, and effective.
          </p>
        </section>

        {/* Form Container */}
        <div className="bg-surface-container-lowest rounded-[32px] p-base md:p-xxxl shadow-lg border border-hairline-soft">
          <form className="space-y-xxl" id="businessForm" onSubmit={handleSubmit} noValidate>
            
            {/* Business Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
              <div className="md:col-span-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined">store</span>
                  Business Details
                </h2>
                <p className="text-sm text-secondary mt-xs">The primary identity of your enterprise as it will appear to customers.</p>
              </div>
              <div className="md:col-span-8 grid grid-cols-1 gap-md">
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs transition-colors group-focus-within:text-primary">
                    Business Name *
                  </label>
                  <input
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className={`w-full bg-white border rounded-lg p-3 focus:ring-2 outline-none transition-all ${
                      errors.business_name
                        ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                        : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="e.g. Jalgaon Tech Solutions"
                    type="text"
                  />
                  {errors.business_name && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.business_name}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs transition-colors group-focus-within:text-primary">
                    Legal Business Name
                  </label>
                  <input
                    name="legal_name"
                    value={formData.legal_name}
                    onChange={handleInputChange}
                    className={`w-full bg-white border rounded-lg p-3 focus:ring-2 outline-none transition-all ${
                      errors.legal_name
                        ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                        : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="Registered Enterprise Name"
                    type="text"
                  />
                  {errors.legal_name && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.legal_name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent my-xl"></div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
              <div className="md:col-span-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined">contact_phone</span>
                  Contact Info
                </h2>
                <p className="text-sm text-secondary mt-xs">How potential clients and the directory administration can reach you.</p>
              </div>
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Contact Email</label>
                  <input
                    name="business_email"
                    value={formData.business_email}
                    onChange={handleInputChange}
                    className={`w-full bg-white border rounded-lg p-3 focus:ring-2 outline-none transition-all ${
                      errors.business_email
                        ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                        : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="contact@business.com"
                    type="email"
                  />
                  {errors.business_email && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.business_email}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Phone Number *</label>
                  <input
                    name="business_no"
                    value={formData.business_no}
                    onChange={handleInputChange}
                    className={`w-full bg-white border rounded-lg p-3 focus:ring-2 outline-none transition-all ${
                      errors.business_no
                        ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                        : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="9876543210"
                    type="tel"
                  />
                  {errors.business_no && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.business_no}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent my-xl"></div>

            {/* Category & Description */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
              <div className="md:col-span-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined">category</span>
                  Classification
                </h2>
                <p className="text-sm text-secondary mt-xs">Proper categorization ensures you appear in the right search results.</p>
              </div>
              <div className="md:col-span-8 space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="group">
                    <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Main Category *</label>
                    <select
                      name="main_category"
                      value={formData.main_category}
                      onChange={handleInputChange}
                      className={`w-full bg-white border rounded-lg p-3 focus:ring-2 outline-none transition-all text-on-surface-variant ${
                        errors.main_category
                          ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                          : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                      }`}
                    >
                      <option disabled value="">Select a main category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.main_category}</option>
                      ))}
                    </select>
                    {errors.main_category && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.main_category}</p>
                    )}
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Sub-category *</label>
                    <select
                      name="sub_category"
                      value={formData.sub_category}
                      onChange={handleInputChange}
                      className={`w-full bg-white border rounded-lg p-3 focus:ring-2 outline-none transition-all text-on-surface-variant ${
                        errors.sub_category
                          ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                          : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                      }`}
                      disabled={!formData.main_category}
                    >
                      <option disabled value="">Select a sub category...</option>
                      {subCategories.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>{sub.sub_category}</option>
                      ))}
                    </select>
                    {errors.sub_category && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.sub_category}</p>
                    )}
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Description *</label>
                  <textarea
                    name="business_description"
                    value={formData.business_description}
                    onChange={handleInputChange}
                    className={`w-full bg-white border rounded-lg p-3 focus:ring-2 outline-none transition-all ${
                      errors.business_description
                        ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                        : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="Tell us about your business, your mission, and what sets you apart..."
                    rows={4}
                  ></textarea>
                  {errors.business_description && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.business_description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent my-xl"></div>

            {/* Sub-Domains */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
              <div className="md:col-span-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined">public</span>
                  Sub-Domains
                </h2>
                <p className="text-sm text-secondary mt-xs">Additional digital footprints or branch-specific URLs.</p>
              </div>
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-sm">
                <input name="sub_domain_one" value={formData.sub_domain_one} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Sub-domain 1" type="text"/>
                <input name="sub_domain_two" value={formData.sub_domain_two} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Sub-domain 2" type="text"/>
                <input name="sub_domain_three" value={formData.sub_domain_three} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Sub-domain 3" type="text"/>
                <input name="sub_domain_four" value={formData.sub_domain_four} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Sub-domain 4" type="text"/>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent my-xl"></div>

            {/* Business Profile */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
              <div className="md:col-span-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined">verified_user</span>
                  Business Profile
                </h2>
                <p className="text-sm text-secondary mt-xs">Official records and establishment details for verification.</p>
              </div>
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Country of Origin</label>
                  <input name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="India" type="text"/>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Year Established</label>
                  <input name="business_dob" min="1800" max="2026" value={formData.business_dob} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="2020" type="number"/>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">GST Number</label>
                  <input
                    name="business_gst"
                    value={formData.business_gst}
                    onChange={handleInputChange}
                    className={`w-full bg-white border rounded-lg p-3 focus:ring-2 outline-none transition-all ${
                      errors.business_gst
                        ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                        : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="27XXXXX..."
                    type="text"
                  />
                  {errors.business_gst && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.business_gst}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent my-xl"></div>

            {/* Social Media & Media */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
              <div className="md:col-span-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined">image</span>
                  Media & Social
                </h2>
                <p className="text-sm text-secondary mt-xs">Visual representation and social connectivity.</p>
              </div>
              <div className="md:col-span-8 space-y-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="group">
                    <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Instagram</label>
                    <input
                      name="insta_link"
                      value={formData.insta_link}
                      onChange={handleInputChange}
                      className={`w-full bg-white border rounded-lg p-3 focus:ring-2 outline-none transition-all ${
                        errors.insta_link
                          ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                          : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                      }`}
                      placeholder="https://instagram.com/yourbusiness"
                      type="url"
                    />
                    {errors.insta_link && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.insta_link}</p>
                    )}
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Facebook</label>
                    <input
                      name="facebook_link"
                      value={formData.facebook_link}
                      onChange={handleInputChange}
                      className={`w-full bg-white border rounded-lg p-3 focus:ring-2 outline-none transition-all ${
                        errors.facebook_link
                          ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                          : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                      }`}
                      placeholder="https://fb.com/yourbusiness"
                      type="url"
                    />
                    {errors.facebook_link && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.facebook_link}</p>
                    )}
                  </div>
                </div>
                <div className={`border-2 border-dashed p-8 rounded-xl text-center transition-colors hover:border-primary group bg-surface relative ${
                  errors.business_banner ? 'border-red-500 bg-red-50/10' : 'border-outline-variant'
                }`}>
                  {bannerFile ? (
                    <div className="mb-2">
                      <a href={URL.createObjectURL(bannerFile)} target="_blank" rel="noopener noreferrer">
                        <img src={URL.createObjectURL(bannerFile)} alt="New Banner Preview" className="h-32 object-contain mx-auto rounded-lg mb-2 cursor-pointer hover:opacity-80 transition-opacity" />
                      </a>
                      <p className="text-sm font-bold text-primary">{bannerFile.name}</p>
                      <button type="button" onClick={() => setBannerFile(null)} className="text-xs text-red-500 mt-1 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-outline mb-2 group-hover:text-primary transition-colors">upload_file</span>
                      <p className="text-sm font-bold text-on-surface-variant mb-2">Upload Business Banner</p>
                      <p className="text-xs text-secondary mb-4">PNG, JPG (Max 2MB)</p>
                    </>
                  )}
                  <input className="hidden" id="bannerUpload" type="file" accept="image/*" onChange={handleFileChange} />
                  <label className="inline-block bg-surface-container-high px-6 py-2 rounded-full text-sm font-bold cursor-pointer hover:bg-primary hover:text-white transition-all text-on-surface" htmlFor="bannerUpload">
                    {bannerFile ? 'Change File' : 'Choose File'}
                  </label>
                  {errors.business_banner && (
                    <p className="text-red-500 text-xs mt-2 font-medium">{errors.business_banner}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent my-xl"></div>

            {/* Address Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
              <div className="md:col-span-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined">location_on</span>
                  Address
                </h2>
                <p className="text-sm text-secondary mt-xs">Your physical location for map placement and local search.</p>
              </div>
              <div className="md:col-span-8 space-y-md">
                <div className="flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="flex items-center gap-2 text-primary font-bold hover:underline bg-primary/10 p-3 rounded-lg w-full md:w-auto justify-center transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed" 
                    type="button"
                  >
                    <span className="material-symbols-outlined">
                      {isLocating ? 'progress_activity' : 'my_location'}
                    </span>
                    {isLocating ? 'Detecting...' : 'Get Current Location'}
                  </button>
                  <button 
                    onClick={() => setIsMapOpen(true)}
                    className="flex items-center gap-2 text-primary font-bold hover:underline bg-primary/10 p-3 rounded-lg w-full md:w-auto justify-center transition-colors hover:bg-primary/20" 
                    type="button"
                  >
                    <span className="material-symbols-outlined">map</span>
                    Set Location
                  </button>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Detailed Address *</label>
                  <textarea
                    name="business_address"
                    value={formData.business_address}
                    onChange={handleInputChange}
                    className={`w-full bg-white border rounded-lg p-3 focus:ring-2 outline-none transition-all ${
                      errors.business_address
                        ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                        : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="Plot No, Building, Street, Area, Jalgaon"
                    rows={3}
                  ></textarea>
                  {errors.business_address && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.business_address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="pt-xl mt-xxxl border-t border-hairline-soft">
              <button disabled={submitting} className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-xl hover:bg-primary-deep shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3" type="submit">
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Submit Form
                  </>
                )}
              </button>
              <p className="text-center text-sm text-secondary mt-4 italic">By submitting, you agree to our Terms of Service and Business Listing Policies.</p>
            </div>
          </form>
        </div>
      </main>
      
      {isMapOpen && (
        <LocationMapPicker
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onConfirm={handleLocationConfirmed}
          initialLat={formData.lat ? parseFloat(formData.lat) : undefined}
          initialLng={formData.lng ? parseFloat(formData.lng) : undefined}
        />
      )}
      
      <Footer />
    </>
  );
}

