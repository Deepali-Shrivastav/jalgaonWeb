"use client";

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/events', label: 'Events' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/ngo', label: 'NGOs' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isLogin, setIsLoginFormOpen, logout } = useContext(AuthContext);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-hairline-soft">
      <div className="max-w-container-max mx-auto px-xxl flex justify-between items-center h-20">
        <div className="flex items-center gap-4 md:gap-xxxl">
          <Link href="/" className="flex-shrink-0">
            <img 
              alt="Jalgaon.com Logo" 
              className="h-8 w-auto" 
              src="/logo.png" 
            />
          </Link>
          <nav className="hidden md:flex items-center gap-xl" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={
                  isActive(href)
                    ? 'text-primary font-bold py-xxs border-b-2 border-primary'
                    : 'text-secondary hover:text-primary transition-colors font-medium'
                }
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
            <Link href="/add-listing" className="text-secondary hover:text-primary transition-colors font-medium">Add Listing</Link>
            <Link href="/add-event" className="text-secondary hover:text-primary transition-colors font-medium">Add Event</Link>
            <Link href="/advertise" className="text-secondary hover:text-primary transition-colors font-medium">Advertise</Link>
          </nav>
        </div>
         
        <div className="flex items-center gap-base">
          <div className="hidden md:flex items-center gap-base">
            {isLogin ? (
              <div className="flex items-center gap-3">
                <Link href="/account" className="flex items-center gap-2 bg-surface-container-low text-ink-deep px-4 py-2 rounded-full font-bold hover:bg-surface-container-high transition-all">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  Account
                </Link>
                <button 
                  onClick={logout}
                  className="bg-red-500 text-white px-xl py-2 rounded-full font-bold text-sm hover:bg-red-600 transition-all shadow-sm active:scale-95"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginFormOpen(true)}
                className="bg-primary text-white px-xl py-3 rounded-full font-bold text-sm hover:bg-primary-deep transition-all shadow-sm active:scale-95"
              >
                Signup/Login
              </button>
            )}
          </div>
          <button 
            className="md:hidden p-2 text-ink-deep hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center -mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span className="material-symbols-outlined text-[28px]">menu</span>
          </button>
        </div>
      </div>
      </header>
 
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Dashboard */}
      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-[85%] max-w-sm bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Mobile Sidebar"
      >
        <div className="p-xl flex justify-between items-center border-b border-hairline-soft bg-surface/50">
          <button 
            className="p-2 text-ink-deep hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center bg-white shadow-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <img alt="Jalgaon.com Logo" className="h-7 w-auto" src="/logo.png" />
        </div>
        
        <div className="flex-1 overflow-y-auto pb-safe-area">
          <div className="flex flex-col py-2">
            <div className="px-xl py-3 text-xs font-bold text-outline tracking-wider uppercase">Navigation</div>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-xl py-4 flex items-center gap-4 ${
                  isActive(href)
                    ? 'text-primary font-bold bg-primary/5 border-l-4 border-primary'
                    : 'text-secondary hover:bg-surface-container-low border-l-4 border-transparent'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
            
            <div className="px-xl py-3 mt-4 text-xs font-bold text-outline tracking-wider uppercase border-t border-hairline-soft">Services</div>
            <Link
              href="/add-listing"
              className="px-xl py-4 flex items-center gap-4 text-secondary hover:bg-surface-container-low border-l-4 border-transparent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              Add Listing
            </Link>
            <Link
              href="/add-event"
              className="px-xl py-4 flex items-center gap-4 text-secondary hover:bg-surface-container-low border-l-4 border-transparent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">event</span>
              Add Event
            </Link>
            <Link
              href="/advertise"
              className="px-xl py-4 flex items-center gap-4 text-secondary hover:bg-surface-container-low border-l-4 border-transparent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">campaign</span>
              Advertise
            </Link>
          </div>
        </div>

        <div className="p-xl border-t border-hairline-soft bg-surface-container-lowest">
          <div className="flex gap-4 mb-4">
            <button className="flex-1 bg-surface-container-low hover:bg-surface-container-high transition-colors text-ink-deep rounded-xl py-3 flex items-center justify-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              Saved
            </button>
            <button className="flex-1 bg-surface-container-low hover:bg-surface-container-high transition-colors text-ink-deep rounded-xl py-3 flex items-center justify-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              Cart
            </button>
          </div>
          
          {isLogin ? (
            <div className="flex flex-col gap-3">
              <Link 
                href="/account" 
                className="w-full flex justify-center items-center gap-2 bg-primary/10 text-primary py-3.5 rounded-xl font-bold transition-colors hover:bg-primary/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                My Account
              </Link>
              <button 
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-3.5 rounded-xl font-bold transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setIsLoginFormOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-primary-deep transition-all shadow-primary/20"
            >
              Signup / Login
            </button>
          )}
        </div>
      </div>
    </>
  );
}
