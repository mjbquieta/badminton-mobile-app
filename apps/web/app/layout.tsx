import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smash Potatoes - Court Manager",
  description: "Manage players, courts, and matchmaking for badminton sessions",
};

// Inline script to prevent flash of wrong theme on load
const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('smash-potatoes-theme');
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
