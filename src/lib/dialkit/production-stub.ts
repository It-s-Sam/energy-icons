/**
 * Production stand-in for the `dialkit` package (aliased in next.config.ts).
 * The tuning panels only matter in development, so production builds resolve
 * every dial to its declared default and render no panel, keeping DialKit and
 * Motion out of the shipped JavaScript.
 */
import { useMemo } from "react";

type Config = Record<string, unknown>;

function resolveDefault(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  if (typeof value !== "object" || value === null) return value;
  const control = value as { type?: string; default?: unknown; options?: unknown[]; x?: unknown[]; y?: unknown[] };
  switch (control.type) {
    case "pad":
      return { x: control.x?.[0] ?? 0, y: control.y?.[0] ?? 0 };
    case "select": {
      const first = control.options?.[0];
      return control.default ?? (typeof first === "object" && first !== null ? (first as { value: string }).value : first);
    }
    case "color":
    case "text":
    case "image":
      return control.default ?? "";
    case "spring":
    case "easing":
      return value;
    case "action":
      return undefined;
    default:
      return resolveDefaults(value as Config);
  }
}

function resolveDefaults(config: Config): Config {
  return Object.fromEntries(
    Object.entries(config)
      .filter(([key]) => key !== "_collapsed")
      .map(([key, value]) => [key, resolveDefault(value)]),
  );
}

export function useDialKit(_name: string, config: Config): Config {
  // Dial configs are module constants, so this resolves once per panel.
  return useMemo(() => resolveDefaults(config), [config]);
}

export function DialRoot(): null {
  return null;
}
