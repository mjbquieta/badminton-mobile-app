import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account - RallyUp",
  description:
    "Sign up for RallyUp to manage players, automate matchmaking, and run sessions for badminton, pickleball, table tennis, and more.",
  openGraph: {
    title: "Create Account - RallyUp",
    description:
      "Sign up for RallyUp to manage players, automate matchmaking, and run sessions for badminton, pickleball, table tennis, and more.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
