/**
 * Messages between the plugin UI (iframe) and the main thread (code.ts).
 * The UI owns the icon data; the main thread only builds nodes from the SVG it
 * is handed, so it never needs network access.
 */

export type IconWeight = "regular" | "bold";

/** Everything the main thread needs to put one icon on the canvas. */
export type IconPlacement = {
  slug: string;
  name: string;
  weight: IconWeight;
  /** Rendered size in px; the UI has already picked the matching master. */
  size: number;
  /** The master's grid (20 or 48), used as the viewBox. */
  master: number;
  /** Markup inside the master's <svg>, fills still `currentColor`. */
  body: string;
  /** #rrggbb */
  color: string;
};

export type Preferences = {
  size: number;
  weight: IconWeight;
  color: string;
};

export type UiToMain =
  | { type: "insert"; placement: IconPlacement }
  | { type: "save-preferences"; preferences: Preferences }
  | { type: "notify"; message: string; error?: boolean };

export type MainToUi = { type: "preferences"; preferences: Preferences | null };
