// Adapted from Toolcraft's hero renderer (MIT, Copyright (c) 2026 Pixel Point). See THIRD_PARTY_NOTICES.md.

import { getTintedHeroIcon } from "./icon-cache";
import type { HeroFrame, HeroFrameStyle } from "./hero-settings";

/** Icon files live in /public/hero, matched to the exported settings by file name. */
export function heroIconUrl(frame: Pick<HeroFrame, "fileName">): string {
  return `/hero/${frame.fileName}`;
}

export type HeroFramesInput = Readonly<{
  cssHeight: number;
  cssWidth: number;
  frames: readonly HeroFrame[];
  pixelRatio: number;
  progress: number;
  style: HeroFrameStyle;
}>;

const BORDER_WIDTH = 1.5;

function rgba(hex: string, opacity: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${opacity / 100})`;
}

function dashFor(style: HeroFrameStyle["borderStyle"]): number[] {
  if (style === "dashed") return [7, 5];
  if (style === "dotted") return [0.01, 4.5];
  return [];
}

const TAU = 2 * Math.PI;
/** Golden-ratio phase spacing keeps neighbouring frames out of step. */
const PHASE_STEP = 0.618034;
/** Degrees of tilt per pixel of float, so the sway scales with the drift. */
const TILT_PER_PIXEL = 0.3;

/**
 * Soft "floating in space" motion: a slow figure-of-eight drift (one horizontal and
 * two vertical cycles per loop) plus a gentle tilt, each frame on its own phase.
 * Every term is a whole number of cycles per loop, so the loop stays seamless.
 */
export function getHeroFrameMotion(
  frame: Pick<HeroFrame, "index">,
  float: number,
  progress: number,
): Readonly<{ rotation: number; x: number; y: number }> {
  const phase = frame.index * PHASE_STEP;
  return {
    rotation: float * TILT_PER_PIXEL * Math.sin(TAU * (progress + phase + 0.37)),
    x: float * 0.6 * Math.sin(TAU * (progress + phase)),
    y: float * Math.sin(TAU * (2 * progress + phase * 1.7)) * 0.5 + float * 0.5 * Math.cos(TAU * (progress + phase)),
  };
}

/** Center of a frame in local CSS pixels; position is the screen-space pad value (-1..1, y down). */
export function getHeroFrameCenter(
  frame: HeroFrame,
  input: Pick<HeroFramesInput, "cssHeight" | "cssWidth" | "progress" | "style">,
): Readonly<{ x: number; y: number }> {
  const motion = getHeroFrameMotion(frame, input.style.float, input.progress);
  return {
    x: ((frame.position.x + 1) / 2) * input.cssWidth + motion.x,
    y: ((frame.position.y + 1) / 2) * input.cssHeight + motion.y,
  };
}

/** Frame rotation in degrees, including the floating tilt. */
export function getHeroFrameRotation(
  frame: HeroFrame,
  input: Pick<HeroFramesInput, "progress" | "style">,
): number {
  return frame.rotation + getHeroFrameMotion(frame, input.style.float, input.progress).rotation;
}

/** Draws every frame into a context whose transform maps local CSS pixels. */
export function drawHeroFrames(context: CanvasRenderingContext2D, input: HeroFramesInput): void {
  const { style } = input;
  for (const frame of input.frames) {
    const center = getHeroFrameCenter(frame, input);
    const size = frame.size;
    const half = size / 2;
    const radius = Math.min(style.radius, half);

    context.save();
    context.translate(center.x, center.y);
    context.rotate((getHeroFrameRotation(frame, input) * Math.PI) / 180);

    context.beginPath();
    context.roundRect(-half, -half, size, size, radius);
    context.fillStyle = rgba(style.fill.hex, style.fill.opacity);
    context.fill();

    if (style.border.opacity > 0) {
      const inset = BORDER_WIDTH / 2;
      context.beginPath();
      context.roundRect(
        -half + inset,
        -half + inset,
        size - BORDER_WIDTH,
        size - BORDER_WIDTH,
        Math.max(0, radius - inset),
      );
      context.lineWidth = BORDER_WIDTH;
      context.lineCap = "round";
      context.setLineDash(dashFor(style.borderStyle));
      context.strokeStyle = rgba(style.border.hex, style.border.opacity);
      context.stroke();
    }

    const iconBox = size * style.iconScale;
    const icon = getTintedHeroIcon(heroIconUrl(frame), style.iconColor, iconBox * input.pixelRatio);
    if (icon) {
      const width = icon.width / input.pixelRatio;
      const height = icon.height / input.pixelRatio;
      context.drawImage(icon, -width / 2, -height / 2, width, height);
    }
    context.restore();
  }
}
