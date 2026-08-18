# Duke Energy Homepage Migration Plan

## Objective
Migrate the homepage of **https://www.duke-energy.com/** into this AEM Edge Delivery Services project (`Nichols5973/dukeenergydemo`) with **full design fidelity** — matching the original site's content structure, layout, styling, header, and footer as closely as possible.

## Context (discovered)
- **Project type:** AEM Crosswalk (xwalk) / Universal Editor project — content source is AEM Author (`author-p87302-e1492027.adobeaemcloud.com`), and the repo contains `component-definition.json`, `component-models.json`, and `component-filters.json`.
- **AEM site path:** `/content/dukeenergydemo` · **Assets:** `/content/dam/dukeenergydemo`
- **Existing blocks:** accordion, cards, carousel, columns, embed, footer, form, fragment, header, hero, modal, quote, search, table, tabs, video
- **Target page:** Homepage (`/` → `index`)
- Execution requires **Execute mode** (this plan is read-only).

## Approach
Use the site-migration workflow: scrape the source, analyze page structure, reuse/create block variants, build import infrastructure, run the bundled import to generate content, then apply full design (site tokens + per-block styling) and migrate header/footer, verifying against the original via preview.

## Checklist

### 1. Discovery & Setup
- [ ] Confirm project type and Block Library endpoint (xwalk project)
- [ ] Verify preview server and workspace are ready

### 2. Scrape & Analyze Source
- [ ] Scrape `https://www.duke-energy.com/` — capture cleaned HTML, metadata, screenshots, and download images
- [ ] Identify page sections and content sequences (two-level structure analysis)
- [ ] Survey available blocks and map each section/sequence to a block or default content
- [ ] Decide authoring approach per sequence (block vs. default content) and choose/define block variants

### 3. Block Variants & Design System
- [ ] Reuse existing block variants where similarity is high; create new variants only where needed
- [ ] Extract site-level design tokens (colors, typography, spacing) from Duke Energy source
- [ ] Record block variant metadata for consistency

### 4. Import Infrastructure
- [ ] Generate page template(s) with block mappings for the homepage
- [ ] Generate block parsers for each variant
- [ ] Generate page transformers (cleanup, sections, media)
- [ ] Assemble the bundled import script (do NOT hand-write content HTML)

### 5. Run Import
- [ ] Execute the bundled import via `run-bulk-import.js` to produce homepage content
- [ ] Confirm content generated under the content directory

### 6. Full Design Migration
- [ ] Apply extracted site design tokens to `styles/styles.css`
- [ ] Style each migrated block to match the original (per-block design fidelity, up to 3 verification iterations)
- [ ] Migrate the **header/navigation** from the source
- [ ] Migrate the **footer** from the source

### 7. Verification
- [ ] Preview the homepage locally and inspect DOM/structure
- [ ] Visually critique migrated page vs. original; fix divergences
- [ ] Run post-import validation for content completeness

### 8. Publish (on request)
- [ ] Upload/publish the page to Document Authoring / AEM (only when user confirms)

## Notes / Decisions Needed
- Full design match confirmed by user (header + footer included).
- Homepage confirmed as the migration target.

---
*This plan is ready for execution. Switch to **Execute mode** to begin — I'll start by scraping and analyzing the Duke Energy homepage.*
