// The base card, used by every page without a more specific template (posts, notes, /now, section pages...).
// Two columns above the gradient bar:
//   1. logo top left; then supertitle, title and description (when the page has a summary) grouped at the bottom
//   2. domain top right; date / updated time bottom right
// The right column is only as wide as its text needs, so neither line wraps; the left takes the rest.
const { PAD, box, domain, heading, logo, bareFrame, muted, stamp, titleSize } = require("./shared");

const LOGO_SIZE = 104;
const COLUMN_GAP = 48;
// Width left for the title once the right column has taken what it needs (the longest date is ~290px)
const TITLE_WIDTH = 700;

const template = (entry, assets) =>
  bareFrame([
    box(
      { flex: 1, marginBottom: PAD * 0.9 },
      // Column 1
      box(
        { flex: 1, flexDirection: "column" },
        logo(assets, LOGO_SIZE),
        box(
          { flex: 1, flexDirection: "column", justifyContent: "flex-end" },
          heading(entry, entry.title, { fontSize: titleSize(entry.title, [80, 72, 60, 50], TITLE_WIDTH) }),
          entry.summary && muted(entry.summary, { marginTop: 24, fontSize: 32, lineClamp: 2 })
        )
      ),
      // Column 2: the domain lines up with the middle of the logo
      box(
        { flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", flexShrink: 0, marginLeft: COLUMN_GAP },
        domain(entry, { marginTop: 24, whiteSpace: "nowrap" }),
        (entry.updated || entry.date) && stamp(entry, { whiteSpace: "nowrap" })
      )
    ),
  ]);

module.exports = { template };
