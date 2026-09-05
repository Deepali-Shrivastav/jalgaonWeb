import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-hairline-soft pt-8 sm:pt-section pb-24 md:pb-xl">
      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-xxl">
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-section mb-section">
          <div className="space-y-xl">
            <img
              alt="Jalgaon.com Logo"
              className="h-8 w-auto"
              src="/main-logo.png"
            />
            <p className="text-secondary leading-relaxed">
              The definitive guide to Jalgaon&apos;s vibrant business landscape,
              community news, and essential local services since 1995.
            </p>
            <div className="flex gap-base">
              <a
                className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-xl">
                  public
                </span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-xl">
                  person
                </span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-ink-deep mb-xl">Explore</h4>
            <ul className="space-y-base">
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/jalgaon-glimpse"
                >
                  Jalgaon Glimpse
                </Link>
              </li>
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/news"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/events"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/blog"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/ngo"
                >
                  NGOs
                </Link>
              </li>
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/jobs"
                >
                  Jobs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-ink-deep mb-xl">Services</h4>
            <ul className="space-y-base">
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/search"
                >
                  Business Directory
                </Link>
              </li>
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/add-listing"
                >
                  Premium Listings
                </Link>
              </li>
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/advertise"
                >
                  Advertising
                </Link>
              </li>
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/news"
                >
                  Local News
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-ink-deep mb-xl">Support</h4>
            <ul className="space-y-base">
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/terms"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  className="text-secondary hover:text-primary transition-colors"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 sm:pt-xl sm:border-t sm:border-hairline-soft flex flex-col md:flex-row justify-between items-center gap-base">
          <img
            alt="Jalgaon.com Logo"
            className="h-8 w-auto sm:hidden mb-2"
            src="/main-logo.png"
          />
          <p className="text-secondary text-sm">
            © 1995-2026 Jalgaon.com. All Rights Reserved.
          </p>
          <div className="flex items-center gap-xl text-xs font-bold text-secondary uppercase tracking-widest">
            <Link className="hover:text-primary" href="/terms">
              Terms
            </Link>
            <Link className="hover:text-primary" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-primary" href="/privacy#cookies">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
