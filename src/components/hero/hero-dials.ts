"use client";

import { useDialKit, type DialConfig } from "dialkit";
import { useMemo, type CSSProperties } from "react";

import { heroExportLoopSeconds, heroExportValues, readHeroSettings, type HeroSettings } from "./hero-settings";

/*
 * DialKit panels for the hero. The panel UI only renders in development
 * (DialRoot hides itself in production builds), so production always renders
 * these defaults. Tune in the panel, then use its Copy button and paste the
 * values back here (layout) or into design/energy-hero-settings.json (field).
 */

type Values = Readonly<Record<string, unknown>>;

/** A slider: [default, min, max, step]. */
const range = (value: number, min: number, max: number, step: number): [number, number, number, number] => [
  value,
  min,
  max,
  step,
];

// ---------- Layout ----------

/** Handle geometry is in Paper design pixels, relative to the headline box. */
const LAYOUT_DIALS = {
  headline: {
    scale: range(0.82, 0.5, 1.2, 0.01),
    letterSpacing: range(-0.05, -0.12, 0.02, 0.001),
    energyTop: range(-70, -160, 40, 1),
    iconsTop: range(97, 0, 220, 1),
    iconsOpacity: range(0.7, 0, 1, 0.01),
  },
  handles: {
    visible: false,
    dotSize: range(8, 2, 12, 0.5),
    lineWidth: range(1.5, 1, 4, 0.5),
    flat: { x: range(404, 0, 1200, 1), y: range(286, 0, 560, 1), length: range(229, 20, 500, 1), angle: range(0, -180, 180, 0.5) },
    tilted: { x: range(939, 0, 1200, 1), y: range(399, 0, 560, 1), length: range(106, 20, 500, 1), angle: range(-74.5, -180, 180, 0.5) },
  },
  subtitle: {
    size: range(24, 14, 32, 1),
    letterSpacing: range(-0.035, -0.1, 0.05, 0.005),
    lineHeight: range(1.3, 1, 1.8, 0.05),
    maxWidth: range(769, 300, 900, 1),
  },
  button: {
    size: range(15, 12, 28, 1),
    paddingX: range(16, 8, 40, 1),
    paddingY: range(8, 4, 24, 1),
    hoverLift: range(0, 0, 6, 0.5),
    hoverShadow: range(0, 0, 0.5, 0.01),
    hoverFill: range(0.89, 0.7, 1, 0.01),
  },
  spacing: {
    headlineGap: range(14, 0, 120, 1),
    buttonGap: range(19, 0, 60, 1),
    paddingY: range(66, 0, 200, 1),
  },
  nav: {
    size: range(16, 12, 20, 1),
    gap: range(24, 8, 48, 1),
    inset: range(44, 16, 120, 1),
    opacity: range(0.88, 0.4, 1, 0.01),
    _collapsed: true,
  },
} satisfies DialConfig;

type HandleValues = Readonly<{ x: number; y: number; length: number; angle: number }>;

export type HeroLayout = Readonly<{
  handles: Readonly<{ visible: boolean; flat: HandleValues; tilted: HandleValues }>;
  /** CSS custom properties consumed by the .hero rules in globals.css. */
  style: CSSProperties;
}>;

export function useHeroLayoutDials(): HeroLayout {
  const d = useDialKit("Hero layout", LAYOUT_DIALS);
  const style = {
    "--headline-scale": d.headline.scale,
    "--headline-tracking": `${d.headline.letterSpacing}em`,
    "--energy-top": d.headline.energyTop,
    "--icons-top": d.headline.iconsTop,
    "--icons-opacity": d.headline.iconsOpacity,
    "--handle-dot": d.handles.dotSize,
    "--handle-line": d.handles.lineWidth,
    "--subtitle-size": `${d.subtitle.size}px`,
    "--subtitle-tracking": `${d.subtitle.letterSpacing}em`,
    "--subtitle-leading": d.subtitle.lineHeight,
    "--subtitle-width": `${d.subtitle.maxWidth}px`,
    "--button-size": `${d.button.size}px`,
    "--button-px": `${d.button.paddingX}px`,
    "--button-py": `${d.button.paddingY}px`,
    "--button-lift": `${d.button.hoverLift}px`,
    "--button-shadow": d.button.hoverShadow,
    "--button-hover-fill": d.button.hoverFill,
    "--headline-gap": d.spacing.headlineGap,
    "--button-gap": `${d.spacing.buttonGap}px`,
    "--content-py": d.spacing.paddingY,
    "--nav-size": `${d.nav.size}px`,
    "--nav-gap": `${d.nav.gap}px`,
    "--nav-inset": `${d.nav.inset}px`,
    "--nav-opacity": d.nav.opacity,
  } as CSSProperties;
  return { handles: d.handles, style };
}

// ---------- Field (the Toolcraft background) ----------

