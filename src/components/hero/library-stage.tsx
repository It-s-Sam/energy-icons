"use client";

import { useDialKit } from "dialkit";
import { useMemo, type CSSProperties, type ReactNode, type Ref } from "react";

import type { HeroFieldSeam } from "./field-renderer";
import { HeroBackground } from "./hero-background";
import { useHeroFieldDials } from "./hero-dials";
import type { HeroSettings } from "./hero-settings";

/** [default, min, max, step] */
const range = (value: number, min: number, max: number, step: number): [number, number, number, number] => [
  value,
  min,
  max,
  step,
];

const STAGE_DIALS = {
  padding: range(16, 0, 64, 1),
  mobilePadding: range(8, 0, 32, 1),
  radius: range(20, 0, 48, 1),
  glass: {
    width: range(6, 0, 20, 0.5),
    fill: range(0.16, 0, 0.6, 0.01),
    blur: range(16, 0, 40, 1),
    stroke: range(0.55, 0, 1, 0.01),
  },
  shadow: {
    opacity: range(0.28, 0, 0.8, 0.01),
    blur: range(60, 0, 160, 1),
    offsetY: range(24, 0, 80, 1),
    ring: range(0.12, 0, 0.5, 0.01),
  },
  backdrop: {
    dots: range(0.6, 0, 1, 0.01),
    energy: range(0.35, 0, 1, 0.01),
    fade: range(240, 40, 800, 10),
    frames: false,
  },
};

/**
 * The backdrop continues the hero field across the join: same grid, noise, glow and
 * mask, so nothing breaks at the seam. Over `fade` px it then calms down to the
 * `dots` and `energy` scales, and the hero's frames are left out unless toggled on.
 */
function withoutFrames(settings: HeroSettings, frames: boolean): HeroSettings {
  return frames ? settings : { ...settings, frames: [] };
}

/**
 * The home page's library section: the app window floats with rounded corners
 * over a subtle version of the hero background. `held` stops the window's panels
 * scrolling until the stage reaches the top of the viewport.
 */
export function LibraryStage({
  children,
  held,
  stageRef,
}: {
  children: ReactNode;
  held: boolean;
  stageRef: Ref<HTMLDivElement>;
}) {
  const d = useDialKit("Library stage", STAGE_DIALS, { defaultCollapsed: true });
  const field = useHeroFieldDials();
  const backdrop = useMemo(() => withoutFrames(field, d.backdrop.frames), [field, d.backdrop.frames]);
  const { dots, energy, fade } = d.backdrop;
  const seam = useMemo<HeroFieldSeam>(() => ({ dots, energy, fade }), [dots, energy, fade]);

  const style = {
    "--stage-pad": `${d.padding}px`,
    "--stage-pad-mobile": `${d.mobilePadding}px`,
    "--stage-radius": `${d.radius}px`,
    "--glass-width": `${d.glass.width}px`,
    "--glass-fill": d.glass.fill,
    "--glass-blur": `${d.glass.blur}px`,
    "--glass-stroke": d.glass.stroke,
    "--stage-shadow": `0 ${d.shadow.offsetY}px ${d.shadow.blur}px rgb(0 30 90 / ${d.shadow.opacity}), 0 0 0 1px rgb(255 255 255 / ${d.shadow.ring})`,
  } as CSSProperties;

  return (
    <div ref={stageRef} id="icons" className="library-stage relative isolate h-dvh" style={style}>
      <HeroBackground settings={backdrop} seam={seam} />
      <div className="library-glass relative h-full">
        <div className="app-frame library-window relative flex h-full overflow-hidden" data-scroll-held={held ? "" : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}
