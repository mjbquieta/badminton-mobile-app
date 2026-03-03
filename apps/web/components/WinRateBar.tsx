"use client";

interface WinRateBarProps {
  rate: number;
  size?: "sm" | "md";
}

export function WinRateBar({ rate, size = "md" }: WinRateBarProps) {
  // rate is a decimal 0–1, convert to percentage
  const pct = rate * 100;
  const height = size === "sm" ? "h-1.5" : "h-2";
  const color =
    pct >= 60
      ? "bg-green-400"
      : pct >= 40
        ? "bg-yellow-400"
        : "bg-red-400";

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${height} bg-dark-200 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <span className="text-xs text-light-300 tabular-nums w-9 text-right">
        {Math.round(pct)}%
      </span>
    </div>
  );
}
