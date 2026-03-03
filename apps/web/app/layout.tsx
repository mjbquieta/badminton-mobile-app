import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://rallyup.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "RallyUp - Court Manager for Racket & Paddle Sports",
  description: "Manage players, automate matchmaking, and run sessions for badminton, pickleball, table tennis, and more.",
  openGraph: {
    title: "RallyUp",
    description: "One app for every court. Manage players, matchmaking, and sessions for badminton, pickleball, table tennis, and more.",
    siteName: "RallyUp",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RallyUp",
    description: "One app for every court. Manage players, matchmaking, and sessions for badminton, pickleball, table tennis, and more.",
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
      </head>
      <body className={`${inter.className} bg-primary text-light-100`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
