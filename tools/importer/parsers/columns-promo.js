/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-promo.
 * Base block: columns
 * Source: https://www.duke-energy.com/ (#featured-product-card)
 * Project type: xwalk
 *
 * Library convention (Columns): row 1 = block name; row 2 = N side-by-side
 * column cells (here 2). Cells contain default content (text, images, inline
 * elements). Columns blocks do NOT use field:* comments.
 *
 * Layout: one content row with 2 columns:
 *   Col 1: promo image
 *   Col 2: "Featured" label, heading (with link), description, CTA
 */
export default function parse(element, { document }) {
  // Inner card wrapper holds the image + text panel.
  const card = element.querySelector(':scope > div') || element;

  // Column 1: the promo image (direct child img of the card).
  const image = card.querySelector('img');

  // Column 2: the text panel (the flex column div containing the copy).
  const panel = card.querySelector('div[class*="flex-col"]')
    || card.querySelector(':scope > div:last-child');

  if (!image && !panel) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const leftCell = image ? [image] : [''];

  // Right cell: collect the meaningful content nodes from the panel.
  const rightCell = [];
  if (panel) {
    const label = panel.querySelector('span[class*="uppercase"]');
    const heading = panel.querySelector('h1, h2, h3, h4, h5, h6');
    const paras = Array.from(panel.querySelectorAll(':scope > p'));

    if (label) rightCell.push(label);
    if (heading) rightCell.push(heading);
    paras.forEach((p) => rightCell.push(p));
  }
  if (!rightCell.length) rightCell.push('');

  // Single content row, two columns.
  const cells = [[leftCell, rightCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
