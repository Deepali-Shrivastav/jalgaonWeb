import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-hairline-soft pt-section pb-xl hidden md:block">
      <div className="max-w-container-max mx-auto px-xxl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-section mb-section">
          <div className="space-y-xl">
            <img 
              alt="Jalgaon.com Logo" 
              className="h-8 w-auto" 
              src="/main-logo.png" 
            />
            <p className="text-secondary leading-relaxed">
              The definitive guide to Jalgaon&apos;s vibrant business landscape, community news, and essential local services since 1995.
            </p>
            <div className="flex gap-base">
              <a className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all" href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined text-xl">public</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all" href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined text-xl">person</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-extrabold text-ink-deep mb-xl">Company</h4>
            <ul className="space-y-base">
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/">About Us</Link></li>
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/">Our Team</Link></li>
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/jobs">Careers</Link></li>
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/">Press Kit</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-extrabold text-ink-deep mb-xl">Services</h4>
            <ul className="space-y-base">
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/">Business Directory</Link></li>
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/add-listing">Premium Listings</Link></li>
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/advertise">Advertising</Link></li>
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/news">Local News</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-extrabold text-ink-deep mb-xl">Support</h4>
            <ul className="space-y-base">
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/">Help Center</Link></li>
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/">Contact Us</Link></li>
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/">Terms of Service</Link></li>
              <li><Link className="text-secondary hover:text-primary transition-colors" href="/">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-xl border-t border-hairline-soft flex flex-col md:flex-row justify-between items-center gap-base">
          <p className="text-secondary text-sm">© 1995-2026 Jalgaon.com. All Rights Reserved.</p>
          <div className="flex items-center gap-xl text-xs font-bold text-secondary uppercase tracking-widest">
            <Link className="hover:text-primary" href="/">Terms</Link>
            <Link className="hover:text-primary" href="/">Privacy</Link>
            <Link className="hover:text-primary" href="/">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
