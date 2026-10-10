// The home page: big centred logo, name, tagline and domain
const { bareFrame, box, domain, logo, muted, title } = require("./shared");

const template = (entry, assets) =>
  bareFrame([
    box(
      { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 12 },
      logo(assets, 250),
      title(entry.name, { fontSize: 92, marginTop: 20 }),
      muted(entry.role, { fontSize: 44, marginTop: 10 }),
      domain(entry, { marginTop: 14 })
    ),
  ]);

module.exports = { template };
