import { MASK_GLSL } from "./hero-masks";

export const HERO_FIELD_VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/**
 * One stateless pass for the whole hero field, ported from Toolcraft's hero
 * field shader. Coordinates are local CSS pixels from the hero's top-left, so the
 * look is identical at any devicePixelRatio. Every time term is a whole number of
 * cycles per loop (uTime is loop progress 0..1), which keeps the loop seamless.
 */
export const HERO_FIELD_FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform vec2 uCssSize;
uniform float uTime;

uniform float uSpacing;
uniform float uDotSize;
uniform float uShape;
uniform vec3 uDotColor;
uniform float uDotOpacity;

uniform vec3 uEnergyColor;
uniform float uEnergyIntensity;
uniform vec2 uEnergyDir;
uniform float uWavelength;
uniform float uBandWidth;
uniform float uTurbulence;
uniform float uShimmer;
uniform float uCycles;

uniform vec3 uGlowColor;
uniform float uGlowIntensity;
uniform vec2 uGlowRadii;
uniform float uGlowCore;
uniform float uGlowDotLift;
uniform float uGlowPulse;
uniform float uGlowPulseCount;

uniform float uMaskOutside;

// Seam support: the hero anchors its grid and glow to its bottom edge (origin = height);
// the library backdrop below anchors both to its top edge (origin = 0), so the dot rows,
// noise and glow continue across the join as one field.
uniform float uGridOriginY;
uniform float uGlowOriginY;
// Over uFade px from the top edge, dots and energy ease from full strength to these scales (0 = off).
uniform float uFade;
uniform float uFadeDots;
uniform float uFadeEnergy;

${MASK_GLSL}

const float TAU = 6.28318530718;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 4; octave++) {
    value += amplitude * valueNoise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    amplitude *= 0.5;
  }
  return value / 0.9375;
}

vec2 glowCenter() {
  return vec2(uCssSize.x * 0.5, uGlowOriginY + uGlowRadii.y * 0.12);
}

float glowBody(vec2 p, float breath) {
  vec2 q = (p - glowCenter()) / uGlowRadii;
  float e = length(q);
  float body = exp(-e * e * 2.4) * breath;
  float ring = fract(e * 1.6 - uTime * uGlowPulseCount);
  float ripple = exp(-pow((ring - 0.5) * 6.0, 2.0)) * exp(-e * e * 1.4);
  return (body + ripple * uGlowPulse * 0.35) * uGlowIntensity;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) * (uCssSize / uResolution);
  float pixel = uCssSize.x / uResolution.x;
  float breath = 1.0 + uGlowPulse * 0.22 * sin(TAU * uTime * uGlowPulseCount);

  // Grid space shares its origin with the neighbouring section, so rows never straddle the seam.
  vec2 grid = p - vec2(0.0, uGridOriginY);
  vec2 gid = floor(grid / uSpacing);
  vec2 center = (gid + 0.5) * uSpacing;
  vec2 d = grid - center;
  vec2 centerLocal = center + vec2(0.0, uGridOriginY);
  float fade = uFade > 0.0 ? smoothstep(0.0, uFade, centerLocal.y) : 0.0;
  float dist = uShape > 0.5 ? max(abs(d.x), abs(d.y)) : length(d);
  // Energized dots swell up to SWELL x; pixels outside that reach skip the field math.
  const float SWELL = 1.7;
  // Full-size dots reach half a device pixel past their cell so they tile without seams.
  float cellRadius = uSpacing * 0.5 + pixel * 0.5;
  float maxRadius = min(uDotSize * 0.5 * SWELL, cellRadius);

  vec4 dots = vec4(0.0);
  if (dist < maxRadius + pixel) {
    // Fields are sampled at the dot center so each dot lights as one unit.
    float warp = (fbm(center / (uWavelength * 0.55)) - 0.5) * 2.2 * uTurbulence;
    float along = dot(center, uEnergyDir) / uWavelength + warp;
    float phase = fract(along - uTime * uCycles);
    float trail = smoothstep(1.0 - max(uBandWidth, 0.02), 1.0, phase);
    float head = 1.0 - smoothstep(0.965, 1.0, phase);
    vec2 across = vec2(-uEnergyDir.y, uEnergyDir.x);
    float vein = fbm(vec2(dot(center, across), dot(center, uEnergyDir) * 0.35) / (uWavelength * 0.35) + 3.7);
    float veinMask = mix(1.0, smoothstep(0.25, 0.65, vein), uTurbulence);
    float energy = pow(trail, 1.6) * head * veinMask * uEnergyIntensity * mix(1.0, uFadeEnergy, fade);

    float radius = min(uDotSize * 0.5 * (1.0 + (SWELL - 1.0) * energy), cellRadius);
    if (uDotSize >= uSpacing) radius = cellRadius;
    float dotMask = 1.0 - smoothstep(radius - pixel * 0.5, radius + pixel * 0.5, dist);

    float twinkle = 0.5 + 0.5 * sin(TAU * (uTime * 3.0 + hash21(gid)));
    float sparkle = uShimmer * mix(1.0, uFadeEnergy, fade) * pow(twinkle, 6.0) * step(0.55, hash21(gid + 7.3));

    float lift = clamp(glowBody(centerLocal, breath), 0.0, 1.0) * uGlowDotLift;
    float light = clamp(energy + sparkle * 0.8 + lift, 0.0, 1.0);
    vec3 color = mix(uDotColor, uEnergyColor, clamp(energy * 1.2, 0.0, 1.0) * 0.85);
    color = mix(color, mix(uGlowColor, vec3(1.0), 0.55), clamp(lift * 0.8 + sparkle * 0.4, 0.0, 1.0));

    float dotOpacity = uDotOpacity * mix(1.0, uFadeDots, fade);
    float alpha = (dotOpacity + (1.0 - dotOpacity) * light) * dotMask * mix(uMaskOutside, 1.0, maskCoverage(p));
    dots = vec4(color * alpha, alpha);
  }

  float glow = glowBody(p, breath);
  vec2 coreOffset = (p - vec2(uCssSize.x * 0.5, uGlowOriginY)) / (uGlowRadii * 0.45);
  float core = exp(-dot(coreOffset, coreOffset) * 1.6) * uGlowCore * uGlowIntensity * breath;
  vec3 light = uGlowColor * glow + vec3(core);
  float lightAlpha = clamp(max(max(light.r, light.g), light.b), 0.0, 1.0);

  vec3 rgb = dots.rgb * (1.0 - lightAlpha * 0.5) + light;
  float alpha = clamp(dots.a + lightAlpha - dots.a * lightAlpha, 0.0, 1.0);
  alpha = max(alpha, clamp(max(max(rgb.r, rgb.g), rgb.b), 0.0, 1.0));
  gl_FragColor = vec4(min(rgb, vec3(alpha)), alpha);
}
`;
