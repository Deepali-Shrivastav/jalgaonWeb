import React from 'react';
import { privacyHtml } from './PrivacyContent';

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div dangerouslySetInnerHTML={{ __html: privacyHtml }} />
      </div>
    </div>
  );
}
