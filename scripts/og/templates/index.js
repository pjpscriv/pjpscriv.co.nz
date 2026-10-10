/*
 * OG card templates (1200x630). One file per card type, plus ./shared.js for the common building blocks.
 *
 * Each template is a function (entry, assets) => Satori element tree, where
 *   entry  - one record from og-manifest.json (see layouts/index.ogmanifest.json)
 *   assets - { logo(size), dataVizImage(file), qr(lang), icon(file, color) } from generate-og.js
 *            (logo() returns { src, width, height }, the others a data URI)
 *
 * Which template a page gets is decided in ../card-type.js. To add a card type, add a file here, register it
 * below under the type name, and add its rule to card-type.js.
*/

const { WIDTH, HEIGHT } = require("./shared");
const { CARD_QR_PX } = require("./card");

const templates = {
  // Main template
  default: require("./default").template,
  
  // Type-specific templates  
  "data-viz": require("./data-viz").template,

  // One-off specific templates
  home: require("./home").template,
  cv: require("./cv").template,
  card: require("./card").template,
};

module.exports = { templates, WIDTH, HEIGHT, CARD_QR_PX };
