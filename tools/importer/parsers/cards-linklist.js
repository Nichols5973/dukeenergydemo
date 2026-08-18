/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-linklist.
 * Base block: cards
 * Source: https://www.duke-energy.com/ (#main-content ... ul.group)
 * Project type: xwalk (field-hinted output)
 *
 * Library convention (Cards): container block, zero-to-N child rows.
 *   Each row = one card: [ image/icon (field:image) | text content (field:text richtext) ].
 *   Text cell holds grouped rich text: Title (heading) + a list of link items.
 *   imageAlt collapses onto the <img> alt attribute (no hint/cell).
 *   An image or text cell may be empty, but the empty cell must still be included.
 */
export default function parse(element, { document }) {
  // element is ul.group; each direct <li> is a linklist card.
  const items = Array.from(element.querySelectorAll(':scope > li'));

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((li) => {
    // Header icon: the real asset image in the card header (skip inline base64
    // arrow svgs used as list bullets).
    const icon = li.querySelector('header img[src^="http"], img[class*="size-64"]');

    // Title: the card heading.
    const heading = li.querySelector('h1, h2, h3, h4, h5, h6');

    // Link items: anchors within the card body list. Each inner <li> has one
    // anchor; collect them as a fresh <ul> of links for rich text.
    const anchors = Array.from(li.querySelectorAll('.grow a[href], div[class*="p-16"] a[href]'))
      .filter((a) => a.getAttribute('href'));

    // Image cell (field:image). Empty (no hint) if no icon, but cell included.
    const imageCell = icon
      ? [document.createComment(' field:image '), icon]
      : '';

    // Text cell (field:text): heading + list of links as rich text.
    const textParts = [document.createComment(' field:text ')];
    if (heading) textParts.push(heading);
    if (anchors.length) {
      const ul = document.createElement('ul');
      anchors.forEach((a) => {
        const item = document.createElement('li');
        item.appendChild(a);
        ul.appendChild(item);
      });
      textParts.push(ul);
    }
    const textCell = textParts.length > 1 ? textParts : '';

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-linklist', cells });
  element.replaceWith(block);
}
