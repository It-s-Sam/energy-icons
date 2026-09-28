import type { SVGProps } from "react";

/**
 * Small stroke glyphs for app chrome (search, theme, close…).
 * These are UI affordances, not part of the Energy Icons library.
 */
type GlyphProps = SVGProps<SVGSVGElement> & { size?: number };

function Glyph({ size = 16, children, ...props }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <circle cx="7" cy="7" r="4.25" />
    <path d="m10.25 10.25 3 3" />
  </Glyph>
);

/** Sidebar panel toggle — rounded frame with a left rail. */
export const SidebarGlyph = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path d="M11 3H13C16.771 3 18.657 3 19.828 4.172C21 5.343 21 7.229 21 11V13C21 16.771 21 18.657 19.828 19.828C18.657 21 16.771 21 13 21H11C7.229 21 5.343 21 4.172 19.828C3 18.657 3 16.771 3 13V11C3 7.229 3 5.343 4.172 4.172C5.343 3 7.229 3 11 3Z" />
    <path d="M8.005 16.005L8.005 8.005" />
  </svg>
);

export const MoonGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M13 9.6A5.25 5.25 0 1 1 6.4 3a4.25 4.25 0 0 0 6.6 6.6Z" />
  </Glyph>
);

export const SunGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <circle cx="8" cy="8" r="2.75" />
    <path d="M8 1.75v1.5M8 12.75v1.5M1.75 8h1.5M12.75 8h1.5M3.6 3.6l1.05 1.05M11.35 11.35l1.05 1.05M3.6 12.4l1.05-1.05M11.35 4.65l1.05-1.05" />
  </Glyph>
);

export const DownloadGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M8 2.75v7.5M4.75 7 8 10.25 11.25 7M3 13.25h10" />
  </Glyph>
);

export const CopyGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <rect x="5.25" y="5.25" width="8" height="8" rx="1.5" />
    <path d="M10.75 5.25V4.25a1.5 1.5 0 0 0-1.5-1.5h-4.5a1.5 1.5 0 0 0-1.5 1.5v4.5a1.5 1.5 0 0 0 1.5 1.5h.5" />
  </Glyph>
);

export const CheckGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="m3.25 8.5 3 3 6.5-7" />
  </Glyph>
);

export const CloseGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="m4 4 8 8M12 4l-8 8" />
  </Glyph>
);

export const GithubGlyph = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
