/*
 * Downloads the static assets used by scripts/og/generate-og.js:
 *  - scripts/og/fonts/*.ttf  (Satori can't read woff2, and needs one file per weight)
 *  - scripts/og/twemoji/*.svg (emoji used in OG cards; Twemoji is CC-BY 4.0, https://github.com/jdecked/twemoji)
 *
 * Usage: node scripts/og/fetch-og-assets.js
 *
 * The downloaded files are committed so CI doesn't need network access to
 * build. generate-og.js also fetches any missing emoji on demand.
*/

const https = require("https");
const fs = require("fs");
const path = require("path");

// A legacy UA makes Google Fonts return plain static .ttf files
const UA = "Mozilla/4.0";

const FAMILIES =
  "Raleway:wght@400;700&family=Open+Sans:ital,wght@0,400;0,600;1,400;1,600&family=Josefin+Sans:ital,wght@0,400;0,600;1,400";
const CSS_URL = `https://fonts.googleapis.com/css2?family=${FAMILIES}`;

const FONT_DIR = path.join(__dirname, "fonts");
const EMOJI = [
  "1fab4", /* 🪴, in the "🪴Garden" page title */
  "1f4ca", /* 📊, in the data viz descriptions */
  "1f331", /* 🌱, in the garden descriptions */
];

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
  fs.mkdirSync(FONT_DIR, { recursive: true });

  const css = (await get(CSS_URL)).toString("utf-8");
  const blockRe = /@font-face\s*\{[^}]*\}/g;
  for (const block of css.match(blockRe) ?? []) {
    const family = block.match(/font-family:\s*'([^']+)'/)[1];
    const weight = block.match(/font-weight:\s*(\d+)/)[1];
    const italic = /font-style:\s*italic/.test(block) ? "-italic" : "";
    const url = block.match(/url\((https:[^)]+\.ttf)\)/)[1];
    const fname = `${family.toLowerCase().replace(/\s+/g, "-")}-${weight}${italic}.ttf`;
    const data = await get(url);
    fs.writeFileSync(path.join(FONT_DIR, fname), data);
    console.log(`Downloaded ${fname} (${data.length} bytes)`);
  }

  const { fetchEmoji } = require("./twemoji");
  for (const code of EMOJI) {
    await fetchEmoji(code);
    console.log(`Downloaded twemoji ${code}.svg`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
