// Adapted from Toolcraft's hero renderer (MIT, Copyright (c) 2026 Pixel Point). See THIRD_PARTY_NOTICES.md.
/**
 * Reads the Toolcraft export in design/energy-hero-settings.json into the typed
 * settings the hero renderer consumes. Ported from Toolcraft's hero-values.ts:
 * the fallbacks match the Toolcraft defaults, so a missing key renders the same
 * as it did in the app.
 */
import exported from "../../../design/energy-hero-settings.json";

export type Rgb = readonly [number, number, number];

export type HeroFieldSettings = Readonly<{
  dotColor: Rgb;
  dotOpacity: number;
  dotSize: number;
  energyBandWidth: number;
  energyColor: Rgb;
  energyCycles: number;
  energyDirectionDegrees: number;
  energyIntensity: number;
  energyShimmer: number;
  energyTurbulence: number;
  energyWavelength: number;
  glowColor: Rgb;
  glowCore: number;
  glowDotLift: number;
  glowHeight: number;
  glowIntensity: number;
  glowPulse: number;
  glowPulseCount: number;
  glowWidth: number;
  maskOutside: number;
  shape: "round" | "square";
  spacing: number;
}>;

export type HeroFrameStyle = Readonly<{
  border: Readonly<{ hex: string; opacity: number }>;
  borderStyle: "dashed" | "dotted" | "solid";
  fill: Readonly<{ hex: string; opacity: number }>;
  float: number;
  iconColor: string;
  iconScale: number;
  radius: number;
}>;

export type HeroFrame = Readonly<{
  /** Icon file name from the export, served from /public/hero. */
  fileName: string;
  index: number;
  /** Placement below the mobile breakpoint, clear of the headline. */
  mobilePosition: Readonly<{ x: number; y: number }>;
  position: Readonly<{ x: number; y: number }>;
  rotation: number;
  size: number;
}>;

/** Below `breakpoint` (hero width, CSS px) frames use their mobile positions, scaled and faded. */
export type HeroMobileFrames = Readonly<{
  breakpoint: number;
  opacity: number;
  scale: number;
}>;

export type HeroSettings = Readonly<{
  background: string;
  field: HeroFieldSettings;
  frames: readonly HeroFrame[];
  frameStyle: HeroFrameStyle;
  loopSeconds: number;
  masks: unknown;
  mobileFrames: HeroMobileFrames;
  /** Loop time (seconds) of the frame the export was saved on; the reduced-motion still. */
  stillSeconds: number;
}>;

type Values = Readonly<Record<string, unknown>>;

