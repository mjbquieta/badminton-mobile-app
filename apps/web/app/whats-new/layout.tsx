import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What's New - RallyUp",
  description:
    "See the latest features and improvements in RallyUp — tournaments, scheduling, analytics, player profiles, and more.",
  openGraph: {
    title: "What's New - RallyUp",
    description:
      "See the latest features and improvements in RallyUp — tournaments, scheduling, analytics, player profiles, and more.",
  },
};

export default function WhatsNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
