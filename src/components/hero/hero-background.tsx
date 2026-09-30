"use client";

// Adapted from Toolcraft's hero renderer (MIT, Copyright (c) 2026 Pixel Point). See THIRD_PARTY_NOTICES.md.

import { useEffect, useRef } from "react";

import { HeroFieldRenderer, type HeroFieldSeam } from "./field-renderer";
import { drawHeroFrames, heroIconUrl } from "./frames-drawing";
import { evaluateHeroMasks, type SoftEllipse } from "./hero-masks";
import type { HeroFrame, HeroFrameStyle, HeroSettings } from "./hero-settings";
import { decodeHeroIcon } from "./icon-cache";

/** Browsers cap canvas edges; beyond this the backing cannot track the displayed size. */
const MAX_BACKING_EDGE = 8192;

/**
 * The animated hero field from the Toolcraft "energy" hero: a WebGL dot grid with
 * travelling energy and a bottom glow, plus framed icons floating above it. Fills
 * its positioned parent and loops on its own clock using the exported loop length.
 * It pauses while off-screen, and draws a single still frame under
 * prefers-reduced-motion. Settings can change live (the DialKit panel) without
 * restarting the loop.
 */
/**
 * Masks in local pixels. A seamed field continues the section above it, so it takes
 * that section's masks shifted up by one section height (both sections are a viewport tall).
 */
function evaluateMasks(settings: HeroSettings, seam: HeroFieldSeam | null, width: number, height: number): readonly SoftEllipse[] {
  const masks = evaluateHeroMasks(settings.masks, width, height);
  return seam ? masks.map((mask) => ({ ...mask, center: { x: mask.center.x, y: mask.center.y - height } })) : masks;
}

/**
 * Narrow heroes move the frames into the bands above and below the headline,
 * and draw them smaller and fainter so they stay out of the text's way.
 */
function layoutFrames(
  settings: HeroSettings,
  cssWidth: number,
): Readonly<{ alpha: number; frames: readonly HeroFrame[]; style: HeroFrameStyle }> {
  const { breakpoint, opacity, scale } = settings.mobileFrames;
  if (cssWidth >= breakpoint) return { alpha: 1, frames: settings.frames, style: settings.frameStyle };
  return {
    alpha: opacity,
    frames: settings.frames.map((frame) => ({ ...frame, position: frame.mobilePosition, size: frame.size * scale })),
    style: {
      ...settings.frameStyle,
      float: settings.frameStyle.float * scale,
      radius: settings.frameStyle.radius * scale,
    },
  };
}

