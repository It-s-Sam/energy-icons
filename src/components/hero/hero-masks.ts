/**
 * Strength masks for the hero field: soft ellipses that fade the dot grid toward
 * `mask.outside` away from the headline.
 *
 * The GLSL and uniform packing are copied from Toolcraft's soft-ellipse mask
 * module (runtime/modules/built-ins/masks/rendering/webgl-mask.ts), MIT License,
 * Copyright (c) 2026 Pixel Point, so the site does not depend on Toolcraft. See
 * THIRD_PARTY_NOTICES.md.
 */

export const MAX_MASKS = 16;

export type SoftEllipse = Readonly<{
  center: Readonly<{ x: number; y: number }>;
  /** Feather half-width in CSS pixels, measured as ellipse distance. */
  edgeWidth: number;
  opacity: number;
  radiusX: number;
  radiusY: number;
  rotationDegrees: number;
}>;

type MaskRecord = Readonly<{
  feather?: unknown;
  position?: unknown;
  radius?: unknown;
  rotation?: unknown;
  strength?: unknown;
  stretch?: unknown;
}>;

function finite(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Converts the exported `mask.items` into soft ellipses over the hero in local CSS
 * pixels (top-left origin). Position is the pad value (-1..1, y down); Radius is a
 * percentage of the hero height and Stretch scales the vertical radius.
 */
export function evaluateHeroMasks(value: unknown, cssWidth: number, cssHeight: number): readonly SoftEllipse[] {
  if (!Array.isArray(value)) return [];
  return (value as readonly MaskRecord[]).slice(0, MAX_MASKS).map((record) => {
    const position =
      typeof record?.position === "object" && record.position !== null
        ? (record.position as { x?: unknown; y?: unknown })
        : {};
    const radiusX = Math.max(0.5, (finite(record?.radius, 40) * cssHeight) / 100);
    const radiusY = Math.max(0.5, radiusX * finite(record?.stretch, 1));
    return {
      center: {
        x: ((finite(position.x, 0) + 1) / 2) * cssWidth,
        y: ((finite(position.y, 0) + 1) / 2) * cssHeight,
      },
      edgeWidth: Math.max((Math.max(radiusX, radiusY) * finite(record?.feather, 40)) / 100, 0.75),
      opacity: Math.min(1, Math.max(0, finite(record?.strength, 100) / 100)),
      radiusX,
      radiusY,
      rotationDegrees: finite(record?.rotation, 0),
    };
  });
}

/**
 * `maskCoverage(q)` returns 0..1 for q in local CSS pixels. Only the
 * ellipse-distance edge metric is used by the hero, so the normalized-radius
 * branch of the Toolcraft original is dropped.
 */
export const MASK_GLSL = `
#define MAX_MASKS ${MAX_MASKS}
uniform int uMaskCount;
uniform vec2 uMaskCenters[MAX_MASKS];
uniform vec2 uMaskRadii[MAX_MASKS];
uniform vec2 uMaskRotations[MAX_MASKS];
uniform float uMaskWidths[MAX_MASKS];
uniform float uMaskOpacities[MAX_MASKS];
float maskCoverage(vec2 q) {
  if (uMaskCount == 0) return 1.0;
  float outside = 1.0;
  for (int i = 0; i < MAX_MASKS; i++) {
    if (i >= uMaskCount) break;
    vec2 v = q - uMaskCenters[i];
    vec2 e = uMaskRadii[i];
    float w = uMaskWidths[i];
    float support = max(e.x, e.y) * (1.0 + w / min(e.x, e.y));
    if (abs(v.x) > support || abs(v.y) > support) continue;
    vec2 r = uMaskRotations[i];
    vec2 p = vec2(r.x * v.x + r.y * v.y, -r.y * v.x + r.x * v.y);
    float g = length(p / e);
    float majorRadius = max(e.x, e.y);
    float gradient = g < 0.0001 ? 1.0 : length((p / e) / g / (e / majorRadius));
    float d = g < 0.0001 ? -min(e.x, e.y) : (g - 1.0) * majorRadius / gradient;
    float shape = w <= 0.0 ? (d <= 0.0 ? 1.0 : 0.0) : 1.0 - smoothstep(-w, w, d);
    outside *= 1.0 - shape * uMaskOpacities[i];
  }
  return 1.0 - outside;
}
`;

export function bindMaskUniforms(gl: WebGLRenderingContext, program: WebGLProgram, masks: readonly SoftEllipse[]): void {
  const centers = new Float32Array(MAX_MASKS * 2);
  const radii = new Float32Array(MAX_MASKS * 2);
  const rotations = new Float32Array(MAX_MASKS * 2);
  const widths = new Float32Array(MAX_MASKS);
  const opacities = new Float32Array(MAX_MASKS);
  masks.forEach((mask, index) => {
    const angle = (mask.rotationDegrees * Math.PI) / 180;
    centers.set([mask.center.x, mask.center.y], index * 2);
    radii.set([mask.radiusX, mask.radiusY], index * 2);
    rotations.set([Math.cos(angle), Math.sin(angle)], index * 2);
    widths[index] = mask.edgeWidth;
    opacities[index] = mask.opacity;
  });
  gl.uniform1i(gl.getUniformLocation(program, "uMaskCount"), masks.length);
  gl.uniform2fv(gl.getUniformLocation(program, "uMaskCenters[0]"), centers);
  gl.uniform2fv(gl.getUniformLocation(program, "uMaskRadii[0]"), radii);
  gl.uniform2fv(gl.getUniformLocation(program, "uMaskRotations[0]"), rotations);
  gl.uniform1fv(gl.getUniformLocation(program, "uMaskWidths[0]"), widths);
  gl.uniform1fv(gl.getUniformLocation(program, "uMaskOpacities[0]"), opacities);
}
