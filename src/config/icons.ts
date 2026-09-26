/**
 * Icon system configuration — the single source of truth for sizing rules.
 *
 * Every icon ships two optically designed masters:
 *   - the 20 master (20×20 grid, drawn with a 1px stroke) for small sizes
 *   - the 48 master (48×48 grid, drawn with a 2px stroke) for large sizes
 *
 * Masters are only ever scaled proportionally (width/height). Path data is
 * never edited, strokes are never re-weighted and non-scaling-stroke is never
 * used.
 */

/**
 * Optical master breakpoint, in px.
 * Sizes BELOW this use the 20 master; sizes AT OR ABOVE it use the 48 master.
 * Change this one number to move the switch-over point everywhere
 * (the <Icon> component, the detail view, copy/download and the docs).
 */
export const OPTICAL_MASTER_BREAKPOINT = 32;

/** The two masters every icon must provide, as `/icons/<slug>/<master>.svg`. */
export const ICON_MASTERS = [20, 48] as const;
export type IconMaster = (typeof ICON_MASTERS)[number];

/** Stroke weight each master was originally drawn with (documentation only). */
export const MASTER_STROKE_PX: Record<IconMaster, number> = { 20: 1, 48: 2 };

/** Display / export sizes offered in the UI. */
export const SUPPORTED_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64] as const;
export type IconSize = (typeof SUPPORTED_SIZES)[number];

/** Size used by <Icon> when none is given, and the grid's initial size. */
export const DEFAULT_ICON_SIZE: IconSize = 24;

/** Pick the optical master for a rendered size. */
export function getMasterForSize(size: number): IconMaster {
  return size < OPTICAL_MASTER_BREAKPOINT ? 20 : 48;
}

/** Supported sizes served by a given master (derived from the breakpoint). */
export function getSizesForMaster(master: IconMaster): IconSize[] {
  return SUPPORTED_SIZES.filter((size) => getMasterForSize(size) === master);
}

/** Snap any number to the nearest supported size. */
export function snapToSupportedSize(value: number): IconSize {
  let best: IconSize = SUPPORTED_SIZES[0];
  for (const size of SUPPORTED_SIZES) {
    if (Math.abs(size - value) < Math.abs(best - value)) best = size;
  }
  return best;
}
