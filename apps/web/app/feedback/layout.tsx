import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback - RallyUp",
  description:
    "Report bugs, suggest features, or share your thoughts about RallyUp.",
  openGraph: {
    title: "Feedback - RallyUp",
    description:
      "Report bugs, suggest features, or share your thoughts about RallyUp.",
  },
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
