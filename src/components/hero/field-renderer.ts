// Adapted from Toolcraft's hero renderer (MIT, Copyright (c) 2026 Pixel Point). See THIRD_PARTY_NOTICES.md.

import { HERO_FIELD_FRAGMENT_SHADER, HERO_FIELD_VERTEX_SHADER } from "./field-shader";
import { bindMaskUniforms, type SoftEllipse } from "./hero-masks";
import type { HeroFieldSettings } from "./hero-settings";

export type HeroFieldFrame = Readonly<{
  backingHeight: number;
  backingWidth: number;
  cssHeight: number;
  cssWidth: number;
  masks: readonly SoftEllipse[];
  progress: number;
  /** Set when this field continues the one above it (anchored to its top edge). */
  seam: HeroFieldSeam | null;
  settings: HeroFieldSettings;
}>;

export type HeroFieldSeam = Readonly<{
  /** Distance (CSS px) over which dots and energy ease from full strength to the scales below. */
  fade: number;
  dots: number;
  energy: number;
}>;

const uniformNames = [
  "uResolution",
  "uCssSize",
  "uTime",
  "uSpacing",
  "uDotSize",
  "uShape",
  "uDotColor",
  "uDotOpacity",
  "uEnergyColor",
  "uEnergyIntensity",
  "uEnergyDir",
  "uWavelength",
  "uBandWidth",
  "uTurbulence",
  "uShimmer",
  "uCycles",
  "uGlowColor",
  "uGlowIntensity",
  "uGlowRadii",
  "uGlowCore",
  "uGlowDotLift",
  "uGlowPulse",
  "uGlowPulseCount",
  "uMaskOutside",
  "uGridOriginY",
  "uGlowOriginY",
  "uFade",
  "uFadeDots",
  "uFadeEnergy",
] as const;

type UniformName = (typeof uniformNames)[number];

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Hero field: unable to allocate a WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Hero field shader failed to compile: ${log ?? "unknown error"}`);
  }
  return shader;
}

/** Owns one WebGL context and program for the hero field canvas. Ported from Toolcraft. */
export class HeroFieldRenderer {
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer;
  private readonly uniforms: Record<UniformName, WebGLUniformLocation | null>;
  private disposed = false;

  constructor(readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      // The canvas is redrawn every animation frame, so the buffer need not survive compositing.
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("Hero field requires WebGL.");
    this.gl = gl;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, HERO_FIELD_VERTEX_SHADER);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, HERO_FIELD_FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!program) throw new Error("Hero field: unable to allocate a WebGL program.");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Hero field program failed to link: ${gl.getProgramInfoLog(program) ?? "unknown error"}`);
    }
    this.program = program;

    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Hero field: unable to allocate a WebGL buffer.");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.buffer = buffer;

    this.uniforms = Object.fromEntries(
      uniformNames.map((name) => [name, gl.getUniformLocation(program, name)]),
    ) as Record<UniformName, WebGLUniformLocation | null>;
  }

  get contextLost(): boolean {
    return this.gl.isContextLost();
  }

  render(frame: HeroFieldFrame): void {
    if (this.disposed || this.gl.isContextLost()) return;
    const { gl, program, uniforms } = this;
    const { settings: s } = frame;
    if (this.canvas.width !== frame.backingWidth) this.canvas.width = frame.backingWidth;
    if (this.canvas.height !== frame.backingHeight) this.canvas.height = frame.backingHeight;

    gl.viewport(0, 0, frame.backingWidth, frame.backingHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const angle = (s.energyDirectionDegrees * Math.PI) / 180;
    gl.uniform2f(uniforms.uResolution, frame.backingWidth, frame.backingHeight);
    gl.uniform2f(uniforms.uCssSize, frame.cssWidth, frame.cssHeight);
    gl.uniform1f(uniforms.uTime, frame.progress);
    gl.uniform1f(uniforms.uSpacing, s.spacing);
    gl.uniform1f(uniforms.uDotSize, s.dotSize);
    gl.uniform1f(uniforms.uShape, s.shape === "square" ? 1 : 0);
    gl.uniform3fv(uniforms.uDotColor, s.dotColor);
    gl.uniform1f(uniforms.uDotOpacity, s.dotOpacity);
    gl.uniform3fv(uniforms.uEnergyColor, s.energyColor);
    gl.uniform1f(uniforms.uEnergyIntensity, s.energyIntensity);
    gl.uniform2f(uniforms.uEnergyDir, Math.cos(angle), -Math.sin(angle));
    gl.uniform1f(uniforms.uWavelength, s.energyWavelength);
    gl.uniform1f(uniforms.uBandWidth, s.energyBandWidth);
    gl.uniform1f(uniforms.uTurbulence, s.energyTurbulence);
    gl.uniform1f(uniforms.uShimmer, s.energyShimmer);
    gl.uniform1f(uniforms.uCycles, s.energyCycles);
    gl.uniform3fv(uniforms.uGlowColor, s.glowColor);
    gl.uniform1f(uniforms.uGlowIntensity, s.glowIntensity);
    gl.uniform2f(
      uniforms.uGlowRadii,
      Math.max(1, (s.glowWidth * frame.cssWidth) / 2),
      Math.max(1, s.glowHeight * frame.cssHeight),
    );
    gl.uniform1f(uniforms.uGlowCore, s.glowCore);
    gl.uniform1f(uniforms.uGlowDotLift, s.glowDotLift);
    gl.uniform1f(uniforms.uGlowPulse, s.glowPulse);
    gl.uniform1f(uniforms.uGlowPulseCount, s.glowPulseCount);
    gl.uniform1f(uniforms.uMaskOutside, s.maskOutside);
    const origin = frame.seam ? 0 : frame.cssHeight;
    gl.uniform1f(uniforms.uGridOriginY, origin);
    gl.uniform1f(uniforms.uGlowOriginY, origin);
    gl.uniform1f(uniforms.uFade, frame.seam ? Math.max(1, frame.seam.fade) : 0);
    gl.uniform1f(uniforms.uFadeDots, frame.seam?.dots ?? 1);
    gl.uniform1f(uniforms.uFadeEnergy, frame.seam?.energy ?? 1);
    bindMaskUniforms(gl, program, frame.masks);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.program);
  }
}
