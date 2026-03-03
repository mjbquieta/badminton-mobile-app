import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://rallyup.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/home", "/draft", "/players/", "/courts", "/history", "/schedule", "/tournament", "/analytics", "/settings", "/admin"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