function num(target: string, fallback: number): number {
  const value = heroExportValues[target];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function str(target: string, fallback: string): string {
  const value = heroExportValues[target];
  return typeof value === "string" ? value : fallback;
}

function colorOpacity(target: string): { hex: string; opacity: number } {
  const value = heroExportValues[target] as { hex?: string; opacity?: number } | undefined;
  return { hex: value?.hex ?? "#FFFFFF", opacity: value?.opacity ?? 100 };
}

type Point = { x: number; y: number };
type MaskRecord = { position: Point; radius: number; stretch: number; rotation: number; feather: number; strength: number };
type FrameRecord = { mediaId: string; position: Point; size: number; rotation: number };

const exportMask = ((heroExportValues["mask.items"] as MaskRecord[] | undefined) ?? [])[0] ?? {
  feather: 40,
  position: { x: 0, y: 0 },
  radius: 40,
  rotation: 0,
  strength: 100,
  stretch: 1,
};
const exportFrames = (heroExportValues["frames.icons"] as FrameRecord[] | undefined) ?? [];
const exportFill = colorOpacity("frames.fill");
const exportBorder = colorOpacity("frames.border");

/** An XY pad for a -1..1 position. DialKit's pad has +y up; the hero's positions have +y down. */
function positionPad(position: Point) {
  return {
    type: "pad" as const,
    x: range(position.x, -1, 1, 0.01),
    y: range(-position.y, -1, 1, 0.01),
    labels: { x: "x", y: "y (up)" },
  };
}

const frameFolders = Object.fromEntries(
  exportFrames.map((frame) => [
    frame.mediaId.replace(/^hero-icon-/, ""),
    {
      position: positionPad(frame.position),
      size: range(frame.size, 40, 240, 1),
      rotation: range(frame.rotation, -45, 45, 1),
      _collapsed: true,
    },
  ]),
);

const FIELD_DIALS = {
  loopSeconds: range(heroExportLoopSeconds, 2, 30, 0.5),
  background: { type: "color" as const, default: str("appearance.background", "#006FFF") },
  grid: {
    shape: { type: "select" as const, options: ["round", "square"], default: str("grid.shape", "square") },
    color: { type: "color" as const, default: str("grid.color", "#FFFFFF") },
    spacing: range(num("grid.spacing", 12), 6, 40, 1),
    dotSize: range(num("grid.dotSize", 2.5), 1, 12, 0.5),
    opacity: range(num("grid.opacity", 24), 0, 100, 1),
    _collapsed: true,
  },
  energy: {
    color: { type: "color" as const, default: str("energy.color", "#CFEBFF") },
    direction: range(num("energy.direction", 90), 0, 360, 1),
    wavelength: range(num("energy.wavelength", 520), 120, 1600, 10),
    intensity: range(num("energy.intensity", 75), 0, 100, 1),
    trailLength: range(num("energy.bandWidth", 38), 5, 100, 1),
    turbulence: range(num("energy.turbulence", 55), 0, 100, 1),
    shimmer: range(num("energy.shimmer", 30), 0, 100, 1),
    wavesPerLoop: range(num("energy.cycles", 2), 1, 6, 1),
    _collapsed: true,
  },
  glow: {
    color: { type: "color" as const, default: str("glow.color", "#8FD0FF") },
    width: range(num("glow.width", 70), 10, 160, 1),
    height: range(num("glow.height", 42), 5, 100, 1),
    intensity: range(num("glow.intensity", 85), 0, 100, 1),
    hotCore: range(num("glow.core", 45), 0, 100, 1),
    dotLift: range(num("glow.dotLift", 60), 0, 100, 1),
    pulse: range(num("glow.pulse", 30), 0, 100, 1),
    pulsesPerLoop: range(num("glow.pulseCount", 2), 1, 4, 1),
    _collapsed: true,
  },
  mask: {
    position: positionPad(exportMask.position),
    radius: range(exportMask.radius, 1, 150, 1),
    stretch: range(exportMask.stretch, 0.1, 4, 0.05),
    rotation: range(exportMask.rotation, -180, 180, 1),
    feather: range(exportMask.feather, 0, 100, 1),
    strength: range(exportMask.strength, 0, 100, 1),
    outsideStrength: range(num("mask.outside", 35), 0, 100, 1),
    _collapsed: true,
  },
  frames: {
    border: { type: "select" as const, options: ["solid", "dashed", "dotted"], default: str("frames.borderStyle", "dashed") },
    fill: { type: "color" as const, default: exportFill.hex },
    fillOpacity: range(exportFill.opacity, 0, 100, 1),
    borderColor: { type: "color" as const, default: exportBorder.hex },
    borderOpacity: range(exportBorder.opacity, 0, 100, 1),
    iconColor: { type: "color" as const, default: str("frames.iconColor", "#FFFFFF") },
    cornerRadius: range(num("frames.radius", 16), 0, 60, 1),
    iconSize: range(num("frames.iconScale", 44), 15, 90, 1),
    float: range(num("frames.float", 8), 0, 24, 1),
    icons: { ...frameFolders, _collapsed: true },
    _collapsed: true,
  },
} satisfies DialConfig;

let colorContext: CanvasRenderingContext2D | null | undefined;

/** DialKit colors may come back as rgb()/hsl(); the renderer wants #rrggbb. */
function toHex(color: string, fallback: string): string {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  if (/^#[0-9a-f]{8}$/i.test(color)) return color.slice(0, 7);
  if (typeof document === "undefined") return fallback;
  colorContext ??= document.createElement("canvas").getContext("2d");
  if (!colorContext) return fallback;
  colorContext.fillStyle = fallback;
  colorContext.fillStyle = color;
  const normalized = colorContext.fillStyle;
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : fallback;
}

type FieldDialValues = {
  loopSeconds: number;
  background: string;
  grid: { shape: string; color: string; spacing: number; dotSize: number; opacity: number };
  energy: {
    color: string;
    direction: number;
    wavelength: number;
    intensity: number;
    trailLength: number;
    turbulence: number;
    shimmer: number;
    wavesPerLoop: number;
  };
  glow: {
    color: string;
    width: number;
    height: number;
    intensity: number;
    hotCore: number;
    dotLift: number;
    pulse: number;
    pulsesPerLoop: number;
  };
  mask: {
    position: Point;
    radius: number;
    stretch: number;
    rotation: number;
    feather: number;
    strength: number;
    outsideStrength: number;
  };
  frames: {
    border: string;
    fill: string;
    fillOpacity: number;
    borderColor: string;
    borderOpacity: number;
    iconColor: string;
    cornerRadius: number;
    iconSize: number;
    float: number;
    icons: Record<string, { position: Point; size: number; rotation: number }>;
  };
};

/** Maps the panel back onto Toolcraft value targets, so the exported readers stay the single source of truth. */
function toToolcraftValues(d: FieldDialValues): Values {
  return {
    ...heroExportValues,
    "appearance.background": toHex(d.background, "#006FFF"),
    "grid.shape": d.grid.shape,
    "grid.color": toHex(d.grid.color, "#FFFFFF"),
    "grid.spacing": d.grid.spacing,
    "grid.dotSize": d.grid.dotSize,
    "grid.opacity": d.grid.opacity,
    "energy.color": toHex(d.energy.color, "#CFEBFF"),
    "energy.direction": d.energy.direction,
    "energy.wavelength": d.energy.wavelength,
    "energy.intensity": d.energy.intensity,
    "energy.bandWidth": d.energy.trailLength,
    "energy.turbulence": d.energy.turbulence,
    "energy.shimmer": d.energy.shimmer,
    "energy.cycles": d.energy.wavesPerLoop,
    "glow.color": toHex(d.glow.color, "#8FD0FF"),
    "glow.width": d.glow.width,
    "glow.height": d.glow.height,
    "glow.intensity": d.glow.intensity,
    "glow.core": d.glow.hotCore,
    "glow.dotLift": d.glow.dotLift,
    "glow.pulse": d.glow.pulse,
    "glow.pulseCount": d.glow.pulsesPerLoop,
    "mask.items": [
      {
        feather: d.mask.feather,
        position: { x: d.mask.position.x, y: -d.mask.position.y },
        radius: d.mask.radius,
        rotation: d.mask.rotation,
        strength: d.mask.strength,
        stretch: d.mask.stretch,
      },
    ],
    "mask.outside": d.mask.outsideStrength,
    "frames.borderStyle": d.frames.border,
    "frames.fill": { hex: toHex(d.frames.fill, "#FFFFFF"), opacity: d.frames.fillOpacity },
    "frames.border": { hex: toHex(d.frames.borderColor, "#FFFFFF"), opacity: d.frames.borderOpacity },
    "frames.iconColor": toHex(d.frames.iconColor, "#FFFFFF"),
    "frames.radius": d.frames.cornerRadius,
    "frames.iconScale": d.frames.iconSize,
    "frames.float": d.frames.float,
    "frames.icons": exportFrames.map((frame) => {
      const dial = d.frames.icons[frame.mediaId.replace(/^hero-icon-/, "")];
      return dial
        ? {
            mediaId: frame.mediaId,
            position: { x: dial.position.x, y: -dial.position.y },
            rotation: dial.rotation,
            size: dial.size,
          }
        : frame;
    }),
  };
}

/** Shared by the hero and the library backdrop: both mounts read the one "hero-field" panel. */
export function useHeroFieldDials(): HeroSettings {
  const d = useDialKit("Hero field", FIELD_DIALS, { defaultCollapsed: true, id: "hero-field" }) as unknown as FieldDialValues;
  return useMemo(() => readHeroSettings(toToolcraftValues(d), d.loopSeconds), [d]);
}
