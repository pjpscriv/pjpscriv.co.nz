// Local cache of Twemoji SVGs (CC-BY 4.0, https://github.com/jdecked/twemoji)
const https = require("https");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "twemoji");
const CDN = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
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

// Twemoji file names are the hex code points joined by '-', dropping the
// variation selector (fe0f) unless the emoji is a ZWJ sequence
function codePoint(emoji) {
  const points = Array.from(emoji, (c) => c.codePointAt(0).toString(16));
  return (points.includes("200d") ? points : points.filter((p) => p !== "fe0f")).join("-");
}

async function fetchEmoji(code) {
  const file = path.join(DIR, `${code}.svg`);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(file, await get(`${CDN}/${code}.svg`));
  }
  return fs.readFileSync(file, "utf-8");
}

// Returns a data URI for the given emoji character(s)
async function emojiDataUri(emoji) {
  const svg = await fetchEmoji(codePoint(emoji));
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

module.exports = { fetchEmoji, emojiDataUri, codePoint };