export function HeroBackground({ settings, seam = null }: { settings: HeroSettings; seam?: HeroFieldSeam | null }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef(settings);
  const seamRef = useRef(seam);
  /** Set by the running effect: re-evaluates masks and redraws for new settings. */
  const applySettingsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
    seamRef.current = seam;
    applySettingsRef.current?.();
  }, [settings, seam]);

  useEffect(() => {
    const root = rootRef.current;
    const fieldCanvas = fieldRef.current;
    const framesCanvas = framesRef.current;
    if (!root || !fieldCanvas || !framesCanvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let renderer: HeroFieldRenderer | null = null;
    const createRenderer = () => {
      try {
        renderer = new HeroFieldRenderer(fieldCanvas);
      } catch (error) {
        // Without WebGL the section keeps its solid background and the frames.
        console.warn(error);
        renderer = null;
      }
    };
    createRenderer();

    let cssWidth = 0;
    let cssHeight = 0;
    let pixelRatio = 1;
    let masks: readonly SoftEllipse[] = [];
    let elapsed = settingsRef.current.stillSeconds;
    let frameId: number | null = null;
    let onScreen = false;

    const draw = () => {
      if (cssWidth === 0 || cssHeight === 0) return;
      const { field, loopSeconds } = settingsRef.current;
      const progress = (elapsed % loopSeconds) / loopSeconds;
      const backingWidth = Math.max(1, Math.round(cssWidth * pixelRatio));
      const backingHeight = Math.max(1, Math.round(cssHeight * pixelRatio));

      renderer?.render({
        backingHeight,
        backingWidth,
        cssHeight,
        cssWidth,
        masks,
        progress,
        seam: seamRef.current,
        settings: field,
      });

      if (framesCanvas.width !== backingWidth) framesCanvas.width = backingWidth;
      if (framesCanvas.height !== backingHeight) framesCanvas.height = backingHeight;
      const context = framesCanvas.getContext("2d");
      if (!context) return;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, backingWidth, backingHeight);
      context.setTransform(backingWidth / cssWidth, 0, 0, backingHeight / cssHeight, 0, 0);
      const layout = layoutFrames(settingsRef.current, cssWidth);
      context.globalAlpha = layout.alpha;
      drawHeroFrames(context, { cssHeight, cssWidth, frames: layout.frames, pixelRatio, progress, style: layout.style });
      context.globalAlpha = 1;
    };

    const tick = (timestamp: number) => {
      // Every instance reads the page clock, so the hero and the library backdrop
      // pulse in step where they meet. The loop is seamless, so resuming mid-loop is fine.
      elapsed = (timestamp / 1000) % settingsRef.current.loopSeconds;
      draw();
      frameId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    };

    /** Runs the loop only while visible and motion is allowed; otherwise shows one still frame. */
    const sync = () => {
      const shouldPlay = onScreen && !reducedMotion.matches && document.visibilityState === "visible";
      if (shouldPlay && frameId === null) {
        frameId = requestAnimationFrame(tick);
      } else if (!shouldPlay) {
        stop();
        if (reducedMotion.matches) elapsed = settingsRef.current.stillSeconds;
        draw();
      }
    };

    const measure = () => {
      const rect = root.getBoundingClientRect();
      cssWidth = rect.width;
      cssHeight = rect.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_BACKING_EDGE / Math.max(cssWidth, cssHeight, 1));
      masks = evaluateMasks(settingsRef.current, seamRef.current, cssWidth, cssHeight);
      // Redraw now so a resize never shows a stretched frame, even while paused.
      draw();
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(root);

    // devicePixelRatio changes (zoom, moving between displays) do not resize the element.
    let dprQuery: MediaQueryList | null = null;
    const watchPixelRatio = () => {
      dprQuery?.removeEventListener("change", onPixelRatioChange);
      dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprQuery.addEventListener("change", onPixelRatioChange);
    };
    const onPixelRatioChange = () => {
      measure();
      watchPixelRatio();
    };
    watchPixelRatio();

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      sync();
    });
    intersectionObserver.observe(root);

    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      renderer = null;
    };
    const onContextRestored = () => {
      createRenderer();
      draw();
    };
    fieldCanvas.addEventListener("webglcontextlost", onContextLost);
    fieldCanvas.addEventListener("webglcontextrestored", onContextRestored);

    applySettingsRef.current = () => {
      masks = evaluateMasks(settingsRef.current, seamRef.current, cssWidth, cssHeight);
      if (frameId === null) draw();
    };

    let active = true;
    void Promise.allSettled(settingsRef.current.frames.map((frame) => decodeHeroIcon(heroIconUrl(frame)))).then(() => {
      if (active) draw();
    });

    return () => {
      active = false;
      applySettingsRef.current = null;
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      dprQuery?.removeEventListener("change", onPixelRatioChange);
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      fieldCanvas.removeEventListener("webglcontextlost", onContextLost);
      fieldCanvas.removeEventListener("webglcontextrestored", onContextRestored);
      (renderer as HeroFieldRenderer | null)?.dispose();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ backgroundColor: settings.background }}
    >
      <canvas ref={fieldRef} className="absolute inset-0 block size-full" />
      <canvas ref={framesRef} className="absolute inset-0 block size-full" />
    </div>
  );
}
