/**
 * Typography Scale
 * Source: Brand Guidelines v1
 *
 * Primary Font: Mulish (Google Font)
 * Weights: Regular (400), Semibold (600), Bold (700), Extra Bold (800)
 */

// ─── Font Family ──────────────────────────────────────────────────────────────

export const FONT_FAMILY = {
  primary: "var(--font-mulish, 'Mulish', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
  mono: "var(--font-geist-mono, 'Geist Mono', 'Fira Code', monospace)",
} as const;

// ─── Font Sizes ───────────────────────────────────────────────────────────────

export const FONT_SIZE = {
  // Display (Extra Light)
  display1: "48px",      // Hero headlines, splash screens
  display2: "40px",      // Section hero titles

  // Headings (Bold)
  h1: "44px",            // Page titles
  h2: "36px",            // Section headings
  h3: "28px",            // Sub-section headings
  h4: "24px",            // Card titles, panel headers
  h5: "20px",            // Widget titles
  h6: "16px",            // Small labels, caption headings

  // Body
  lead: "22px",          // Introductory paragraphs
  bodyLg: "20px",        // Primary body copy
  bodyMd: "18px",        // Standard body copy
  body: "16px",          // Default UI text
  bodySm: "14px",        // Secondary/helper text

  // Labels
  labelXl: "18px",       // Prominent labels
  labelLg: "16px",       // Large labels
  label: "14px",         // Standard labels
  labelSm: "12px",       // Small labels
  labelXs: "10px",       // Micro labels
} as const;

// ─── Font Weights ─────────────────────────────────────────────────────────────

export const FONT_WEIGHT = {
  light: 300,
  regular: 400,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

// ─── Line Heights ─────────────────────────────────────────────────────────────

export const LINE_HEIGHT = {
  tight: 1.3,      // Headings, display text
  normal: 1.6,     // Lead paragraphs
  relaxed: 1.7,    // Body text
} as const;

// ─── Text Hierarchy Presets ───────────────────────────────────────────────────

export const TEXT_STYLES = {
  display1: {
    fontSize: FONT_SIZE.display1,
    fontWeight: FONT_WEIGHT.light,
    lineHeight: LINE_HEIGHT.tight,
  },
  display2: {
    fontSize: FONT_SIZE.display2,
    fontWeight: FONT_WEIGHT.light,
    lineHeight: LINE_HEIGHT.tight,
  },
  h1: {
    fontSize: FONT_SIZE.h1,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: LINE_HEIGHT.tight,
  },
  h2: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: LINE_HEIGHT.tight,
  },
  h3: {
    fontSize: FONT_SIZE.h3,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: LINE_HEIGHT.tight,
  },
  h4: {
    fontSize: FONT_SIZE.h4,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: LINE_HEIGHT.tight,
  },
  h5: {
    fontSize: FONT_SIZE.h5,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: LINE_HEIGHT.tight,
  },
  h6: {
    fontSize: FONT_SIZE.h6,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: LINE_HEIGHT.tight,
  },
  lead: {
    fontSize: FONT_SIZE.lead,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: LINE_HEIGHT.normal,
  },
  bodyLg: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: LINE_HEIGHT.relaxed,
  },
  bodyMd: {
    fontSize: FONT_SIZE.bodyMd,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: LINE_HEIGHT.relaxed,
  },
  body: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: LINE_HEIGHT.relaxed,
  },
  bodySm: {
    fontSize: FONT_SIZE.bodySm,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: LINE_HEIGHT.relaxed,
  },
} as const;

export default TEXT_STYLES;
