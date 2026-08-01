'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthContext } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { getCurrentLocation, reverseGeocode, LocationDetails } from '@/utils/locationService';

// Dynamically import LocationMapPicker with SSR disabled to prevent window is not defined error for leaflet
const LocationMapPicker = dynamic(() => import('@/components/LocationMapPicker'), { ssr: false });

export default function EditListingClient({ slug }: { slug: string }) {
  const { isLogin } = useContext(AuthContext);
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    business_name: '',
    legal_name: '',
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
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);

  // Location Picker State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Fetch categories
        const catRes = await fetch(`${baseUrl}/api/v1/listings/categories/`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }

        // Fetch existing listing
        const listRes = await fetch(`${baseUrl}/api/v1/listings/${slug}/`);
        if (listRes.ok) {
          const listData = await listRes.json();
          
          setFormData({
            business_name: listData.business_name || '',
            legal_name: listData.legal_name || '',
            business_email: listData.business_email || '',
            business_no: listData.business_no || '',
            main_category: listData.main_category?.id?.toString() || listData.main_category?.toString() || '',
            sub_category: listData.sub_category?.id?.toString() || listData.sub_category?.toString() || '',
            business_description: listData.business_description || '',
            sub_domain_one: listData.sub_domain_one || '',
            sub_domain_two: listData.sub_domain_two || '',
            sub_domain_three: listData.sub_domain_three || '',
            sub_domain_four: listData.sub_domain_four || '',
            country: listData.country || 'India',
            business_dob: listData.business_dob || '',
            business_gst: listData.business_gst || '',
            insta_link: listData.insta_link || '',
            facebook_link: listData.facebook_link || '',
            business_address: listData.business_address || '',
            city: listData.city || 'Jalgaon',
            lat: listData.lat?.toString() || '',
            lng: listData.lng?.toString() || ''
          });

          if (listData.business_banner) {
            const bannerUrl = listData.business_banner.startsWith('http')
              ? listData.business_banner
              : `${baseUrl}${listData.business_banner.startsWith('/') ? '' : '/'}${listData.business_banner}`;
            setExistingBannerUrl(bannerUrl);
          }
        } else {
          toast.error("Failed to load listing details");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading data");
      } finally {
        setLoading(false);
      }

      // Fetch reviews for owner
      try {
        const token = localStorage.getItem("token");
        const revRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/listings/${slug}/reviews/`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData.results || revData);
        }
      } catch (e) {
        console.error("Failed to load reviews");
      } finally {
        setLoadingReviews(false);
      }
    };
    
    initData();
  }, [slug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading && !isLogin) {
        router.push(`/login?redirect=/edit-listing/${slug}`);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLogin, loading, router, slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.");
        e.target.value = '';
        setBannerFile(null);
        return;
      }
      setBannerFile(file);
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
    
    setIsMapOpen(false);
  };

  const handleReviewStatus = async (reviewId: number, status: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/listings/reviews/${reviewId}/manage/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Review ${status} successfully!`);
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, status } : r));
      } else {
        toast.error("Failed to update review status.");
      }
    } catch (err) {
      toast.error("An error occurred while updating review.");
    }
  };

  const selectedMainCategory = categories.find(c => c.id.toString() === formData.main_category);
  const subCategories = selectedMainCategory ? selectedMainCategory.subcategories : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin) {
      toast.error("Please login to update this listing.");
      return;
    }

    if (!formData.main_category || !formData.sub_category) {
      toast.error("Please select a main category and sub-category.");
      return;
    }
    
    // Temporary fix: Do not force location picking for old listings that might not have lat/lng
    // if (!formData.lat || !formData.lng) {
    //   toast.error("Please pick a location on the map or use your current location.");
    //   return;
    // }

    setSubmitting(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem("token");

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'legal_name' && key !== 'country' && formData[key as keyof typeof formData] !== null) {
        submitData.append(key, formData[key as keyof typeof formData] as string);
      }
    });

    if (bannerFile) {
      submitData.append('business_banner', bannerFile);
    }

    try {
      const res = await fetch(`${baseUrl}/api/v1/listings/${slug}/update/`, {
        method: 'PATCH', // or PUT depending on DRF setup
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (res.ok) {
        toast.success("Listing updated successfully!");
        setTimeout(() => {
          router.push('/account'); // Go back to dashboard
        }, 2000);
      } else {
        const errorData = await res.json();
        console.error("Update error:", errorData);
        toast.error(errorData.detail || errorData.non_field_errors?.[0] || "Failed to update listing.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during update.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary mb-4">progress_activity</span>
        <h2 className="text-xl font-bold text-ink-deep">Loading Profile...</h2>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Toaster position="top-center" />
      <main className="py-xxxl mb-12 px-base md:px-xxl max-w-container-max mx-auto bg-surface">
        <section className="text-center mb-xxl mt-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-sm">Edit Your Business Profile</h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Update your business details to keep your customers informed.
          </p>
        </section>

        <div className="bg-surface-container-lowest rounded-[32px] p-base md:p-xxxl shadow-lg border border-hairline-soft">
          <form className="space-y-xxl" onSubmit={handleSubmit}>
            
            {/* Business Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
              <div className="md:col-span-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined">store</span>
                  Business Details
                </h2>
              </div>
              <div className="md:col-span-8 grid grid-cols-1 gap-md">
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Business Name *</label>
                  <input required name="business_name" value={formData.business_name} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" type="text"/>
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
              </div>
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Contact Email</label>
                  <input name="business_email" value={formData.business_email} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" type="email"/>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Phone Number *</label>
                  <input required name="business_no" value={formData.business_no} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" type="tel"/>
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
              </div>
              <div className="md:col-span-8 space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="group">
                    <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Main Category *</label>
                    <select required name="main_category" value={formData.main_category} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                      <option disabled value="">Select a main category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.main_category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Sub-category *</label>
                    <select required name="sub_category" value={formData.sub_category} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" disabled={!formData.main_category}>
                      <option disabled value="">Select a sub category...</option>
                      {subCategories.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>{sub.sub_category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Description *</label>
                  <textarea required name="business_description" value={formData.business_description} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" rows={4}></textarea>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent my-xl"></div>

            {/* Media & Address */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
              <div className="md:col-span-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined">image</span>
                  Media & Location
                </h2>
              </div>
              <div className="md:col-span-8 space-y-xl">
                <div className="border-2 border-dashed border-outline-variant p-8 rounded-xl text-center bg-surface relative">
                  {bannerFile ? (
                    <div className="mb-2">
                      <a href={URL.createObjectURL(bannerFile)} target="_blank" rel="noopener noreferrer">
                        <img src={URL.createObjectURL(bannerFile)} alt="New Banner Preview" className="h-32 object-contain mx-auto rounded-lg mb-2 cursor-pointer hover:opacity-80 transition-opacity" />
                      </a>
                      <p className="text-sm font-bold text-primary">{bannerFile.name}</p>
                      <button type="button" onClick={() => setBannerFile(null)} className="text-xs text-red-500 mt-1 hover:underline">Remove</button>
                    </div>
                  ) : existingBannerUrl ? (
                     <div className="mb-4">
                       <a href={existingBannerUrl} target="_blank" rel="noopener noreferrer">
                         <img src={existingBannerUrl} alt="Current Banner" className="h-32 object-contain mx-auto rounded-lg mb-2 cursor-pointer hover:opacity-80 transition-opacity" />
                       </a>
                       <p className="text-xs text-secondary">Upload a new file to replace this banner</p>
                     </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-outline mb-2">upload_file</span>
                      <p className="text-sm font-bold text-on-surface-variant mb-2">Upload New Business Banner</p>
                      <p className="text-xs text-secondary mb-4">PNG, JPG (Max 2MB)</p>
                    </>
                  )}
                  <input className="hidden" id="bannerUpload" type="file" accept="image/*" onChange={handleFileChange} />
                  <label className="inline-block bg-surface-container-high px-6 py-2 rounded-full text-sm font-bold cursor-pointer hover:bg-primary hover:text-white transition-all" htmlFor="bannerUpload">
                    {bannerFile ? 'Change File' : 'Choose File'}
                  </label>
                </div>
                
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
                  <textarea required name="business_address" value={formData.business_address} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" rows={3}></textarea>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent my-xl"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
              <div className="md:col-span-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined">reviews</span>
                  Customer Reviews
                </h2>
                <p className="text-sm text-secondary mt-2">Manage customer feedback on your listing. You can hide reviews if they violate policies.</p>
              </div>
              <div className="md:col-span-8 space-y-md">
                {loadingReviews ? (
                  <div className="text-center py-8"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-surface-container-lowest p-4 rounded-xl border border-hairline-soft relative">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-ink-deep">{review.user_name || 'Anonymous'}</p>
                            <p className="text-xs text-secondary">{new Date(review.timestamp).toLocaleDateString()}</p>
                          </div>
                          <div className="flex text-yellow-500">
                            {Array(review.rating_star).fill(0).map((_, i) => <span key={i} className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>)}
                          </div>
                        </div>
                        <p className="text-sm text-secondary mb-4">{review.user_review}</p>
                        <div className="flex items-center gap-2 border-t border-hairline-soft pt-3 mt-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${review.status === 'approved' ? 'bg-green-100 text-green-700' : review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {review.status ? review.status.toUpperCase() : 'UNKNOWN'}
                          </span>
                          <div className="flex-1"></div>
                          {review.status !== 'approved' && (
                            <button type="button" onClick={() => handleReviewStatus(review.id, 'approved')} className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg font-bold transition-colors border border-green-200">Approve</button>
                          )}
                          {review.status !== 'rejected' && (
                            <button type="button" onClick={() => handleReviewStatus(review.id, 'rejected')} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold transition-colors border border-red-200">Hide</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">rate_review</span>
                    <p className="text-sm font-semibold text-on-surface-variant">No reviews found for this listing yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Final CTA */}
            <div className="pt-xl mt-xxxl border-t border-hairline-soft">
              <button disabled={submitting || loading} className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-xl hover:bg-primary-deep shadow-lg transition-all" type="submit">
                {submitting ? 'Updating...' : 'Update Business Profile'}
              </button>
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
