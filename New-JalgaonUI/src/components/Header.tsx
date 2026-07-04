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
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-hairline-soft">
      <div className="max-w-container-max mx-auto px-xxl flex justify-between items-center h-20">
        <div className="flex items-center gap-xxxl">
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
            <Link href="/advertise" className="text-secondary hover:text-primary transition-colors font-medium">Advertise</Link>
          </nav>
        </div>
         
        <div className="flex items-center gap-base">
          <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors p-2 hidden sm:block">favorite</button>
          <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors p-2 hidden sm:block">shopping_cart</button>
          
          {isLogin ? (
            <button 
              onClick={logout}
              className="bg-red-500 text-white px-xl py-3 rounded-full font-bold text-sm hover:bg-red-600 transition-all shadow-sm active:scale-95 hidden sm:block"
            >
              Logout
            </button>
          ) : (
            <button 
              onClick={() => setIsLoginFormOpen(true)}
              className="bg-primary text-white px-xl py-3 rounded-full font-bold text-sm hover:bg-primary-deep transition-all shadow-sm active:scale-95 hidden sm:block"
            >
              Signup/Login
            </button>
          )}
          
          <button 
            className="material-symbols-outlined text-ink-deep p-2 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? 'close' : 'menu'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-xl flex flex-col border-b border-hairline-soft md:hidden z-40">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-xxl py-4 border-b border-hairline-soft ${
                isActive(href)
                  ? 'text-primary font-bold bg-surface-container-low'
                  : 'text-secondary hover:bg-surface-container-low'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/add-listing"
            className="px-xxl py-4 border-b border-hairline-soft text-secondary hover:bg-surface-container-low"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Add Listing
          </Link>
          <Link
            href="/advertise"
            className="px-xxl py-4 border-b border-hairline-soft text-secondary hover:bg-surface-container-low"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Advertise
          </Link>
          <div className="p-xxl flex gap-4 justify-between items-center">
            <div className="flex gap-2">
              <button className="material-symbols-outlined text-secondary p-2">favorite</button>
              <button className="material-symbols-outlined text-secondary p-2">shopping_cart</button>
            </div>
            {isLogin ? (
              <button 
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-red-500 text-white py-3 rounded-full font-bold shadow-sm"
              >
                Logout
              </button>
            ) : (
              <button 
                onClick={() => {
                  setIsLoginFormOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-primary text-white py-3 rounded-full font-bold shadow-sm"
              >
                Signup/Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
