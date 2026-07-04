'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AddListingPage() {
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
          <form className="space-y-xxl" id="businessForm" onSubmit={(e) => e.preventDefault()}>
            
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
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs transition-colors group-focus-within:text-primary">Business Name</label>
                  <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="e.g. Jalgaon Tech Solutions" type="text"/>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs transition-colors group-focus-within:text-primary">Legal Business Name</label>
                  <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Registered Enterprise Name" type="text"/>
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
                  <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="contact@business.com" type="email"/>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Phone Number</label>
                  <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="+91 98765 43210" type="tel"/>
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
                    <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Main Category</label>
                    <select className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface-variant" defaultValue="">
                      <option disabled value="">Select a main category...</option>
                      <option value="services">Services</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Sub-category</label>
                    <select className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface-variant" defaultValue="">
                      <option disabled value="">Select a sub category...</option>
                      <option value="it">IT & Software</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="construction">Construction</option>
                    </select>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Description</label>
                  <textarea className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Tell us about your business, your mission, and what sets you apart..." rows={4}></textarea>
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
                <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Sub-domain 1" type="text"/>
                <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Sub-domain 2" type="text"/>
                <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Sub-domain 3" type="text"/>
                <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Sub-domain 4" type="text"/>
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
                  <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="India" type="text"/>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Year Established</label>
                  <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="2020" type="number"/>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">GST Number</label>
                  <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="27XXXXX..." type="text"/>
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
                    <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="@yourbusiness" type="text"/>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Facebook</label>
                    <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="fb.com/yourbusiness" type="text"/>
                  </div>
                </div>
                <div className="border-2 border-dashed border-outline-variant p-8 rounded-xl text-center transition-colors hover:border-primary group bg-surface">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2 group-hover:text-primary transition-colors">upload_file</span>
                  <p className="text-sm font-bold text-on-surface-variant mb-2">Upload Business Banner</p>
                  <p className="text-xs text-secondary mb-4">PNG, JPG up to 10MB (Recommended ratio 16:9)</p>
                  <input className="hidden" id="bannerUpload" type="file"/>
                  <label className="inline-block bg-surface-container-high px-6 py-2 rounded-full text-sm font-bold cursor-pointer hover:bg-primary hover:text-white transition-all text-on-surface" htmlFor="bannerUpload">Choose File</label>
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
                  <label className="block text-sm font-semibold text-on-surface-variant mb-xs">Detailed Address</label>
                  <textarea className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Plot No, Building, Street, Area, Jalgaon" rows={3}></textarea>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="pt-xl mt-xxxl border-t border-hairline-soft">
              <button className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-xl hover:bg-primary-deep shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95" type="submit">
                Submit Form
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
