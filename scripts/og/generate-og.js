/*
 * Generates the OG (social share) images for the built site.
 *
 * Run after Hugo (`npm run build` does this for you). Hugo writes og-manifest.json for each
 * language (see layouts/index.ogmanifest.json); this picks a card type for each page (card-type.js)
 * and renders one 1200x630 PNG per page using the templates in scripts/og/templates/.
 *
 * Satori (JSX-ish tree -> SVG) + sharp (SVG -> PNG), so no browser is needed.
 *
 * Usage: node scripts/og/generate-og.js [--manifests public] [--out <dir>] [--flat] [--clean] [--filter <url substring>]
 *   --manifests  Where Hugo's output (og-manifest.json) is read from. Default: public
 *   --out        Where the images are written, as <out>/<page url>/og.webp. Default: same as --manifests,
 *                so each image sits next to its page. Point it elsewhere to render a test copy (npm run test:og)
 *   --flat       Write every image straight into --out, named after its page (post-test-one.en.webp), instead of
 *                one folder per page. Handy for browsing them all in one place
 *   --clean      Empty --out before rendering. Only allowed for a directory inside the repo that isn't --manifests
 *   --filter     Only render pages whose URL contains the text (handy when tweaking a template)
*/

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { templates, WIDTH, HEIGHT, CARD_QR_PX } = require("./templates");
const { emojiDataUri } = require("./twemoji");
const { cardType } = require("./card-type");

// Pages that don't get an image: anything in these sections (obs-embed is iframe content), and anything that isn't a
// home, page or section (Hugo's empty taxonomy listings). Keep the kinds in sync with layouts/partials/og-meta.html,
// which only writes the og:image tag for the same pages.
const SKIPPED_SECTIONS = ["obs-embed"];
const IMAGE_KINDS = ["home", "page", "section"];
const shouldSkip = (page) => SKIPPED_SECTIONS.includes(page.section) || !IMAGE_KINDS.includes(page.kind);

// With --flat every image goes in one folder instead, named from the page's content path and language:
// /post/test-one -> post-test-one.en.webp, / -> home.fr.webp
const flatName = (page) => `${page.path.split("/").filter(Boolean).join("-") || "home"}.${page.lang}${OG_EXT}`;

// Each image is written next to its page: /post/test-one/ -> <out>/post/test-one/og.webp.
// Keep the file name (and the image type) in sync with the og:image tags in layouts/partials/og-meta.html.
const OG_EXT = ".webp";
const OG_FILENAME = `og${OG_EXT}`;

// Lossy WebP at 90 is about 37% the size of the PNGs, and still keeps the pixel art, small text and QR code crisp.
// (Lossless is only ~50%, because the data viz screenshots are photographic.)
const WEBP_OPTIONS = { quality: 90, effort: 6, smartSubsample: true };

const ROOT = path.join(__dirname, "..", "..");
const FONT_DIR = path.join(__dirname, "fonts");
const LOGO_SRC = path.join(ROOT, "static", "img", "pixel-peter.png");
const DATA_VIZ_DIR = path.join(ROOT, "static", "img", "data-viz");
const ICON_DIR = path.join(ROOT, "static", "img", "icons");
const QR_DIR = path.join(ROOT, "static", "img", "qr");

const FONTS = [
  { name: "Raleway", file: "raleway-400.ttf", weight: 400 }, // cv name
  { name: "Raleway", file: "raleway-700.ttf", weight: 700 },
  { name: "Open Sans", file: "open-sans-400.ttf", weight: 400 },
  { name: "Open Sans", file: "open-sans-600.ttf", weight: 600 },
  { name: "Open Sans", file: "open-sans-400-italic.ttf", weight: 400, style: "italic" }, // domain
  { name: "Open Sans", file: "open-sans-600-italic.ttf", weight: 600, style: "italic" }, // dates
  // business card + cv
  { name: "Josefin Sans", file: "josefin-sans-400.ttf", weight: 400 },
  { name: "Josefin Sans", file: "josefin-sans-600.ttf", weight: 600 },
  { name: "Josefin Sans", file: "josefin-sans-400-italic.ttf", weight: 400, style: "italic" },
];

// Approximate heights (px) the templates ask assets.logo() for
const LOGO_SIZES = [96, 104, 250];


const USAGE =
  "Usage: node scripts/og/generate-og.js [--manifests public] [--out <dir>] [--flat] [--clean] [--filter <url substring>]";

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    manifests: path.join(ROOT, "public"),
    out: null, // defaults to the manifests directory
    flat: false,
    clean: false,
    filter: "",
  };

  for (let i = 0; i < args.length; i++) {
    const argName = args[i];

    if (argName === "--flat") {
      opts.flat = true;
    } else if (argName === "--clean") {
      opts.clean = true;
    } else if (argName === "--manifests" && args[i + 1]) {
      opts.manifests = path.resolve(args[++i]);
    } else if (argName === "--out" && args[i + 1]) {
      opts.out = path.resolve(args[++i]);
    } else if (argName === "--filter" && args[i + 1]) {
      opts.filter = args[++i];
    } else {
      console.error(USAGE);
      process.exit(1);
    }
  }

  opts.out ??= opts.manifests;

  // --clean deletes everything in --out, so only allow it on a separate directory inside the repo
  if (opts.clean) {
    const insideRepo = opts.out.startsWith(ROOT + path.sep);
    if (!insideRepo || opts.out === opts.manifests) {
      console.error(`--clean needs --out to be a directory inside the repo, other than --manifests (got ${opts.out})`);
      process.exit(1);
    }
  }
  return opts;
}


