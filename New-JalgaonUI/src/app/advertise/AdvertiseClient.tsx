'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdvertisePage() {
  return (
    <>
      <Header />
      <main className="flex-grow py-section px-base bg-surface">
        <div className="max-w-[1000px] mx-auto py-xxxl">
          {/* Page Title */}
          <div className="text-center mb-xxl">
            <h1 className="text-4xl font-extrabold text-on-surface mb-xs">List your business to Jalgaon.com</h1>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="bg-surface-container-lowest rounded-[32px] shadow-xl p-xl md:p-xxxl border border-hairline-soft">
            <form action="#" className="space-y-xxl" method="POST">
              {/* Section: Business Details */}
              <div data-purpose="business-details-section">
                <h2 className="text-xl font-bold text-on-surface mb-md flex items-center gap-sm">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Add Business Details
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="business-name">Business Name</label>
                    <input className="w-full border border-hairline-soft rounded-lg focus:ring-primary focus:border-primary p-3 outline-none transition-all" id="business-name" name="business-name" placeholder="Full Name" type="text"/>
                  </div>
                </div>
              </div>
              
              {/* Section: Contact Info */}
              <div data-purpose="contact-info-section">
                <h2 className="text-xl font-bold text-on-surface mb-md flex items-center gap-sm">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Add Business Contact Info
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="contact-email">Contact Email</label>
                    <input className="w-full border border-hairline-soft rounded-lg focus:ring-primary focus:border-primary p-3 outline-none transition-all" id="contact-email" name="contact-email" placeholder="Contact Email" type="email"/>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="phone-number">Phone Number</label>
                    <input className="w-full border border-hairline-soft rounded-lg focus:ring-primary focus:border-primary p-3 outline-none transition-all" id="phone-number" name="phone-number" placeholder="Phone Number" type="tel"/>
                  </div>
                </div>
              </div>

              {/* Section: Advertise Type */}
              <div data-purpose="advertise-type-section">
                <h2 className="text-xl font-bold text-on-surface mb-md flex items-center gap-sm">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Advertise Type
                </h2>
                <div className="space-y-2">
                  <select className="w-full border border-hairline-soft bg-white rounded-lg focus:ring-primary focus:border-primary p-3 outline-none transition-all text-on-surface-variant" id="category" name="category" defaultValue="">
                    <option disabled value="">Select a main category...</option>
                    <option value="automotive">Automotive</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="food-beverage">Food & Beverage</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                  </select>
                </div>
              </div>

              {/* Section: Advertise Image */}
              <div data-purpose="advertise-image-section">
                <h2 className="text-xl font-bold text-on-surface mb-md flex items-center gap-sm">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Advertise Image
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant">Advertise Media</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-outline-variant rounded-lg cursor-pointer bg-surface hover:bg-surface-container-low transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <span className="material-symbols-outlined text-outline mb-2 text-3xl">cloud_upload</span>
                          <p className="mb-2 text-sm text-on-surface-variant"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-secondary">PNG, JPG (MAX. 800x400px)</p>
                        </div>
                        <input className="hidden" type="file"/>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-xl">
                <button className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-deep shadow-lg transition-all transform hover:-translate-y-1 active:scale-95" type="submit">
                  Submit Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
