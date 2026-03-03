import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - RallyUp",
  description:
    "Sign in to your RallyUp account to manage players, courts, and sessions.",
  openGraph: {
    title: "Sign In - RallyUp",
    description:
      "Sign in to your RallyUp account to manage players, courts, and sessions.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
