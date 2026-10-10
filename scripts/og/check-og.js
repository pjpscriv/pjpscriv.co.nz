/*
 * Reports OG image coverage for the built site (run `npm run build` first).
 *
 * For every HTML page in public/ it checks that:
 *  - there's an og:image meta tag
 *  - the image it points to exists in public/ and is 1200x630
 * and prints coverage per card type (types come from og-manifest.json).
 *
 * Skipped: obs-embed pages (iframe content), 404 pages, empty taxonomy listings and alias redirects.
 * Exits with 1 if any page has a problem, so it can gate CI.
 *
 * Usage: node scripts/og/check-og.js [--dir public] [--verbose]
 *   --verbose  Also list every page that passed
*/

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { cardType } = require("./card-type");

const ROOT = path.join(__dirname, "..", "..");
const EXPECTED = { width: 1200, height: 630 };
const SKIP_PATTERNS = [
  /^\/obs-embed\//, // iframe content
  /\/404\.html$/,
  /^(\/[a-z]{2})?\/(tags|categories)\//, // Hugo's empty taxonomy listings
];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { dir: path.join(ROOT, "public"), verbose: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--verbose") opts.verbose = true;
    else if (args[i] === "--dir" && args[i + 1]) opts.dir = path.resolve(args[++i]);
    else {
      console.error("Usage: node scripts/og/check-og.js [--dir public] [--verbose]");
      process.exit(1);
    }
  }
  return opts;
}

function* walkHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtml(full);
    else if (entry.name.endsWith(".html")) yield full;
  }
}

// public/garden/index.html -> /garden/ ; public/cv.html -> /cv.html
function pageUrl(outDir, file) {
  const rel = "/" + path.relative(outDir, file).split(path.sep).join("/");
  return rel.endsWith("/index.html") ? rel.slice(0, -"index.html".length) : rel;
}

// page url -> card type, from the manifests Hugo wrote and the rules in card-type.js
function loadTypes(outDir) {
  const types = new Map();
  const files = [path.join(outDir, "og-manifest.json")];
  for (const d of fs.readdirSync(outDir, { withFileTypes: true })) {
    if (d.isDirectory()) files.push(path.join(outDir, d.name, "og-manifest.json"));
  }
  for (const file of files.filter((f) => fs.existsSync(f))) {
    for (const page of JSON.parse(fs.readFileSync(file, "utf-8")).pages) types.set(page.url, cardType(page));
  }
  return types;
}

function metaContent(html, property) {
  const tag = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]*>`, "i"));
  return tag?.[0].match(/content=["']([^"']*)["']/i)?.[1];
}

async function checkPage(outDir, html) {
  const image = metaContent(html, "og:image");
  if (!image) return "no og:image tag";

  const imagePath = new URL(image, "https://placeholder.invalid").pathname;
  const imageFile = path.join(outDir, decodeURIComponent(imagePath));
  if (!fs.existsSync(imageFile)) return `image not found: ${imagePath}`;

  const { width, height } = await sharp(imageFile).metadata();
  if (width !== EXPECTED.width || height !== EXPECTED.height) {
    return `image is ${width}x${height}, expected ${EXPECTED.width}x${EXPECTED.height}`;
  }
  return null;
}

async function main() {
  const opts = parseArgs();
  if (!fs.existsSync(opts.dir)) {
    console.error(`${opts.dir} not found. Run npm run build first.`);
    process.exit(1);
  }

  const types = loadTypes(opts.dir);
  const byType = {};
  const problems = [];
  const passed = [];
  let skipped = 0;

  for (const file of walkHtml(opts.dir)) {
    const url = pageUrl(opts.dir, file);
    const html = fs.readFileSync(file, "utf-8");
    const isAlias = /http-equiv=["']refresh["']/i.test(html);
    if (SKIP_PATTERNS.some((p) => p.test(url)) || isAlias) {
      skipped++;
      continue;
    }

    const type = types.get(url) ?? "unknown";
    const stats = (byType[type] ??= { pages: 0, covered: 0 });
    stats.pages++;

    const problem = await checkPage(opts.dir, html);
    if (problem) problems.push({ url, type, problem });
    else {
      stats.covered++;
      passed.push(url);
    }
  }

  const total = Object.values(byType).reduce((n, s) => n + s.pages, 0);
  const covered = total - problems.length;

  console.log("OG image coverage\n");
  const rows = Object.entries(byType).sort(([a], [b]) => a.localeCompare(b));
  const pad = Math.max(...rows.map(([t]) => t.length), 5);
  for (const [type, s] of rows) {
    const pct = Math.round((s.covered / s.pages) * 100);
    console.log(`  ${type.padEnd(pad)}  ${String(s.covered).padStart(3)} / ${String(s.pages).padEnd(3)}  ${pct}%`);
  }
  const pct = total ? Math.round((covered / total) * 100) : 0;
  console.log(`  ${"total".padEnd(pad)}  ${String(covered).padStart(3)} / ${String(total).padEnd(3)}  ${pct}%`);
  console.log(`\n  (${skipped} pages skipped: obs-embed, 404, taxonomy listings, redirects)`);

  if (opts.verbose) console.log("\nCovered:\n" + passed.map((u) => `  ✓ ${u}`).join("\n"));

  if (problems.length > 0) {
    console.log("\nProblems:");
    for (const p of problems) console.log(`  ✗ ${p.url} [${p.type}]: ${p.problem}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
