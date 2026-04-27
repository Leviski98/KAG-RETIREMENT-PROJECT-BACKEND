/**
 * Brand Colors
 * Source: Brand Guidelines v1
 *
 * Usage:
 * - Import in components for JS/TS usage
 * - CSS variables defined in globals.css for Tailwind usage
 */

// ─── Primary Blue ─────────────────────────────────────────────────────────────

export const PRIMARY = {
  main: "#3377FF",      // Primary brand color
  darker: "#2659BF",    // Hover/pressed states
  lighter: "#99BBFF",   // Light backgrounds, highlights
  subtle: "#D6E4FF",    // Very subtle tint, hover backgrounds
} as const;

// ─── State Colors ─────────────────────────────────────────────────────────────

export const STATE = {
  success: "#06C270",   // Success states, positive indicators
  error: "#FF3B3B",     // Error states, destructive actions
  warning: "#FFCC00",   // Secondary brand color, warnings
  info: "#0063F7",      // Informational states
} as const;

// ─── Dark Colors (Text & UI) ──────────────────────────────────────────────────

export const DARK = {
  1: "#3A3A3C",  // Primary text, darkest backgrounds
  2: "#6B758B",  // Secondary text, subdued labels
  3: "#8F90A6",  // Placeholder text, disabled text
  4: "#C7C9D9",  // Borders, dividers
} as const;

// ─── Light Colors (Backgrounds) ───────────────────────────────────────────────

export const LIGHT = {
  1: "#DDE5E9",  // Light backgrounds, table stripes
  2: "#EBEBF0",  // Card backgrounds
  3: "#F2F2F5",  // Page backgrounds
  4: "#FAFAFC",  // Subtle off-white backgrounds
} as const;

// ─── Combined Export ──────────────────────────────────────────────────────────

export const BRAND_COLORS = {
  primary: PRIMARY,
  state: STATE,
  dark: DARK,
  light: LIGHT,
} as const;

// ─── Semantic Aliases ─────────────────────────────────────────────────────────

export const COLORS = {
  // Primary
  primary: PRIMARY.main,
  primaryHover: PRIMARY.darker,
  primaryLight: PRIMARY.lighter,
  primarySubtle: PRIMARY.subtle,

  // State
  success: STATE.success,
  error: STATE.error,
  warning: STATE.warning,
  info: STATE.info,

  // Text
  textPrimary: DARK[1],
  textSecondary: DARK[2],
  textPlaceholder: DARK[3],
  textDisabled: DARK[3],

  // Borders
  border: DARK[4],
  borderLight: LIGHT[1],

  // Backgrounds
  bgPage: LIGHT[3],
  bgCard: LIGHT[2],
  bgSubtle: LIGHT[4],
  bgMuted: LIGHT[1],
} as const;

export default COLORS;
