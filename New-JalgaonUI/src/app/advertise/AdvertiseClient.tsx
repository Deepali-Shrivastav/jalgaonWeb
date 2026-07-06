'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthContext } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function AdvertiseClient() {
  const { isLogin, setIsLoginFormOpen } = useContext(AuthContext);
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_number: '',
    ad_type: 'BA',
    target_page: 'hero_banner',
    package: 'basic'
  });
  
  const [adImage, setAdImage] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const img = new Image();
      img.onload = () => {
        if (formData.ad_type === 'BA') {
          if (img.width !== 900 || img.height !== 200) {
            toast.error("Banner ads must be exactly 900x200px");
            setAdImage(null);
            e.target.value = '';
          } else {
            setAdImage(file);
          }
        } else if (formData.ad_type === 'CA') {
          if (formData.target_page === 'sidebar') {
            if (img.width !== 300 || img.height !== 250) {
              toast.error("Sidebar Carousel ads must be exactly 300x250px");
              setAdImage(null);
              e.target.value = '';
            } else {
              setAdImage(file);
            }
          } else {
            if (img.width > 800 || img.height > 400) {
              toast.error("Carousel ads must be max 800x400px");
              setAdImage(null);
              e.target.value = '';
            } else {
              setAdImage(file);
            }
          }
        } else {
          setAdImage(file);
        }
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin) {
      toast.error("Please login to submit an advertisement.");
      return;
    }

    setSubmitting(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem("token");

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key as keyof typeof formData]);
    });

    if (adImage) {
      const isValid = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (formData.ad_type === 'BA') {
            resolve(img.width === 900 && img.height === 200);
          } else if (formData.ad_type === 'CA') {
            if (formData.target_page === 'sidebar') {
              resolve(img.width === 300 && img.height === 250);
            } else {
              resolve(img.width <= 800 && img.height <= 400);
            }
          } else {
            resolve(true);
          }
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(adImage);
      });
      
      if (!isValid) {
        if (formData.ad_type === 'BA') {
          toast.error("Banner ads must be exactly 900x200px");
        } else if (formData.ad_type === 'CA') {
          if (formData.target_page === 'sidebar') {
            toast.error("Sidebar Carousel ads must be exactly 300x250px");
          } else {
            toast.error("Carousel ads must be max 800x400px");
          }
        }
        setSubmitting(false);
        return;
      }
      submitData.append('ad_image', adImage);
    } else {
      toast.error("Advertisement image is required");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/v1/ads/submit/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (res.ok) {
        toast.success("Advertisement request submitted successfully!");
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const errorData = await res.json();
        console.error("Submission error:", errorData);
        toast.error("Failed to submit request. Please check required fields.");
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
      <main className="flex-grow py-section px-base bg-surface">
        <div className="max-w-[1000px] mx-auto py-xxxl">
          {/* Page Title */}
          <div className="text-center mb-xxl">
            <h1 className="text-4xl font-extrabold text-on-surface mb-xs">Advertise on Jalgaon.com</h1>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="relative bg-surface-container-lowest rounded-[32px] shadow-xl p-xl md:p-xxxl border border-hairline-soft overflow-hidden">
            <form className={`space-y-xxl transition-all duration-300 ${!isLogin ? "select-none pointer-events-none filter blur-[3px]" : ""}`} onSubmit={handleSubmit}>
              {/* Section: Business Details */}
              <div data-purpose="business-details-section">
                <h2 className="text-xl font-bold text-on-surface mb-md flex items-center gap-sm">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Ad Details
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="name">Business / Ad Name *</label>
                    <input required disabled={!isLogin} className="w-full border border-hairline-soft rounded-lg focus:ring-primary focus:border-primary p-3 outline-none transition-all disabled:opacity-50" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your Business Name" type="text"/>
                  </div>
                </div>
              </div>
              
              {/* Section: Contact Info */}
              <div data-purpose="contact-info-section">
                <h2 className="text-xl font-bold text-on-surface mb-md flex items-center gap-sm">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Contact Info
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="contact_email">Contact Email *</label>
                    <input required disabled={!isLogin} className="w-full border border-hairline-soft rounded-lg focus:ring-primary focus:border-primary p-3 outline-none transition-all disabled:opacity-50" id="contact_email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} placeholder="Contact Email" type="email"/>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="contact_number">Phone Number *</label>
                    <input required disabled={!isLogin} className="w-full border border-hairline-soft rounded-lg focus:ring-primary focus:border-primary p-3 outline-none transition-all disabled:opacity-50" id="contact_number" name="contact_number" value={formData.contact_number} onChange={handleInputChange} placeholder="Phone Number" type="tel"/>
                  </div>
                </div>
              </div>

              {/* Section: Advertise Settings */}
              <div data-purpose="advertise-type-section">
                <h2 className="text-xl font-bold text-on-surface mb-md flex items-center gap-sm">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Advertisement Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="ad_type">Ad Type *</label>
                    <select required disabled={!isLogin} className="w-full border border-hairline-soft bg-white rounded-lg focus:ring-primary focus:border-primary p-3 outline-none transition-all text-on-surface-variant disabled:opacity-50" id="ad_type" name="ad_type" value={formData.ad_type} onChange={handleInputChange}>
                      <option value="BA">Banner Ad</option>
                      <option value="CA">Carousel Ad</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="target_page">Target Page *</label>
                    <select required disabled={!isLogin} className="w-full border border-hairline-soft bg-white rounded-lg focus:ring-primary focus:border-primary p-3 outline-none transition-all text-on-surface-variant disabled:opacity-50" id="target_page" name="target_page" value={formData.target_page} onChange={handleInputChange}>
                      <option value="hero_banner">Homepage Hero Banner</option>
                      <option value="category_banner">Category Page Banner</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="listing_interstitial">Between Listings</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="package">Package *</label>
                    <select required disabled={!isLogin} className="w-full border border-hairline-soft bg-white rounded-lg focus:ring-primary focus:border-primary p-3 outline-none transition-all text-on-surface-variant disabled:opacity-50" id="package" name="package" value={formData.package} onChange={handleInputChange}>
                      <option value="basic">Basic (3 Days)</option>
                      <option value="standard">Standard (7 Days)</option>
                      <option value="premium">Premium (30 Days)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Advertise Image */}
              <div data-purpose="advertise-image-section">
                <h2 className="text-xl font-bold text-on-surface mb-md flex items-center gap-sm">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Advertisement Creative
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant">Advertise Media *</label>
                    <div className="flex items-center justify-center w-full">
                      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-outline-variant rounded-lg cursor-pointer bg-surface hover:bg-surface-container-low transition-all ${!isLogin ? "pointer-events-none opacity-50" : ""}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {adImage ? (
                            <p className="font-semibold text-primary">{adImage.name}</p>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-outline mb-2 text-3xl">cloud_upload</span>
                              <p className="mb-2 text-sm text-on-surface-variant"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-secondary">
                                {formData.ad_type === 'BA' 
                                  ? 'PNG, JPG (Exactly 900x200px)' 
                                  : formData.ad_type === 'CA' && formData.target_page === 'sidebar' 
                                    ? 'PNG, JPG (Exactly 300x250px)' 
                                    : 'PNG, JPG (MAX. 800x400px)'}
                              </p>
                            </>
                          )}
                        </div>
                        <input disabled={!isLogin} className="hidden" type="file" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-xl">
                <button disabled={submitting || !isLogin} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-deep shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" type="submit">
                  {submitting ? 'Submitting...' : 'Submit Advertisement'}
                </button>
              </div>
            </form>

            {!isLogin && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-[2px] p-6 text-center">
                <div className="max-w-[450px] bg-white rounded-2xl shadow-2xl p-8 border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                  <span className="material-symbols-outlined text-primary text-5xl mb-4">
                    lock
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Authentication Required
                  </h2>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Please log in or sign up to submit advertisements and showcase your business on Jalgaon.com.
                  </p>
                  <button
                    onClick={() => setIsLoginFormOpen(true)}
                    type="button"
                    className="bg-primary text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-primary-deep transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Login / Signup to Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
