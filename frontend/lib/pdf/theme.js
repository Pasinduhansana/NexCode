// NexCodeDocumentTheme — brand-consistent styling tokens for generated PDFs.
// Mirrors the admin panel design system (primary #3699f3, slate neutrals).

export const NexCodeDocumentTheme = {
  brand: {
    name: "NexCode",
    tagline: "Digital Innovations",
    primary: "#3699f3",
    primaryHover: "#298cf0",
    dark: "#1e293b",
    ink: "#111827",
    muted: "#64748b",
    faint: "#94a3b8",
    card: "#fafafc",
    border: "#e4e4e9",
    white: "#ffffff",
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
  },

  page: {
    size: "A4",
    margins: { top: 40, right: 44, bottom: 40, left: 44 },
  },

  type: {
    heading: "Helvetica-Bold",
    body: "Helvetica",
    accent: "Helvetica-Bold",
    small: "Helvetica",
  },

  sizes: {
    docTitle: 24,
    heading: 13,
    subheading: 11,
    body: 9.5,
    small: 8.5,
    tiny: 7.5,
  },

  spacing: {
    contentTop: 96,
    sectionGap: 18,
    rowGap: 8,
    cellPadY: 5,
    cellPadX: 7,
  },
};

export function formatLKR(amount, currency = "LKR") {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${currency} 0.00`;
  return `${currency} ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}