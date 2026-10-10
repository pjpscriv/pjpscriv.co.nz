// Data viz pages: title on the left, the page's screenshot inset on the right with the date underneath.
// Everything sits at the bottom, so the title lines up with the date.
const { box, heading, img, stamp, titleSize, withLogo } = require("./shared");

const PREVIEW_WIDTH = 440;
const PREVIEW_HEIGHT = 275; // matches the 640x400 screenshots

const template = (entry, assets) =>
  withLogo(
    entry,
    assets,
    box(
      { flex: 1, alignSelf: "stretch", alignItems: "flex-end", justifyContent: "space-between" },
      box(
        { flexDirection: "column", width: 540 },
        heading(entry, entry.title, { fontSize: titleSize(entry.title, [72, 64, 56, 48], 540) })
      ),
      box(
        { flexDirection: "column", alignItems: "flex-end" },
        box(
          { borderRadius: 16, overflow: "hidden", border: "3px solid #ddd" },
          img(assets.dataVizImage(entry.img), PREVIEW_WIDTH, PREVIEW_HEIGHT)
        ),
        (entry.updated || entry.date) && stamp(entry, { marginTop: 18 })
      )
    )
  );

module.exports = { template };
