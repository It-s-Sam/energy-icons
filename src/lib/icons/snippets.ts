/**
 * Copy-paste usage for the detail dialog. React and a single SVG file are the
 * install paths that exist. Regular is the default, so its weight is omitted.
 */

import type { IconWeight } from "@/config/icons";

export const FRAMEWORKS = [
  { id: "react", label: "React" },
  { id: "one", label: "One icon" },
  { id: "web", label: "SVG" },
] as const;

export type FrameworkId = (typeof FRAMEWORKS)[number]["id"];

const toPascalCase = (slug: string) =>
  slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

export function getIconSnippet(framework: FrameworkId, name: string, size: number, weight: IconWeight = "regular"): string {
  const bold = weight === "bold";
  const weightProp = bold ? ' weight="bold"' : "";
  switch (framework) {
    case "react":
      return `import { Icon } from "energy-icons/icon";\n\n<Icon name="${name}" size={${size}}${weightProp} />`;
    case "one":
      return `import { ${toPascalCase(name)} } from "energy-icons/icons/${name}";\n\n<${toPascalCase(name)} size={${size}}${weightProp} />`;
    case "web":
      return `<img src="${name}-${size}${bold ? "-bold" : ""}.svg" width="${size}" height="${size}" alt="" />`;
  }
}
