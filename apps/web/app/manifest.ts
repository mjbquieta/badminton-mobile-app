import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RallyUp - Court Manager for Racket & Paddle Sports",
    short_name: "RallyUp",
    description:
      "Manage players, automate matchmaking, and run sessions for badminton, pickleball, table tennis, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#141420",
    theme_color: "#84CC16",
    icons: [
      {
        src: "/potato-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/potato-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
