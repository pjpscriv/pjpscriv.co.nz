// The business card page's OG image is the business card itself, filling the image. Deliberately ignores the shared
// card chrome (logo, gradient bar, site name, domain) and mirrors layouts/card.html (the page that gets printed to
// card.pdf), so if you change one, change the other. Sizes there are in mm, scaled here by `px` pixels per mm.
const { HEIGHT, WIDTH, box, img } = require("./shared");

// The QR code is 34mm wide on the card. Draw it 11px per module (37 modules) so every module stays a crisp square;
// that sets the scale for the whole card: 1064 x 608px, which fills the 1200x630 image (white margins).
const CARD_QR_PX = 407;

const CARD_TEXT = "#222";
const CARD_TEXT_MUTED = "#555";

const template = (entry, assets) => {
  const { card } = entry;
  const px = CARD_QR_PX / 34;
  const mm = (n) => Math.round(n * px * 10) / 10;

  return box(
    {
      width: WIDTH,
      height: HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
    },
    // 3.5in x 2in
    box(
      {
        width: mm(88.9),
        height: mm(50.8),
        alignItems: "center",
        justifyContent: "center",
        padding: mm(4.5),
        backgroundColor: "#fff",
        color: CARD_TEXT,
        overflow: "hidden",
      },
      img(assets.qr(card.qr), CARD_QR_PX, CARD_QR_PX, { marginRight: mm(6) }),
      box(
        { flexDirection: "column", justifyContent: "center", minWidth: 0 },
        box(
          {
            fontFamily: "Raleway",
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: mm(5),
            lineHeight: 1.15,
            marginBottom: mm(1),
          },
          card.name
        ),
        box(
          { fontFamily: "Josefin Sans", fontSize: mm(3), color: CARD_TEXT_MUTED, marginBottom: mm(3) },
          card.title
        ),
        box(
          { flexDirection: "column" },
          card.contacts.map((contact, i) =>
            box(
              { alignItems: "center", marginTop: i === 0 ? 0 : mm(1.3) },
              img(assets.icon(contact.icon, CARD_TEXT), mm(3), mm(3), { marginRight: mm(1.5) }),
              box(
                { fontFamily: "Josefin Sans", fontSize: mm(2.6), lineHeight: 1.2, whiteSpace: "nowrap" },
                contact.label
              )
            )
          )
        )
      )
    )
  );
};

module.exports = { template, CARD_QR_PX };
