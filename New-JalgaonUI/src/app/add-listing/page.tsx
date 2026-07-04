'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthContext } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function AddListingPage() {
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
    city: 'Jalgaon'
  });
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    // Redirect to login if not logged in
    // However, if we want to allow unauthenticated users to see the page and prompt later, we can skip
    
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };

  const selectedMainCategory = categories.find(c => c.id.toString() === formData.main_category);
  const subCategories = selectedMainCategory ? selectedMainCategory.subcategories : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin) {
      toast.error("Please login to submit a business listing.");
      return;
    }

    if (!formData.main_category || !formData.sub_category) {
      toast.error("Please select a main category and sub-category.");
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
    } else {
      toast.error("Business banner image is required");
      setSubmitting(false);
      return;
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
        toast.success("Listing submitted successfully! Awaiting admin approval.");
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const errorData = await res.json();
        console.error("Submission error:", errorData);
        toast.error("Failed to submit listing. Please check required fields.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Toaster position="top-center" />
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
          <form className="space-y-xxl" id="businessForm" onSubmit={handleSubmit}>
            
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
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs transition-colors group-focus-within:text-primary">Business Name *</label>
                  <input required name="business_name" value={formData.business_name} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="e.g. Jalgaon Tech Solutions" type="text"/>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs transition-colors group-focus-within:text-primary">Legal Business Name</label>
                  <input name="legal_name" value={formData.legal_name} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Registered Enterprise Name" type="text"/>
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
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Contact Email *</label>
                  <input required name="business_email" value={formData.business_email} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="contact@business.com" type="email"/>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Phone Number *</label>
                  <input required name="business_no" value={formData.business_no} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="+91 98765 43210" type="tel"/>
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
                    <select required name="main_category" value={formData.main_category} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface-variant">
                      <option disabled value="">Select a main category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.main_category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Sub-category *</label>
                    <select required name="sub_category" value={formData.sub_category} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface-variant" disabled={!formData.main_category}>
                      <option disabled value="">Select a sub category...</option>
                      {subCategories.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>{sub.sub_category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Description *</label>
                  <textarea required name="business_description" value={formData.business_description} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Tell us about your business, your mission, and what sets you apart..." rows={4}></textarea>
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
                  <input name="business_dob" value={formData.business_dob} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="2020" type="number"/>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">GST Number</label>
                  <input name="business_gst" value={formData.business_gst} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="27XXXXX..." type="text"/>
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
                    <input name="insta_link" value={formData.insta_link} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="@yourbusiness" type="text"/>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Facebook</label>
                    <input name="facebook_link" value={formData.facebook_link} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="fb.com/yourbusiness" type="text"/>
                  </div>
                </div>
                <div className="border-2 border-dashed border-outline-variant p-8 rounded-xl text-center transition-colors hover:border-primary group bg-surface relative">
                  {bannerFile ? (
                    <div className="mb-2">
                      <p className="text-sm font-bold text-primary">{bannerFile.name}</p>
                      <button type="button" onClick={() => setBannerFile(null)} className="text-xs text-red-500 mt-1 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-outline mb-2 group-hover:text-primary transition-colors">upload_file</span>
                      <p className="text-sm font-bold text-on-surface-variant mb-2">Upload Business Banner *</p>
                      <p className="text-xs text-secondary mb-4">PNG, JPG up to 10MB (Recommended ratio 16:9)</p>
                    </>
                  )}
                  <input className="hidden" id="bannerUpload" type="file" accept="image/*" onChange={handleFileChange} />
                  <label className="inline-block bg-surface-container-high px-6 py-2 rounded-full text-sm font-bold cursor-pointer hover:bg-primary hover:text-white transition-all text-on-surface" htmlFor="bannerUpload">
                    {bannerFile ? 'Change File' : 'Choose File'}
                  </label>
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
                  <button className="flex items-center gap-2 text-primary font-bold hover:underline bg-primary/10 p-3 rounded-lg w-full md:w-auto justify-center transition-colors hover:bg-primary/20" type="button">
                    <span className="material-symbols-outlined">my_location</span>
                    Get Current Location
                  </button>
                  <button className="flex items-center gap-2 text-primary font-bold hover:underline bg-primary/10 p-3 rounded-lg w-full md:w-auto justify-center transition-colors hover:bg-primary/20" type="button">
                    <span className="material-symbols-outlined">map</span>
                    Set Location
                  </button>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Detailed Address *</label>
                  <textarea required name="business_address" value={formData.business_address} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Plot No, Building, Street, Area, Jalgaon" rows={3}></textarea>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="pt-xl mt-xxxl border-t border-hairline-soft">
              <button disabled={submitting} className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-xl hover:bg-primary-deep shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" type="submit">
                {submitting ? 'Submitting...' : 'Submit Form'}
              </button>
              <p className="text-center text-sm text-secondary mt-4 italic">By submitting, you agree to our Terms of Service and Business Listing Policies.</p>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

