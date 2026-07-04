import React from 'react';

export default function ContactForm() {
  return (
    <section className="py-section bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-xxl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-section">
          <div>
            <h2 className="text-4xl font-extrabold text-ink-deep mb-xl">Get in Touch</h2>
            <p className="text-xl text-secondary mb-section leading-relaxed">
              Have questions? We&apos;re here to help you connect with the local community and grow your business presence.
            </p>
            
            <div className="space-y-xl">
              <div className="flex items-start gap-xl">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                </div>
                <div>
                  <h4 className="font-bold text-ink-deep text-lg">Office Address</h4>
                  <p className="text-secondary">123 Market Road, City Center, Jalgaon, MH 425001</p>
                </div>
              </div>
              
              <div className="flex items-start gap-xl">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">call</span>
                </div>
                <div>
                  <h4 className="font-bold text-ink-deep text-lg">Phone Number</h4>
                  <p className="text-secondary">+91 257 223 4455</p>
                </div>
              </div>
              
              <div className="flex items-start gap-xl">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">mail</span>
                </div>
                <div>
                  <h4 className="font-bold text-ink-deep text-lg">Email Address</h4>
                  <p className="text-secondary">support@jalgaon.com</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-xxl rounded-xl shadow-xl border border-hairline-soft">
            <form className="space-y-base">
              <div className="grid grid-cols-2 gap-base">
                <div className="space-y-xxs">
                  <label className="text-xs font-extrabold text-ink-deep uppercase tracking-wider">Full Name</label>
                  <input className="w-full bg-surface p-xl rounded-xl border-none focus:ring-2 focus:ring-primary/20" placeholder="John Doe" type="text" />
                </div>
                <div className="space-y-xxs">
                  <label className="text-xs font-extrabold text-ink-deep uppercase tracking-wider">Email</label>
                  <input className="w-full bg-surface p-xl rounded-xl border-none focus:ring-2 focus:ring-primary/20" placeholder="john@example.com" type="email" />
                </div>
              </div>
              
              <div className="space-y-xxs">
                <label className="text-xs font-extrabold text-ink-deep uppercase tracking-wider">Subject</label>
                <input className="w-full bg-surface p-xl rounded-xl border-none focus:ring-2 focus:ring-primary/20" placeholder="Business Inquiry" type="text" />
              </div>
              
              <div className="space-y-xxs">
                <label className="text-xs font-extrabold text-ink-deep uppercase tracking-wider">Message</label>
                <textarea className="w-full bg-surface p-xl rounded-xl border-none focus:ring-2 focus:ring-primary/20 min-h-[150px]" placeholder="How can we help you?"></textarea>
              </div>
              
              <button className="w-full bg-primary text-white py-xl rounded-full font-extrabold shadow-lg hover:bg-primary-deep transition-all active:scale-[0.98]">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
