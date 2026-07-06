import React from 'react';

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-24 px-6">
      <div className="max-w-4xl mx-auto text-ink-deep font-sans">
        <h1 className="text-4xl font-extrabold mb-8">Terms of Service</h1>
        <p className="text-sm text-secondary mb-8">Last updated: October 2023</p>
        
        <p className="mb-6 leading-relaxed">
          Welcome to Jalgaon.com! These terms and conditions outline the rules and regulations for the use of our directory and community platform.
        </p>
        <p className="mb-8 leading-relaxed">
          By accessing this website we assume you accept these terms and conditions. Do not continue to use Jalgaon.com if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">1. Use of the Platform</h2>
        <p className="mb-6 leading-relaxed">
          Our platform provides a business directory and local news for the Jalgaon region. You agree to use the platform only for lawful purposes. You must not use our website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.
        </p>
        <ul className="list-disc pl-6 mb-8 space-y-2 leading-relaxed">
          <li>Republishing material from Jalgaon.com without permission.</li>
          <li>Selling, renting, or sub-licensing material from the platform.</li>
          <li>Reproducing, duplicating, or copying material from Jalgaon.com.</li>
          <li>Using the website to distribute malicious software or spam.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">2. Business Listings & Accounts</h2>
        <p className="mb-6 leading-relaxed">
          When you create an account or submit a business listing on our platform, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
        </p>
        <p className="mb-8 leading-relaxed">
          Businesses are entirely responsible for the accuracy of their listings. We reserve the right to remove any listing that violates our guidelines, contains misleading information, or receives excessive negative feedback indicating fraud.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">3. Content Liability</h2>
        <p className="mb-8 leading-relaxed">
          We shall not be hold responsible for any content that appears on your business listing or external links. You agree to protect and defend us against all claims that is rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">4. Changes to Terms</h2>
        <p className="mb-8 leading-relaxed">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
        </p>

        <div className="mt-16 pt-8 border-t border-hairline-soft">
          <p className="text-sm text-secondary">If you have any questions about these Terms, please contact us at support@jalgaon.com.</p>
        </div>
      </div>
    </div>
  );
}
