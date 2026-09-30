/**
 * Builds packages/figma-plugin into dist/:
 *   dist/code.js   the main thread (src/code.ts)
 *   dist/ui.html   src/ui.html with the bundled src/ui.ts inlined (Figma loads one HTML file)
 *
 * `npm run figma` reads icon data from https://energyicons.com/figma/v1.
 * `npm run figma:dev` reads it from http://localhost:3000/figma/v1 (run `npm run dev`).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const ROOT = path.resolve(__dirname, "..");
const PLUGIN = path.join(ROOT, "packages/figma-plugin");
const DIST = path.join(PLUGIN, "dist");
const dev = process.argv.includes("--dev");
const dataUrl = dev ? "http://localhost:3000/figma/v1" : "https://energyicons.com/figma/v1";

async function main() {
  mkdirSync(DIST, { recursive: true });

  await build({
    entryPoints: [path.join(PLUGIN, "src/code.ts")],
    outfile: path.join(DIST, "code.js"),
    bundle: true,
    target: "es2017",
    minify: !dev,
    logLevel: "warning",
  });

  const ui = await build({
    entryPoints: [path.join(PLUGIN, "src/ui.ts")],
    bundle: true,
    write: false,
    target: "es2017",
    minify: !dev,
    define: { __DATA_URL__: JSON.stringify(dataUrl) },
    logLevel: "warning",
  });
  const script = ui.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
  const template = readFileSync(path.join(PLUGIN, "src/ui.html"), "utf8");
  writeFileSync(path.join(DIST, "ui.html"), template.replace("<!-- SCRIPT -->", () => `<script>${script}</script>`));

  console.log(`✓ Figma plugin → ${path.relative(ROOT, DIST)} (icon data: ${dataUrl})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
