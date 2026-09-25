/*
 * Regenerates static/fonts/*.woff2 and static/css/fonts.css from Google Fonts,
 * so the site can self-host instead of calling fonts.googleapis.com at runtime.
 *
 * Usage: node scripts/fetch-fonts.js
 *
 * To add/remove a weight: edit FAMILIES below (wght@min..max ranges collapse
 * each family+subset into a single variable-font file), then re-run. Update
 * the corresponding font-family declarations in CSS to match.
*/

const https = require("https");
const fs = require("fs");
const path = require("path");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

/*
 * Weight ranges reflect what's actually used across the site + /cv:
 *  - Open Sans 400-700: body text (400), .section__item h3/h4 (500),
 *    .section__item-period/.project-title (600), default h1-h6 + bold links (700)
 *  - Raleway 400-700: .intro__name h1 + .projects-table th (700),
 *    /cv h1 (400), h1 b/h2/.skills-group h3 (700)
 *  - Josefin Sans 400-600: /cv body (400), article h3/.skill-label/.interest-label (600)
 */
const FAMILIES =
  "Open+Sans:wght@400..700&family=Raleway:wght@400..700&family=Josefin+Sans:wght@400..600";
const CSS_URL = `https://fonts.googleapis.com/css2?family=${FAMILIES}&display=swap`;

const OUT_DIR = path.join(__dirname, "..", "static", "fonts");
const CSS_OUT = path.join(__dirname, "..", "static", "css", "fonts.css");

const NAME_MAP = {
  "Open Sans": "open-sans",
  Raleway: "raleway",
  "Josefin Sans": "josefin-sans",
};

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": UA } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`${url} -> HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const css = (await get(CSS_URL)).toString("utf-8");

  const blockRe = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;
  const kept = [];
  let m;
  while ((m = blockRe.exec(css))) {
    const [, subset, block] = m;
    if (subset === "latin" || subset === "latin-ext") kept.push({ subset, block });
  }
  console.log(`Kept ${kept.length} latin/latin-ext font-face blocks`);

  const cssParts = [];
  for (const { subset, block } of kept) {
    const family = block.match(/font-family:\s*'([^']+)'/)[1];
    const weight = block.match(/font-weight:\s*([\d\s]+);/)[1].trim();
    const style = block.match(/font-style:\s*(\w+)/)[1];
    const srcUrl = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/)[1];
    const unicodeRange = block.match(/unicode-range:\s*([^;]+);/)[1];

    const slug = NAME_MAP[family];
    const fname = `${slug}-${subset}.woff2`;
    const data = await get(srcUrl);
    fs.writeFileSync(path.join(OUT_DIR, fname), data);
    console.log(`Downloaded ${fname} (${data.length} bytes), weight ${weight}`);

    const familyDecl = family.includes(" ") ? `'${family}'` : family;
    cssParts.push(
      `@font-face {\n` +
        `  font-family: ${familyDecl};\n` +
        `  font-style: ${style};\n` +
        `  font-weight: ${weight};\n` +
        `  font-display: swap;\n` +
        `  src: url('/fonts/${fname}') format('woff2');\n` +
        `  unicode-range: ${unicodeRange};\n` +
        `}\n`
    );
  }

  const header =
    "/* Self-hosted fonts, replacing Google Fonts CDN requests.\n" +
    "   Subsetted to latin + latin-ext (covers the en/fr site content).\n" +
    "   Regenerate with `node scripts/fetch-fonts.js` after changing FAMILIES. */\n\n";
  fs.writeFileSync(CSS_OUT, header + cssParts.join("\n"));
  console.log(`Wrote ${CSS_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
