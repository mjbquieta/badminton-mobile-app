import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RallyUp - Court Manager for Racket & Paddle Sports";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Sport emojis */}
        <div
          style={{
            fontSize: 56,
            marginBottom: 20,
            display: "flex",
            gap: 16,
          }}
        >
          <span>{"\u{1F3F8}"}</span>
          <span>{"\u{1F3D3}"}</span>
          <span>{"\u{1F3D3}"}</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: 8,
            display: "flex",
          }}
        >
          RallyUp
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#84CC16",
            fontWeight: 600,
            marginBottom: 24,
            display: "flex",
          }}
        >
          One app for every court.
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.6)",
            display: "flex",
          }}
        >
          Badminton &bull; Pickleball &bull; Table Tennis &bull; And More
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 36,
          }}
        >
          {["Matchmaking", "Rankings", "RSVP", "Analytics", "Live Sync"].map(
            (f) => (
              <div
                key={f}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  background: "rgba(132, 204, 22, 0.15)",
                  color: "#84CC16",
                  fontSize: 16,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {f}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