function readNumber(values: Values, target: string, fallback: number): number {
  const value = values[target];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readString<T extends string>(values: Values, target: string, allowed: readonly T[], fallback: T): T {
  const value = values[target];
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function readHex(values: Values, target: string, fallback: string): string {
  const value = values[target];
  if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) return value;
  if (typeof value === "object" && value !== null && typeof (value as { hex?: unknown }).hex === "string") {
    return readHex({ v: (value as { hex: string }).hex }, "v", fallback);
  }
  return fallback;
}

function readColorOpacity(
  values: Values,
  target: string,
  fallback: Readonly<{ hex: string; opacity: number }>,
): Readonly<{ hex: string; opacity: number }> {
  const value = values[target];
  if (typeof value !== "object" || value === null) return fallback;
  const record = value as { hex?: unknown; opacity?: unknown };
  return {
    hex: readHex({ v: record.hex }, "v", fallback.hex),
    opacity:
      typeof record.opacity === "number" && Number.isFinite(record.opacity)
        ? Math.min(100, Math.max(0, record.opacity))
        : fallback.opacity,
  };
}

export function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function readFieldSettings(values: Values): HeroFieldSettings {
  const spacing = readNumber(values, "grid.spacing", 12);
  return {
    dotColor: hexToRgb(readHex(values, "grid.color", "#FFFFFF")),
    dotOpacity: readNumber(values, "grid.opacity", 24) / 100,
    dotSize: Math.min(spacing, readNumber(values, "grid.dotSize", 2.5)),
    energyBandWidth: readNumber(values, "energy.bandWidth", 38) / 100,
    energyColor: hexToRgb(readHex(values, "energy.color", "#CFEBFF")),
    energyCycles: Math.max(1, Math.round(readNumber(values, "energy.cycles", 2))),
    energyDirectionDegrees: readNumber(values, "energy.direction", 90),
    energyIntensity: readNumber(values, "energy.intensity", 75) / 100,
    energyShimmer: readNumber(values, "energy.shimmer", 30) / 100,
    energyTurbulence: readNumber(values, "energy.turbulence", 55) / 100,
    energyWavelength: readNumber(values, "energy.wavelength", 520),
    glowColor: hexToRgb(readHex(values, "glow.color", "#8FD0FF")),
    glowCore: readNumber(values, "glow.core", 45) / 100,
    glowDotLift: readNumber(values, "glow.dotLift", 60) / 100,
    glowHeight: readNumber(values, "glow.height", 42) / 100,
    glowIntensity: readNumber(values, "glow.intensity", 85) / 100,
    glowPulse: readNumber(values, "glow.pulse", 30) / 100,
    glowPulseCount: Math.max(1, Math.round(readNumber(values, "glow.pulseCount", 2))),
    glowWidth: readNumber(values, "glow.width", 70) / 100,
    maskOutside: readNumber(values, "mask.outside", 35) / 100,
    shape: readString(values, "grid.shape", ["round", "square"], "round"),
    spacing,
  };
}

function readFrameStyle(values: Values): HeroFrameStyle {
  return {
    border: readColorOpacity(values, "frames.border", { hex: "#FFFFFF", opacity: 45 }),
    borderStyle: readString(values, "frames.borderStyle", ["dashed", "dotted", "solid"], "dashed"),
    fill: readColorOpacity(values, "frames.fill", { hex: "#FFFFFF", opacity: 14 }),
    float: readNumber(values, "frames.float", 8),
    iconColor: readHex(values, "frames.iconColor", "#FFFFFF"),
    iconScale: readNumber(values, "frames.iconScale", 44) / 100,
    radius: readNumber(values, "frames.radius", 16),
  };
}

type Attachment = Readonly<{ asset?: { fileName?: unknown; id?: unknown; sourceTarget?: unknown } }>;
type FrameRecord = Readonly<{
  mediaId?: unknown;
  mobilePosition?: unknown;
  position?: unknown;
  rotation?: unknown;
  size?: unknown;
}>;

function readPosition(value: unknown): Readonly<{ x: number; y: number }> {
  if (typeof value === "object" && value !== null) {
    const { x, y } = value as { x?: unknown; y?: unknown };
    if (typeof x === "number" && typeof y === "number" && Number.isFinite(x + y)) return { x, y };
  }
  return { x: 0, y: -0.5 };
}

/** Joins the attached icon files (order, file name) with their frame settings by media id. */
function readFrames(values: Values, attachments: readonly Attachment[]): readonly HeroFrame[] {
  const records = Array.isArray(values["frames.icons"]) ? (values["frames.icons"] as readonly FrameRecord[]) : [];
  const byId = new Map(
    records.filter((record) => typeof record?.mediaId === "string").map((record) => [record.mediaId as string, record]),
  );
  return attachments
    .map((attachment) => attachment.asset)
    .filter(
      (asset): asset is { fileName: string; id: string; sourceTarget: string } =>
        asset?.sourceTarget === "frames.icons" && typeof asset.fileName === "string" && typeof asset.id === "string",
    )
    .map((asset, index) => {
      const record = byId.get(asset.id);
      const position = readPosition(record?.position);
      return {
        fileName: asset.fileName,
        index,
        mobilePosition: record?.mobilePosition === undefined ? position : readPosition(record.mobilePosition),
        position,
        rotation: typeof record?.rotation === "number" ? record.rotation : 0,
        size: typeof record?.size === "number" ? record.size : 96,
      };
    });
}

/** The exported Toolcraft values, keyed by control target (e.g. "grid.spacing"). */
export const heroExportValues = exported.values as Values;

export const heroExportLoopSeconds = exported.timeline.durationSeconds > 0 ? exported.timeline.durationSeconds : 10;

/** Builds renderer settings from Toolcraft-style values; the dials pass edited copies of the export. */
export function readHeroSettings(values: Values, loopSeconds = heroExportLoopSeconds): HeroSettings {
  return {
    background: readHex(values, "appearance.background", "#006AF5"),
    field: readFieldSettings(values),
    frames: readFrames(values, exported.attachments),
    frameStyle: readFrameStyle(values),
    loopSeconds,
    masks: values["mask.items"],
    mobileFrames: {
      breakpoint: readNumber(values, "frames.mobileBreakpoint", 768),
      opacity: Math.min(1, Math.max(0, readNumber(values, "frames.mobileOpacity", 60) / 100)),
      scale: Math.max(0.1, readNumber(values, "frames.mobileScale", 58) / 100),
    },
    stillSeconds: exported.timeline.currentTimeSeconds % loopSeconds,
  };
}

export const heroSettings = readHeroSettings(heroExportValues);
