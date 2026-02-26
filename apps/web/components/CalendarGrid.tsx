"use client";

import type { ScheduledSession } from "@badminton/types";

type CalendarGridProps = {
  year: number;
  month: number; // 0-indexed
  sessions: ScheduledSession[];
  onDayClick?: (date: string) => void;
  onSessionClick?: (session: ScheduledSession) => void;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({ year, month, sessions, onDayClick, onSessionClick }: CalendarGridProps) {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Build session lookup by date
  const sessionsByDate = new Map<string, ScheduledSession[]>();
  for (const s of sessions) {
    const existing = sessionsByDate.get(s.date) ?? [];
    existing.push(s);
    sessionsByDate.set(s.date, existing);
  }

  // Build grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-[10px] sm:text-xs font-medium text-light-300 py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-dark-100 rounded-xl overflow-hidden border border-dark-100">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={idx} className="bg-secondary min-h-[60px] sm:min-h-[80px]" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const daySessions = sessionsByDate.get(dateStr) ?? [];

          return (
            <div
              key={idx}
              className="bg-secondary min-h-[60px] sm:min-h-[80px] p-1 cursor-pointer hover:bg-dark-200/30 transition-colors"
              onClick={() => onDayClick?.(dateStr)}
            >
              <span
                className={`text-[10px] sm:text-xs inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                  isToday
                    ? "bg-accent text-primary font-bold"
                    : "text-light-200"
                }`}
              >
                {day}
              </span>
              {daySessions.length > 0 && (
                <div className="mt-0.5 space-y-0.5">
                  {daySessions.slice(0, 2).map((s) => (
                    <button
                      key={s.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionClick?.(s);
                      }}
                      className="block w-full text-left px-1 py-0.5 rounded text-[9px] sm:text-[10px] bg-accent/10 text-accent truncate hover:bg-accent/20 transition-colors"
                    >
                      {s.title}
                    </button>
                  ))}
                  {daySessions.length > 2 && (
                    <span className="text-[9px] text-light-300 px-1">
                      +{daySessions.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
