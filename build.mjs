/**
 * Build script — esbuild.
 *
 * Három kimenetet gyárt a src/ forrásból (single source of truth):
 *   1. dist/lead-form.min.js   — IIFE bundle, CSS inline injektálva, auto-init data-attribútumokból (CDN / WordPress / statikus HTML)
 *   2. dist/lead-form.esm.js   — ESM bundle build-alapú projektekhez (React/Vite/Next, npm import)
 *   3. dist/lead-form.min.css  — önálló stíluslap (npm-fogyasztóknak külön importhoz)
 *
 * Használat:
 *   node build.mjs           — egyszeri build
 *   node build.mjs --watch   — figyelő mód fejlesztéshez
 */

import * as esbuild from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const watch = process.argv.includes("--watch");
const banner = `/*! @wpkurzus/lead-form — single source of truth lead form. Build: esbuild. */`;

await mkdir("dist", { recursive: true });

// 1. Önálló CSS kimásolása dist-be (npm "./styles" exporthoz)
const css = await readFile("src/styles/lead-form.css", "utf8");
await writeFile("dist/lead-form.min.css", css);

// Közös esbuild beállítások. A .css importot szövegként töltjük be,
// hogy az IIFE bundle futásidőben a <head>-be injektálhassa.
const common = {
  entryPoints: ["src/widget/index.js"],
  bundle: true,
  minify: true,
  sourcemap: true,
  loader: { ".css": "text" },
  banner: { js: banner },
  logLevel: "info",
};

const iifeCfg = {
  ...common,
  outfile: "dist/lead-form.min.js",
  format: "iife",
  globalName: "LeadForm",
  footer: {
    // Auto-init: a bundle betöltődésekor felscan-eli a [data-lead-form] elemeket.
    js: "LeadForm.autoInit && LeadForm.autoInit();",
  },
};

const esmCfg = {
  ...common,
  outfile: "dist/lead-form.esm.js",
  format: "esm",
};

if (watch) {
  const c1 = await esbuild.context(iifeCfg);
  const c2 = await esbuild.context(esmCfg);
  await Promise.all([c1.watch(), c2.watch()]);
  console.log("👀 Figyelő mód — Ctrl+C a leállításhoz");
} else {
  await Promise.all([esbuild.build(iifeCfg), esbuild.build(esmCfg)]);
  console.log("✅ Build kész → dist/");
}
