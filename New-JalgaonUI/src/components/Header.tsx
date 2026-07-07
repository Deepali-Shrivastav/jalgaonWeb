"use client";

import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/events', label: 'Events' },
  { href: '/blog', label: 'Blog' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/ngo', label: 'NGOs' },
];

export default function Header() {
  const pathname = usePathname();
  const { isLogin, setIsLoginFormOpen, logout } = useContext(AuthContext);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
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
                src="/main-logo.png"
              />
            </Link>
            <nav
              className="hidden md:flex items-center gap-xl"
              aria-label="Main navigation"
            >
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={
                    isActive(href)
                      ? "text-primary font-bold py-xxs border-b-2 border-primary"
                      : "text-secondary hover:text-primary transition-colors font-medium"
                  }
                  aria-current={isActive(href) ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/add-listing"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                Add Listing
              </Link>
              <Link
                href="/add-event"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                Add Event
              </Link>
              <Link
                href="/advertise"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                Advertise
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-base">
            <div className="hidden md:flex items-center gap-base">
              {isLogin ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 bg-surface-container-low text-ink-deep px-4 py-2 rounded-full font-bold hover:bg-surface-container-high transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      person
                    </span>
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
            <div className="md:hidden flex items-center">
              {isLogin ? (
                <Link
                  href="/account"
                  className="flex items-center justify-center w-8 h-8 bg-surface-container-low text-ink-deep rounded-full hover:bg-surface-container-high transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginFormOpen(true)}
                  className="flex items-center justify-center w-8 h-8 bg-surface-container-low text-ink-deep rounded-full hover:bg-surface-container-high transition-all"
                  aria-label="Sign Up or Login"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
