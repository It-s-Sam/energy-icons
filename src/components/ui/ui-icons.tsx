import type { SVGProps } from "react";

/**
 * Small stroke glyphs for app chrome (search, theme, close…).
 * These are UI affordances, not part of the Wild Icons library.
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

export const MenuGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M2.75 4.5h10.5M2.75 8h10.5M2.75 11.5h10.5" />
  </Glyph>
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
