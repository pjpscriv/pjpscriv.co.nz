/*
 * Constants and building blocks shared by the OG card templates.
 *
 * Templates are plain Satori element trees (1200x630). Satori supports a flexbox-only subset of CSS:
 * every container must be display:flex (the `box` helper does this).
*/

const WIDTH = 1200;
const HEIGHT = 630;

const GREEN = "#008d3d";
const ORANGE = "#f90";
const GRADIENT = `linear-gradient(90deg, ${GREEN}, ${ORANGE})`;
const TEXT = "#111";
const TEXT_MUTED = "#666";

const PAD = 72;
const BAR_HEIGHT = 18;
const LOGO_SIZE = 104;

const SHADOW = "0 18px 40px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.12)";

// --------------------------- Helpers ---------------------------
const box = (style, ...children) => ({
  type: "div",
  props: {
    style: { display: "flex", ...style },
    children: children.flat().filter((c) => c !== null && c !== undefined && c !== false),
  },
});

const img = (src, width, height, style = {}) => ({
  type: "img",
  props: { src, width, height, style },
});

const logo = (assets, size, style = {}) => {
  const { src, width, height } = assets.logo(size);
  // Rendered with nearest-neighbour scaling, see pixelate() in generate-og.js
  return img(src, width, height, style);
};

// Shrinks long titles so they fit in the space available. Sizes step down with
// the overall length, and a single long word must also fit within `width`
// (Raleway Bold is roughly 0.62em per character).
function titleSize(title, sizes = [88, 76, 64, 52], width = 1000) {
  const breakpoints = [24, 40, 64];
  const i = breakpoints.findIndex((max) => title.length <= max);
  const byLength = sizes[i === -1 ? sizes.length - 1 : i];
  const longestWord = Math.max(...title.split(/\s+/).map((w) => w.length));
  return Math.min(byLength, Math.max(36, Math.floor(width / (0.62 * longestWord))));
}

const title = (text, extra = {}) => {
  const fontSize = extra.fontSize ?? titleSize(text);
  return box(
    {
      fontFamily: "Raleway",
      fontWeight: 700,
      color: TEXT,
      lineHeight: 1.1,
      lineClamp: 3,
      wordBreak: "break-word",
      letterSpacing: "-0.01em",
      ...extra,
      fontSize,
    },
    text
  );
};

const muted = (text, extra = {}) =>
  box({ fontFamily: "Open Sans", fontWeight: 400, fontSize: 34, color: TEXT_MUTED, lineHeight: 1.3, ...extra }, text);

// The "9 Sep 2025" / "Updated 28 Sep 2026" line. A page with both a date and an updated time only shows the
// updated one (the manifest sends `updated` already prefixed with the localised "Updated").
const stamp = (entry, extra = {}) =>
  box(
    { fontFamily: "Open Sans", fontStyle: "italic", fontWeight: 600, fontSize: 30, color: GREEN, ...extra },
    entry.updated ?? entry.date
  );

// Label above the page title: the site name, or for nested pages their top-level section (see the manifest).
// Every template except home uses this.
const heading = (entry, text, extra = {}) =>
  box(
    { flexDirection: "column" },
    box(
      { fontFamily: "Open Sans", fontWeight: 600, fontSize: 32, color: TEXT_MUTED, marginBottom: 12 },
      entry.parent ?? entry.name
    ),
    title(text, extra)
  );

// The site's domain, in italic grey
const domain = (entry, extra = {}) =>
  box({ fontFamily: "Open Sans", fontStyle: "italic", fontSize: 38, color: "#999", ...extra }, entry.domain);

// White page, gradient bar along the bottom. `content` fills the area above the bar.
const bareFrame = (content) =>
  box(
    { width: WIDTH, height: HEIGHT, position: "relative", flexDirection: "column", backgroundColor: "#fff" },
    box({ flex: 1, flexDirection: "column", padding: `${PAD * 0.75}px ${PAD}px 0 ${PAD}px` }, content),
    box({ height: BAR_HEIGHT, width: "100%", backgroundImage: GRADIENT })
  );

// bareFrame plus the domain in the top right, lined up with the middle of the logo
const frame = (entry, ...content) =>
  bareFrame([...content, domain(entry, { position: "absolute", top: 78, right: PAD })]);

// Frame with the logo top-left, then `body` filling the remaining space
const withLogo = (entry, assets, body) =>
  frame(
    entry,
    logo(assets, LOGO_SIZE),
    box({ flex: 1, alignItems: "center", paddingBottom: PAD * 0.9 }, body)
  );

module.exports = {
  WIDTH,
  HEIGHT,
  GREEN,
  GRADIENT,
  PAD,
  SHADOW,
  box,
  img,
  logo,
  titleSize,
  title,
  muted,
  stamp,
  heading,
  domain,
  bareFrame,
  frame,
  withLogo,
};
