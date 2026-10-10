// The CV card: centred name, title and location, with the links wrapped underneath. Deliberately ignores the
// shared card chrome (logo, gradient bar, site name) and borrows the fonts and colours of layouts/cv.html instead.
const { HEIGHT, WIDTH, box, img } = require("./shared");

const CV_TEXT = "#222";
const CV_SUBTLE = "#666";

const nameWord = (text, fontWeight, extra = {}) =>
  box({ fontFamily: "Raleway", fontWeight, textTransform: "uppercase", ...extra }, text);

const template = (entry, assets) => {
  const { cv } = entry;

  return box(
    {
      width: WIDTH,
      height: HEIGHT,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
      color: CV_TEXT,
      fontFamily: "Josefin Sans",
      lineHeight: 1.3,
    },
    box(
      { fontSize: 108, lineHeight: 1.15, justifyContent: "center" },
      nameWord(cv.first_name, 400, { marginRight: 28 }),
      nameWord(cv.last_name, 700)
    ),
    box({ fontSize: 44, fontWeight: 600, marginTop: 10 }, cv.title),
    box({ fontSize: 34, fontStyle: "italic", color: CV_SUBTLE, marginTop: 6 }, cv.city),
    // Links: side by side, wrapping onto more lines if they don't fit
    box(
      { flexWrap: "wrap", justifyContent: "center", columnGap: 44, rowGap: 14, marginTop: 56, maxWidth: 1040 },
      cv.contacts.map((contact) =>
        box(
          { alignItems: "center", fontSize: 29 },
          img(assets.icon(contact.icon, CV_TEXT), 29, 29, { marginRight: 10 }),
          box({}, contact.label)
        )
      )
    )
  );
};

module.exports = { template };
