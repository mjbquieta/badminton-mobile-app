import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RallyUp - RSVP";
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
        <div
          style={{
            fontSize: 80,
            marginBottom: 20,
            display: "flex",
          }}
        >
          🏸
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: 8,
            display: "flex",
          }}
        >
          RallyUp
        </div>

        <div
          style={{
            fontSize: 32,
            color: "#84CC16",
            fontWeight: 600,
            marginBottom: 32,
            display: "flex",
          }}
        >
          You&apos;re Invited!
        </div>

        <div
          style={{
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.6)",
            display: "flex",
          }}
        >
          Confirm your attendance for the upcoming badminton session
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            padding: "12px 32px",
            borderRadius: 16,
            background: "#84CC16",
            color: "#1a1a2e",
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          RSVP Now
        </div>
      </div>
    ),
    { ...size },
  );
}
