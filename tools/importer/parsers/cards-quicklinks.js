/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-quicklinks.
 * Base block: cards
 * Source: https://www.duke-energy.com/ (#main-content > section.bg-teal-darker ul)
 * Project type: xwalk (field-hinted output)
 *
 * Library convention (Cards): container block, zero-to-N child rows.
 *   Each row = one card: [ image/icon (field:image) | text content (field:text richtext) ].
 *   An image or text cell may be empty, but the empty cell must still be included.
 *   imageAlt collapses onto the <img> alt attribute (no hint/cell).
 */
export default function parse(element, { document }) {
  // element is the <ul>; each direct <li> is a quick-link card.
  const items = Array.from(element.querySelectorAll(':scope > li'));

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((li) => {
    // Icon image for the card.
    const img = li.querySelector('img');

    // Link/label. Prefer the anchor so the href is preserved. The label text
    // lives in a <span> inside the <a>; keep the whole anchor as richtext.
    const link = li.querySelector('a[href]');

    // Image cell (field:image). Empty cell (no hint) if absent, but still included.
    const imageCell = img
      ? [document.createComment(' field:image '), img]
      : '';

    // Text cell (field:text) - the link, or fall back to the li's span/text.
    let textContent = link;
    if (!textContent) {
      textContent = li.querySelector('span') || null;
    }
    const textCell = textContent
      ? [document.createComment(' field:text '), textContent]
      : '';

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-quicklinks', cells });
  element.replaceWith(block);
}
