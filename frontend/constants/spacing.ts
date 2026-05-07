/**
 * Spacing Scale
 * Source: Brand Guidelines v1
 *
 * Base unit: 8px
 */

export const SPACING = {
  1: "8px",
  2: "16px",
  3: "24px",
  4: "32px",
  5: "40px",
  6: "64px",
  7: "80px",
  8: "96px",
  9: "120px",
} as const;

// ─── Breakpoints ──────────────────────────────────────────────────────────────

export const BREAKPOINTS = {
  mobile: "320px",
  tablet: "768px",
  desktop: "1024px",
  desktopHd: "1440px",
} as const;

// ─── Grid Specifications ──────────────────────────────────────────────────────

export const GRID = {
  desktopHd: { columns: 12, gutter: "30px", columnWidth: "65px" },
  desktop: { columns: 12, gutter: "30px", columnWidth: "56px" },
  tablet: { columns: 6, gutter: "30px", columnWidth: "88px" },
  mobile: { columns: 2, gutter: "30px", columnWidth: "130px" },
} as const;

// ─── Button Sizes ─────────────────────────────────────────────────────────────

export const BUTTON_SIZES = {
  sm: { paddingY: "12px", paddingX: "24px", fontSize: "14px" },
  md: { paddingY: "16px", paddingX: "32px", fontSize: "16px" },
  lg: { paddingY: "16px", paddingX: "48px", fontSize: "18px" },
} as const;

export default SPACING;
