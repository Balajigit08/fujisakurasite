import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalShell from "./components/layout-guard/LayoutGuard";
import { MouseFollower } from "./components/mouse-follower/MouseFollower";
import LenisProvider from "./components/lenis-provider/LenisProvider";
import ScrollEffects from "./components/scroll-effects/ScrollEffects";
import CookieConsent from "./components/cookie-consent/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FujiSakura Technologies - Japan-India - AI, IT, Software Development, SAP, 24/7 Support",

  description:
    "FujiSakura Technologies delivers AI, software development, web and mobile applications, ERP, SAP, cloud, QA, 24/7 technical Support, Translation Support with Japan-India technology expertise.",

  keywords: [
    "FujiSakura Technologies",
    "AI solutions",
    "AI development",
    "artificial intelligence",
    "software development",
    "IT solutions",
    "web development",
    "mobile app development",
    "ERP solutions",
    "SAP services",
    "cloud solutions",
    "QA testing",
    "Japan India IT services",
    "IT outsourcing",
    "offshore development",
  ],

  icons: {
    icon: "/FS-images/Logo-fs.png",
    shortcut: "/FS-images/Logo-fs.png",
    apple: "/FS-images/Logo-fs.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased dark bg-[#071036]`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/FS-images/Logo-fs.png" type="image/png" />
        <link rel="shortcut icon" href="/FS-images/Logo-fs.png" type="image/png" />
        <link rel="apple-touch-icon" href="/FS-images/Logo-fs.png" />
        <link rel="preconnect" href="https://maps.google.com" />
        <link rel="dns-prefetch" href="https://maps.google.com" />
      </head>
      <body
        className={`${inter.variable} antialiased font-sans flex flex-col bg-[#071036] text-white`}
      >
        <LanguageProvider>
          <LenisProvider>
            <ScrollEffects />

            <MouseFollower />

            <ConditionalShell>
              {children}
            </ConditionalShell>
            <CookieConsent />
          </LenisProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}