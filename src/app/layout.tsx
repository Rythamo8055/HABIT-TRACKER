
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Life Architect',
  description: 'Architect your best life with AI-powered planning and tracking.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appIconUrl = "https://raw.githubusercontent.com/linuxdotexe/nordic-wallpapers/master/wallpapers/ign_nordic_rose.png";
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
        {/* <meta name="theme-color" content="#1E1E2E" media="(prefers-color-scheme: dark)" /> */}
        <link rel="apple-touch-icon" href={appIconUrl} data-ai-hint="rose art" />
        <link rel="icon" type="image/png" sizes="32x32" href={appIconUrl} data-ai-hint="rose art" />
        <link rel="icon" type="image/png" sizes="16x16" href={appIconUrl} data-ai-hint="rose art" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col no-scrollbar">
        <Image
          src="https://raw.githubusercontent.com/linuxdotexe/nordic-wallpapers/master/wallpapers/ign_astronaut.png"
          alt="Futuristic astronaut overlooking a vibrant cityscape from a high-tech balcony at night."
          layout="fill"
          objectFit="cover"
          quality={75}
          className="-z-10 opacity-30 dark:opacity-20"
          priority
          data-ai-hint="astronaut space"
        />
        <div className="relative z-0 flex flex-col flex-1">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
