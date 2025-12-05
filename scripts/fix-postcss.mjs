import { existsSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nodeModulesDir = path.join(__dirname, "..", "node_modules");

// PostCSS ESM shim
const postcssDir = path.join(nodeModulesDir, "postcss", "lib");
const jsPath = path.join(postcssDir, "postcss.js");
const mjsPath = path.join(postcssDir, "postcss.mjs");

if (existsSync(postcssDir) && existsSync(jsPath)) {
  const shim = `
import postcss from './postcss.js';
export { postcss as default };
export * from './postcss.js';
`;
  writeFileSync(mjsPath, shim.trimStart(), "utf8");
  console.log("[fix-postcss] Ensured postcss.mjs shim (esm wrapper).");
} else {
  console.warn("[fix-postcss] postcss not installed; skipping postcss shim.");
}

// audio-loader stub (package is missing compiled lib/)
const audioDir = path.join(nodeModulesDir, "audio-loader");
const audioLibDir = path.join(audioDir, "lib");
const audioIndex = path.join(audioLibDir, "index.js");
if (existsSync(audioDir)) {
  if (!existsSync(audioLibDir)) {
    mkdirSync(audioLibDir, { recursive: true });
  }
  if (!existsSync(audioIndex)) {
    const stub =
      "module.exports = function audioLoader() { return Promise.resolve(null); };\n";
    writeFileSync(audioIndex, stub, "utf8");
    console.log("[fix-postcss] Added audio-loader stub module.");
  }
} else {
  console.warn("[fix-postcss] audio-loader not installed; skipping audio stub.");
}

// sample-player stub (dependency of soundfont-player; package ships source without build)
const samplePlayerDir = path.join(nodeModulesDir, "sample-player");
const samplePlayerLibDir = path.join(samplePlayerDir, "lib");
const samplePlayerIndex = path.join(samplePlayerLibDir, "index.js");
if (existsSync(samplePlayerDir)) {
  if (!existsSync(samplePlayerLibDir)) {
    mkdirSync(samplePlayerLibDir, { recursive: true });
  }
  if (!existsSync(samplePlayerIndex)) {
    const stub =
      "module.exports = function samplePlayer() { return () => ({ connect() {}, start() {} }); };\n";
    writeFileSync(samplePlayerIndex, stub, "utf8");
    console.log("[fix-postcss] Added sample-player stub module.");
  }
} else {
  console.warn("[fix-postcss] sample-player not installed; skipping sample stub.");
}