// public/og-manifest.json plus public/<lang>/og-manifest.json
function findManifests(outDir) {
  const found = [];
  const root = path.join(outDir, "og-manifest.json");
  if (fs.existsSync(root)) found.push(root);
  for (const dir of fs.readdirSync(outDir, { withFileTypes: true })) {
    const file = path.join(outDir, dir.name, "og-manifest.json");
    if (dir.isDirectory() && fs.existsSync(file)) found.push(file);
  }
  return found;
}


// Satori drops the `image-rendering` style, so add it to the SVG ourselves. Only PNGs get it: those are
// the pixel-art logos (already scaled by a whole number, this just guarantees nothing smooths them).
// The JPEG previews are downscaled photos.
const pixelate = (svg) => svg.replace(/<image (?=[^>]*href="data:image\/png)/g, '<image image-rendering="optimizeSpeed" ');

const toDataUri = (buffer, mime) => `data:${mime};base64,${buffer.toString("base64")}`;

// Everything the templates embed is loaded up front, so templates can look it up synchronously
async function loadAssets(entries) {
  const logos = new Map();
  const dataViz = new Map();
  const qrs = new Map();
  const icons = new Map();

  // The source is 64x64 pixel art. Trim the margin, then scale up by a whole number so every
  // art pixel stays a crisp square.
  const grid = await sharp(LOGO_SRC).trim().toBuffer({ resolveWithObject: true });
  for (const size of LOGO_SIZES) {
    const scale = Math.max(1, Math.round(size / grid.info.height));
    const width = grid.info.width * scale;
    const height = grid.info.height * scale;
    const png = await sharp(grid.data).resize(width, height, { kernel: "nearest" }).png().toBuffer();
    logos.set(size, { src: toDataUri(png, "image/png"), width, height });
  }

  for (const entry of entries) {
    if (entry.img && !dataViz.has(entry.img)) {
      const jpg = fs.readFileSync(path.join(DATA_VIZ_DIR, entry.img));
      dataViz.set(entry.img, toDataUri(jpg, "image/jpeg"));
    }
  }

  // The business card and cv: contact icons, plus the card's QR code (nearest-neighbour, whole pixels per module)
  for (const { card, cv } of entries) {
    const { qr } = card;
    if (!qrs.has(qr)) {
      const png = await sharp(path.join(QR_DIR, `${qr}.png`))
        .resize(CARD_QR_PX, CARD_QR_PX, { kernel: "nearest" })
        .png()
        .toBuffer();
      qrs.set(qr, toDataUri(png, "image/png"));
    }
    for (const { icon } of [...card.contacts, ...cv.contacts]) {
      if (!icons.has(icon)) icons.set(icon, fs.readFileSync(path.join(ICON_DIR, icon), "utf-8"));
    }
  }

  return {
    logo: (size) => logos.get(size),
    dataVizImage: (file) => dataViz.get(file),
    qr: (lang) => qrs.get(lang),
    // The site's icons are black SVGs that the page recolours with CSS, so do the same here
    icon: (file, color) => toDataUri(Buffer.from(icons.get(file).replace('fill="#000000"', `fill="${color}"`)), "image/svg+xml"),
  };
}



async function main() {
  
  const args = parseArgs();
  const manifests = findManifests(args.manifests);
  
  if (manifests.length === 0) {
    console.error(`No og-manifest.json found in ${args.manifests}. Run Hugo first (npm run build).`);
    process.exit(1);
  }

  // Each page that needs an image gets the shared site data (name, domain, CV and card data) and its card type
  let entries = manifests.flatMap((file) => {
    const { site, pages } = JSON.parse(fs.readFileSync(file, "utf-8"));
    return pages.filter((page) => !shouldSkip(page)).map((page) => ({ ...site, ...page, type: cardType(page) }));
  });
  if (args.filter) entries = entries.filter((e) => e.url.includes(args.filter));

  if (args.clean) fs.rmSync(args.out, { recursive: true, force: true });

  const { default: satori } = await import("satori");
  const fonts = FONTS.map((f) => ({
    name: f.name,
    weight: f.weight,
    style: f.style ?? "normal",
    data: fs.readFileSync(path.join(FONT_DIR, f.file)),
  }));
  const assets = await loadAssets(entries);

  // Emoji in titles (e.g. "🪴Garden") come from the local Twemoji cache
  const loadAdditionalAsset = async (code, segment) => (code === "emoji" ? emojiDataUri(segment) : []);

  const counts = {};
  const written = new Map(); // file -> page url, to catch two pages ending up with the same name
  for (const entry of entries) {
    const template = templates[entry.type] ?? templates.default;
    const svg = await satori(template(entry, assets), { width: WIDTH, height: HEIGHT, fonts, loadAdditionalAsset });
    const image = await sharp(Buffer.from(pixelate(svg))).webp(WEBP_OPTIONS).toBuffer();

    const file = args.flat ? path.join(args.out, flatName(entry)) : path.join(args.out, entry.url, OG_FILENAME);
    if (written.has(file)) throw new Error(`${entry.url} and ${written.get(file)} would both be written to ${file}`);
    written.set(file, entry.url);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, image);
    counts[entry.type] = (counts[entry.type] ?? 0) + 1;
  }

  const summary = Object.entries(counts).map(([type, n]) => `${type}: ${n}`).join(", ");
  console.log(`Generated ${entries.length} OG images in ${path.relative(ROOT, args.out) || "."} (${summary})`);
}



main().catch((err) => {
  console.error(err);
  process.exit(1);
});
