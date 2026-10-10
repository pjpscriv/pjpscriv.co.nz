/*
 * Which card template a page gets.
 *
 * Used by: generate-og.js for rendering and check-og.js for checking
*/

const PATH_TYPE_OVERRIDES = {
  "/": "home",
  "/cv": "cv",
  "/card": "card",
};


function cardType(page) {
  // Check if there's a page type override
  const type = PATH_TYPE_OVERRIDES[page.path];
  if (type) {
    return type;
  }

  // Data Viz pages get a special OG image
  if (page.path.startsWith("/data-viz/") && page.img) {
    return "data-viz";
  }

  // Otherwise just use the normal one
  return "default";
}


module.exports = { cardType };
