/**
 * Badminton App Color Palette
 * 
 * A modern, court-inspired color system optimized for:
 * - Fast interactions during live matches
 * - Excellent readability and accessibility (WCAG AA+)
 * - Clear visual hierarchy
 */

export const BadmintonPalette = {
  // Backgrounds (dark mode optimized for OLED screens)
  bg: {
    base: "#0A0A0A",      // Deep black - screen background
    surface: "#141414",   // Cards, modals
    elevated: "#1E1E1E",  // Raised elements, inputs
    border: "#2A2A2A",    // Subtle dividers
  },

  // Primary brand colors - court inspired
  court: {
    deep: "#0B5D3B",      // Deep green (court surface)
    lime: "#84CC16",      // Vibrant lime (shuttlecock motion)
    limeMuted: "#65A30D", // For backgrounds with text overlay
  },

  // Text hierarchy
  text: {
    primary: "#FFFFFF",   // High emphasis
    secondary: "#A3A3A3", // Medium emphasis
    muted: "#666666",     // Low emphasis, placeholders
    onAccent: "#0A0A0A",  // Text on accent backgrounds
  },

  // Semantic accent colors
  accent: {
    primary: "#FFD400",   // Primary CTA, shuttlecock yellow
    success: "#22C55E",   // Confirmations, "End Game", queue ready
    danger: "#EF4444",    // Errors, faults, removals
    info: "#3B82F6",      // Informational states
  },

  // Player skill levels
  levels: {
    beginner: "#22C55E",     // Green - approachable
    intermediate: "#3B82F6", // Blue - progression
    advanced: "#A855F7",     // Purple - skilled
    pro: "#FFD400",          // Gold - elite
  },

  // Status indicators (high visibility for live matches)
  status: {
    inGame: "#EF4444",    // Red - active/urgent
    waiting: "#22C55E",   // Green - ready/queued
    bench: "#666666",     // Gray - idle
  },
} as const;

// Legacy export for backwards compatibility during migration
export const PotatoPalette = {
  bg: {
    primary: BadmintonPalette.bg.base,
    surface: BadmintonPalette.bg.surface,
    border: BadmintonPalette.bg.border,
  },
  text: {
    onDark: BadmintonPalette.text.primary,
    muted: BadmintonPalette.text.secondary,
    placeholder: BadmintonPalette.text.muted,
  },
  accent: {
    gold: BadmintonPalette.accent.primary,
    sprout: BadmintonPalette.accent.success,
    danger: BadmintonPalette.accent.danger,
  },
} as const;
