# OG images

Every page on the site gets a 1200×630 social share (Open Graph) image, generated at build time with [Satori](https://github.com/vercel/satori) (element tree → SVG) and [sharp](https://sharp.pixelplumbing.com) (SVG → PNG). No browser is needed, so it's cheap to run in CI.

## How it works

```
hugo ──► public/og-manifest.json        (one per language, from layouts/index.ogmanifest.json)
              │
              ▼
generate-og.js ──► public/<page path>/og.webp     (next to each page's index.html)
              │
              ▼
<meta property="og:image">              (layouts/partials/og-meta.html: <page url>og.webp)
```

1. **Hugo** writes an `og-manifest.json` for each language. It lists every page on the site, with the text to show (title, summary, date, updated time, the label above the title), each page's content path (e.g. `/cv`, `/data-viz/nz-fertility`), and its `kind` and `section`. It also carries the site-wide data the cards share: name, domain, tagline, and the CV and business card details.
2. **`generate-og.js`** reads the manifests, skips the pages that don't get an image (anything in `obs-embed`, and anything that isn't a home, page or section, such as a taxonomy listing, in case tags or categories are ever turned back on; they're disabled in hugo.toml), picks a card type for each of the rest ([card-type.js](card-type.js)), and renders one PNG per page using the templates in [templates/](templates/). `npm run build` runs it right after Hugo.
3. **The `<meta>` tags** ([og-meta.html](../../layouts/partials/og-meta.html)) point at `og.webp` next to the page, e.g. `/post/test-one/` → `/post/test-one/og.webp` (home is `/og.webp`, French home `/fr/og.webp`). The tag must be an absolute URL, so it's built from the page's permalink. The file name and type live in two places, the tags and `OG_EXT` in [generate-og.js](generate-og.js), so change both together.

   That partial only writes tags for home, page and section kinds, the same pages the generator makes images for, so keep `IMAGE_KINDS` in [generate-og.js](generate-og.js) in step with it. (`obs-embed` pages use their own layout, so they never reach it.) The same partial also writes the other social tags. Pages with a `date` or `updated` value are `og:type="article"` and get `article:published_time` (from `date`) and `article:modified_time` (from `updated`); everything else is `website`. A page's `description` (or, without one, its `summary`) becomes both `<meta name="description">` and `og:description`. The image text is separate: it comes from `summary` only, so a page with just a `description` gets no text on its card.

## Commands

| Command | What it does |
|---|---|
| `npm run build` | Hugo, then `generate:og`, then Prettier |
| `npm run generate:og` | Renders an `og.webp` next to each page in `public/` (Hugo must have run first) |
| `npm run generate:og -- --filter nz-fertility` | Only renders pages whose URL contains the text. Handy while tweaking a template (avoid a leading `/` in Git Bash, which rewrites it into a Windows path) |
| `npm run check:og` | Coverage report for the built site (see below) |
| `npm run test:og` | Builds with Hugo, then renders every image into `og-test/` (gitignored) so you can look them over without touching `public/`. All the images go in that one flat folder, named after their page and language: `post-test-one.en.webp`, `home.fr.webp`. Wipes `og-test/` each time. Add `-- --filter cv` to render just some pages |
| `npm run fonts:fetch-og` | Re-downloads the card fonts and Twemoji files |

`npm start` serves from memory, so it won't show the images. Run `npm run build` to see them.

## Card types

Which template a page gets is decided in [card-type.js](card-type.js), from the page's content path (which is the same in every language). Anything that doesn't match a more specific rule falls back to `default`.

| Type | Used for | Look |
|---|---|---|
| `home` | the home page (`/`) | centred logo, name, tagline and domain |
| `data-viz` | pages inside `/data-viz/` that have an `img` | title left; the page's screenshot inset right with the date under it |
| `cv` | `/cv` | its own style: centred name, title, location and links, in the CV's fonts |
| `card` | `/card` | just the business card itself, filling the image |
| `default` | everything else (posts, garden notes, `/now`, section pages…) | see below |

All except `cv`, `card` and `home` share the same frame: white background, the pixel Peter logo top left, the domain top right, and the gradient bar along the bottom.

**The default card** has two columns above the bar:

1. the logo at the top, then the label, title and description (the page's `summary`, if it has one) grouped at the bottom
2. the domain at the top, and the date or updated time at the bottom, level with the end of the text

**Label above the title:** the site name for pages directly under the root. For anything deeper it's the top-level section the page lives in, using that section's `linkTitle` if it has one, minus any leading emoji. So posts say "Writing", `garden/french/word-class/adjectives` says "Garden", and the data viz section sets `linkTitle: Data Viz` to shorten its "Data Viz Gallery" title.

**Date line:** a page with an `updated` value shows "Updated: 9 Oct 2026" and nothing else. Otherwise it shows its `date`. Both are formatted for the page's language (French gets "Mis à jour : 9 oct. 2026").

## Changing a card

Templates are plain Satori element trees, one file per card type in [templates/](templates/), with the shared building blocks (constants, `box`, `title`, `frame`…) in [templates/shared.js](templates/shared.js).

To add a card type: add a file in `templates/`, register it in [templates/index.js](templates/index.js), and add its rule to [card-type.js](card-type.js). If it needs extra data, add it to the manifest in [layouts/index.ogmanifest.json](../../layouts/index.ogmanifest.json).

Two cards are hand-copied from site pages, because Satori can't render that HTML:

- `card.js` redraws [layouts/card.html](../../layouts/card.html), at the same proportions and from the same data. **If you restyle the card page, update `card.js` too.**
- `cv.js` is its own layout, but borrows the fonts and colours of [layouts/cv.html](../../layouts/cv.html) and the same data.

### Satori gotchas

- It supports a **flexbox-only subset of CSS**. Every container needs `display: flex` (the `box` helper adds it), and there's no `list-style`, grid or most selectors.
- It **sizes a padded box's children as if it were content-box**, which pushes things off-centre. Use margins on the children instead of padding when a box has an explicit width.
- It **drops `image-rendering`**. [generate-og.js](generate-og.js) adds it back to the SVG for the pixel-art PNGs (`pixelate()`), so the logo and QR code stay crisp. Both are also scaled by whole numbers, for the same reason.
- Fonts must be **TTF/OTF (not woff2)**, one file per weight and style.

## Coverage checker

`npm run check:og` scans the built `public/` and checks that every page has an `og:image` tag pointing at an existing 1200×630 file. It prints coverage per card type, lists any problems, and exits non-zero if there are any, so it can gate CI.

It skips pages that shouldn't have one: `obs-embed` (iframe content), 404 pages, and alias redirects (plus the empty tags/categories listings, which are currently turned off in `hugo.toml`). Use `--verbose` to also list the pages that passed.

## Files

| Path | What it is |
|---|---|
| `generate-og.js` | Renders the images from the manifests |
| `card-type.js` | The rules for which card type each page gets (used by the generator and the checker) |
| `check-og.js` | Coverage checker |
| `fetch-og-assets.js` | Downloads the fonts and Twemoji files (run via `npm run fonts:fetch-og`) |
| `templates/` | One file per card type, plus `shared.js` and an `index.js` that registers them |
| `twemoji.js` | Local cache of Twemoji SVGs, used for emoji in titles (e.g. "🪴Garden") |
| `fonts/` | TTFs for Raleway (400, 700), Open Sans (400, 600, italic 400, italic 600) and Josefin Sans (400, 600, italic 400) |
| `twemoji/` | The cached emoji SVGs |

The fonts and emoji are committed, so CI doesn't need network access to build. [Twemoji](https://github.com/jdecked/twemoji) graphics are licensed CC-BY 4.0.
