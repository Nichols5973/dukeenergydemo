/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Duke Energy section breaks + section metadata.
 *
 * Reads payload.template.sections (from page-templates.json). Sections for the
 * homepage template (all selectors verified against migration-work/cleaned.html):
 *   rc2  #main-content > section.bg-teal-darker                       (line 255) style: teal-darker
 *   rc3  #main-content > section.flex.flex-col.py-32:nth-of-type(2)   (line 297) style: null
 *   rc4  #main-content > section.flex.flex-col.py-32:nth-of-type(3)   (line 316) style: null
 *
 * Breaks (<hr>) are inserted in beforeTransform while every section element
 * still exists (block parsers replace section elements between the hooks). A
 * temporary marker attribute anchors each styled section's Section Metadata
 * block, which is created in afterTransform. Sections are processed in reverse
 * so inserts never shift the positions of not-yet-processed sections.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
