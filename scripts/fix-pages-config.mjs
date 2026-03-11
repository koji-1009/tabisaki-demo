/**
 * Post-build script: fix generated output for Cloudflare Pages compatibility.
 *
 * @astrojs/cloudflare v13 generates output targeting Workers.
 * This script patches it for Pages deployment:
 *   1. Strip Workers-only fields from wrangler.json
 *   2. Create index.js entrypoint (Pages expects _worker.js/index.js)
 */

import { readFileSync, writeFileSync } from "node:fs";

// 1. Fix wrangler.json
const configPath = "dist/_worker.js/wrangler.json";
const config = JSON.parse(readFileSync(configPath, "utf-8"));

const remove = [
	"main",
	"rules",
	"no_bundle",
	"assets",
	"kv_namespaces",
	"images",
	"triggers",
];

for (const key of remove) {
	delete config[key];
}

writeFileSync(configPath, JSON.stringify(config));

// 2. Create index.js that Pages expects
writeFileSync("dist/_worker.js/index.js", 'export { default } from "./entry.mjs";\n');

console.log("Fixed build output for Cloudflare Pages");
