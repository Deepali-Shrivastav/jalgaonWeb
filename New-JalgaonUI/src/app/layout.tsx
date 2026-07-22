import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LoginSignup from "@/components/LoginSignup";
import { Toaster } from "react-hot-toast";
import { InteractiveMenu } from "@/components/ui/modern-mobile-menu";
import EngagementTrigger from "@/components/EngagementTrigger";
import ProfileCompleteModal from "@/components/ProfileCompleteModal";
import FloatingSideButtons from "@/components/FloatingSideButtons";
import Script from "next/script";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://www.jalgaon.com"),
  title: "Jalgaon.com | Local Business Directory & News",
  description: "Find services near you or list your business in minutes. The professional gateway to North Maharashtra's economic heartbeat.",
  keywords: [
    "Jalgaon",
    "Jalgaon business directory",
    "Jalgaon news",
    "Jalgaon local services",
    "Khandesh businesses",
    "North Maharashtra directory"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Jalgaon.com | Local Business Directory & News",
    description: "The professional gateway to North Maharashtra's economic heartbeat.",
    type: "website",
    locale: "en_IN",
    siteName: "Jalgaon.com",
    url: "/",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Jalgaon.com — Local Business Directory & News",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jalgaon.com | Local Business Directory & News",
    description: "Find services near you or list your business in minutes.",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} light scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className="bg-surface text-on-surface font-sans selection:bg-primary/20 min-h-full flex flex-col overflow-x-hidden"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Script
            id="structured-data-root"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "@id": "https://www.jalgaon.com/#organization",
                    "name": "Jalgaon.com",
                    "url": "https://www.jalgaon.com",
                    "logo": {
                      "@type": "ImageObject",
                      "url": "https://www.jalgaon.com/main-logo.png"
                    },
                    "sameAs": [
                      "https://facebook.com/jalgaonWeb",
                      "https://twitter.com/jalgaonWeb",
                      "https://instagram.com/jalgaonWeb"
                    ]
                  },
                  {
                    "@type": "WebSite",
                    "@id": "https://www.jalgaon.com/#website",
                    "url": "https://www.jalgaon.com",
                    "name": "Jalgaon.com",
                    "publisher": { "@id": "https://www.jalgaon.com/#organization" },
                    "potentialAction": {
                      "@type": "SearchAction",
                      "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://www.jalgaon.com/search?q={search_term_string}"
                      },
                      "query-input": "required name=search_term_string"
                    }
                  }
                ]
              })
            }}
          />
          {children}
          <LoginSignup />
          <EngagementTrigger />
          <ProfileCompleteModal />
          <Toaster position="bottom-right" toastOptions={{ className: 'font-sans' }} />
          <InteractiveMenu />
          <FloatingSideButtons />
        </AuthProvider>
      </body>
    </html>
  );
}
