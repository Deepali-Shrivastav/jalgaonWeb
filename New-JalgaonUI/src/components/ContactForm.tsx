import React, { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call since no endpoint exists yet
    setTimeout(() => {
      setLoading(false);
      setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you shortly.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

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
            <form onSubmit={handleSubmit} className="space-y-base">
              {status && (
                <div className={`p-4 rounded-lg mb-4 text-sm font-bold ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {status.message}
                </div>
              )}
              <div className="grid grid-cols-2 gap-base">
                <div className="space-y-xxs">
                  <label className="text-xs font-extrabold text-ink-deep uppercase tracking-wider">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full bg-surface p-xl rounded-xl border-none focus:ring-2 focus:ring-primary/20" placeholder="John Doe" type="text" />
                </div>
                <div className="space-y-xxs">
                  <label className="text-xs font-extrabold text-ink-deep uppercase tracking-wider">Email</label>
                  <input required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full bg-surface p-xl rounded-xl border-none focus:ring-2 focus:ring-primary/20" placeholder="john@example.com" type="email" />
                </div>
              </div>
              
              <div className="space-y-xxs">
                <label className="text-xs font-extrabold text-ink-deep uppercase tracking-wider">Subject</label>
                <input required value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} className="w-full bg-surface p-xl rounded-xl border-none focus:ring-2 focus:ring-primary/20" placeholder="Business Inquiry" type="text" />
              </div>
              
              <div className="space-y-xxs">
                <label className="text-xs font-extrabold text-ink-deep uppercase tracking-wider">Message</label>
                <textarea required value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} className="w-full bg-surface p-xl rounded-xl border-none focus:ring-2 focus:ring-primary/20 min-h-[150px]" placeholder="How can we help you?"></textarea>
              </div>
              
              <button disabled={loading} type="submit" className="w-full bg-primary text-white py-xl rounded-full font-extrabold shadow-lg hover:bg-primary-deep transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
