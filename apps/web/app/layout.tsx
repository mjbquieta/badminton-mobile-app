import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://rallyup.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "RallyUp - Court Manager for Racket & Paddle Sports",
    template: "%s | RallyUp",
  },
  description:
    "Manage players, automate matchmaking, and run sessions for badminton, pickleball, table tennis, and more.",
  keywords: [
    "badminton",
    "pickleball",
    "table tennis",
    "court manager",
    "matchmaking",
    "player management",
    "racket sports",
    "paddle sports",
    "rally up",
  ],
  authors: [{ name: "RallyUp" }],
  creator: "RallyUp",
  openGraph: {
    title: "RallyUp",
    description:
      "One app for every court. Manage players, matchmaking, and sessions for badminton, pickleball, table tennis, and more.",
    siteName: "RallyUp",
    type: "website",
    locale: "en_US",
    url: appUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "RallyUp",
    description:
      "One app for every court. Manage players, matchmaking, and sessions for badminton, pickleball, table tennis, and more.",
  },
  icons: {
    icon: "/potato-logo.png",
    apple: "/potato-logo.png",
  },
  alternates: {
    canonical: appUrl,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RallyUp",
  applicationCategory: "SportsApplication",
  operatingSystem: "Web",
  description:
    "Manage players, automate matchmaking, and run sessions for badminton, pickleball, table tennis, and more.",
  url: appUrl,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

// Inline script to prevent flash of wrong theme on load
const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('rallyup-theme');
      if (t === 'light') document.documentElement.classList.add('light');
      else if (t === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.classList.add('light');
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-primary text-light-100`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
