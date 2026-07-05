import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LoginSignup from "@/components/LoginSignup";
import FooterSection from "@/components/ui/footer";
import { InteractiveMenu } from "@/components/ui/modern-mobile-menu";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
  openGraph: {
    title: "Jalgaon.com | Local Business Directory & News",
    description: "The professional gateway to North Maharashtra's economic heartbeat.",
    type: "website",
    locale: "en_IN",
    siteName: "Jalgaon.com",
    url: "https://jalgaon.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jalgaon.com | Local Business Directory & News",
    description: "Find services near you or list your business in minutes.",
  },
  alternates: {
    canonical: "https://jalgaon.com",
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
        className="bg-surface text-on-surface font-sans selection:bg-primary/20 min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <LoginSignup />
          <FooterSection />
          <InteractiveMenu />
        </AuthProvider>
      </body>
    </html>
  );
}
