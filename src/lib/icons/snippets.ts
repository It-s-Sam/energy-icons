/**
 * Copy-paste usage for the detail dialog: the React package, and three ways to
 * use an icon with no install at all (a CDN <img>, a CSS mask that takes the
 * text colour, and the inline SVG itself). Regular is the default, so its
 * weight is omitted. CDN links pick the master for the size, like everything else.
 */

import { getMasterFileName, getMasterForSize, type IconWeight } from "@/config/icons";

export const FRAMEWORKS = [
  { id: "react", label: "React" },
  { id: "one", label: "One icon" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "inline", label: "Inline SVG" },
] as const;

export type FrameworkId = (typeof FRAMEWORKS)[number]["id"];

/** The npm package's SVG files on jsDelivr, pinned to the 1.x line so a future major can't break links. */
const CDN_BASE = "https://cdn.jsdelivr.net/npm/energy-icons@1/svg";

const toPascalCase = (slug: string) =>
  slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

export function getIconCdnUrl(name: string, size: number, weight: IconWeight = "regular"): string {
  return `${CDN_BASE}/${name}/${getMasterFileName(getMasterForSize(size), weight)}`;
}

/**
 * `svg` is the icon's markup at this size and weight, used by the Inline SVG
 * snippet; until it has loaded, that snippet shows a placeholder.
 */
export function getIconSnippet(
  framework: FrameworkId,
  name: string,
  size: number,
  weight: IconWeight = "regular",
  svg?: string,
): string {
  const bold = weight === "bold";
  const weightProp = bold ? ' weight="bold"' : "";
  const url = getIconCdnUrl(name, size, weight);
  switch (framework) {
    case "react":
      return `import { Icon } from "energy-icons/icon";\n\n<Icon name="${name}" size={${size}}${weightProp} />`;
    case "one":
      return `import { ${toPascalCase(name)} } from "energy-icons/icons/${name}";\n\n<${toPascalCase(name)} size={${size}}${weightProp} />`;
    case "html":
      return `<!-- No install. An <img> can't change colour; use CSS for that. -->\n<img src="${url}" width="${size}" height="${size}" alt="" />`;
    case "css": {
      const className = `icon-${name}${bold ? "-bold" : ""}`;
      return `.${className} {\n  display: inline-block;\n  width: ${size}px;\n  height: ${size}px;\n  background-color: currentColor;\n  mask: url("${url}") center / contain no-repeat;\n}\n\n<span class="${className}" role="img" aria-label="${name.replace(/-/g, " ")}"></span>`;
    }
    case "inline": {
      const label = `<!-- ${name}, ${size}px${bold ? ", Bold" : ""}: inherits the text colour -->`;
      return `${label}\n${svg ?? "<!-- loading… -->"}`;
    }
  }
}
