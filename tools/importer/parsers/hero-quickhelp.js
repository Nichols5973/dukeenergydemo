/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-quickhelp.
 * Base block: hero
 * Source: https://www.duke-energy.com/ (#main-content > section.bg-teal-darker)
 * Project type: xwalk (field-hinted output)
 *
 * NOTE: This section also contains the quick-help links <ul>, which is a
 * SEPARATE block (cards-quicklinks) per page-templates.json. Those links are
 * intentionally NOT captured here to avoid duplicating cards-quicklinks content;
 * completeness heuristics that measure against the full section text will
 * therefore report link text as "missing" — by design/expected (owned by cards-quicklinks).
 *
 * Library convention (Hero): 1 column, 3 rows.
 *   Row 1: block name (added by createBlock)
 *   Row 2: Background Image (optional)  -> model field:image (imageAlt collapsed onto <img> alt)
 *   Row 3: Title / Subheading / CTA     -> model field:text (richtext)
 *   Never more than 3 rows.
 */
export default function parse(element, { document }) {
  // Background image: full-bleed <picture> that is the hero's own design.
  // Prefer the direct <picture>, fall back to the first background-ish <img>.
  const picture = element.querySelector(':scope > picture, picture');
  const bgImage = picture || element.querySelector('img[class*="object-cover"], img[class*="w-full"]');

  // Heading: centered white "How can we help you?" (source uses h2).
  const heading = element.querySelector(':scope > h2, h1, h2, [class*="drop-shadow"]');

  // Empty-block guard: without a heading or image there is nothing to author.
  if (!heading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: Background Image (field:image). imageAlt collapses onto the <img> alt attribute.
  if (bgImage) {
    cells.push([[document.createComment(' field:image '), bgImage]]);
  } else {
    cells.push(['']);
  }

  // Row 3: Title/Subheading/CTA content (field:text richtext) - the hero heading.
  if (heading) {
    cells.push([[document.createComment(' field:text '), heading]]);
  } else {
    cells.push(['']);
  }

  // The quick-help links <ul> inside this section is a SEPARATE block
  // (cards-quicklinks). Preserve that exact node so the cards-quicklinks parser
  // — which holds a reference to it from block discovery — still finds it
  // attached to the DOM after the hero replaces the section container.
  const quicklinksUl = element.querySelector('ul');

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-quickhelp', cells });
  element.replaceWith(block);

  // Re-insert the quick-help <ul> as a sibling right after the hero block so it
  // stays within the same section (before the next section break) and remains
  // available for the cards-quicklinks parser.
  if (quicklinksUl) block.after(quicklinksUl);
}
