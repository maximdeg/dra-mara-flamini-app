/**
 * Shared, brand-styled HTML shell + building blocks for the Patient emails.
 *
 * Email clients ignore `<style>` blocks and CSS custom properties, so every
 * value is inlined and the palette hex below is copied from the design tokens in
 * app/globals.css (keep in sync). Layout is table-based for client support.
 */

/** Palette — copied from the `--brand*` / neutral tokens in app/globals.css. */
const COLOR = {
  brand: "#ba8c84",
  brandDark: "#9e7162",
  brandSoft: "#f7e8e4",
  pageBg: "#fff3f0",
  surface: "#ffffff",
  text: "#111827",
  textMuted: "#4b5563",
  border: "#e5e7eb",
} as const;

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const BRAND_NAME = "Dra. Mara Flamini · Dermatología";

/** Escape text/attribute values so dynamic content can't break the HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;font-weight:700;color:${COLOR.text};">${escapeHtml(
    text,
  )}</h1>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${COLOR.textMuted};">${escapeHtml(
    text,
  )}</p>`;
}

export interface DetailRow {
  label: string;
  value: string;
}

/** A label/value table for the Appointment summary. */
export function detailTable(rows: DetailRow[]): string {
  const body = rows
    .map(
      (row) => `<tr>
      <td style="padding:8px 12px 8px 0;font-size:13px;color:${COLOR.textMuted};width:42%;vertical-align:top;">${escapeHtml(
        row.label,
      )}</td>
      <td style="padding:8px 0;font-size:14px;color:${COLOR.text};font-weight:600;vertical-align:top;">${escapeHtml(
        row.value,
      )}</td>
    </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${COLOR.border};border-bottom:1px solid ${COLOR.border};margin:0 0 20px;">${body}</table>`;
}

/** A bulletproof, brand-coloured CTA button. */
export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 16px;">
    <tr><td style="border-radius:8px;background:${COLOR.brandDark};">
      <a href="${escapeHtml(
        href,
      )}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(
        label,
      )}</a>
    </td></tr>
  </table>`;
}

/** A soft-background block for the clinic address. */
export function addressBlock(address: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 0;">
    <tr><td style="padding:14px 16px;background:${COLOR.brandSoft};border-radius:8px;">
      <div style="font-size:12px;font-weight:700;color:${COLOR.text};text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Dirección</div>
      <div style="font-size:14px;line-height:1.5;color:${COLOR.text};">${escapeHtml(
        address,
      )}</div>
    </td></tr>
  </table>`;
}

/** Wrap inner content in the branded shell (header bar + card + footer). */
export function renderEmailLayout(contentHtml: string): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(BRAND_NAME)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.pageBg};font-family:${FONT};color:${COLOR.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.pageBg};">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:${COLOR.surface};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background:${COLOR.brand};padding:20px 28px;">
          <span style="font-size:16px;font-weight:700;color:#ffffff;">${escapeHtml(
            BRAND_NAME,
          )}</span>
        </td></tr>
        <tr><td style="padding:28px;">${contentHtml}</td></tr>
        <tr><td style="padding:18px 28px;background:${COLOR.brandSoft};border-top:1px solid ${COLOR.border};">
          <span style="font-size:12px;color:${COLOR.textMuted};">${escapeHtml(
            BRAND_NAME,
          )}</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export { BRAND_NAME };
