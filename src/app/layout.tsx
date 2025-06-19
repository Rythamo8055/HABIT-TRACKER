import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Life Architect',
  description: 'Architect your best life with AI-powered planning and tracking.',
  manifest: '/manifest.json', // Added manifest
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="application-name" content="Life Architect" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Life Architect" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" /> 
        <meta name="msapplication-TileColor" content="#63FFDA" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#F2F2F2" />
        {/* Placeholder icons for PWA, actual icons should be added to public/icons */}
        <link rel="apple-touch-icon" href="https://placehold.co/180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://placehold.co/32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="https://placehold.co/16x16.png" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
