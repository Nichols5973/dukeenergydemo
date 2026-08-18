/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroQuickhelpParser from './parsers/hero-quickhelp.js';
import cardsQuicklinksParser from './parsers/cards-quicklinks.js';
import columnsPromoParser from './parsers/columns-promo.js';
import cardsLinklistParser from './parsers/cards-linklist.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/dukeenergy-cleanup.js';
import sectionsTransformer from './transformers/dukeenergy-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: "Duke Energy residential homepage: hero with heading, quick-help link cards, featured promo, and a multi-column 'more for customers' cards section with header and footer.",
  urls: [
    'https://www.duke-energy.com/',
  ],
  blocks: [
    {
      name: 'hero-quickhelp',
      instances: ['#main-content > section.bg-teal-darker'],
    },
    {
      name: 'cards-quicklinks',
      instances: ['#main-content > section.bg-teal-darker ul'],
    },
    {
      name: 'columns-promo',
      instances: ['#featured-product-card'],
    },
    {
      name: 'cards-linklist',
      instances: ['#main-content > section.flex.flex-col.py-32:nth-of-type(3) ul.group'],
    },
  ],
  sections: [
    {
      id: 'rc2',
      name: 'teal-hero-quick-help',
      selector: '#main-content > section.bg-teal-darker',
      style: 'teal-darker',
      blocks: ['hero-quickhelp', 'cards-quicklinks'],
      defaultContent: [],
    },
    {
      id: 'rc3',
      name: 'summer-energy-solutions-promo',
      selector: '#main-content > section.flex.flex-col.py-32:nth-of-type(2)',
      style: null,
      blocks: ['columns-promo'],
      defaultContent: [],
    },
    {
      id: 'rc4',
      name: 'more-for-customers',
      selector: '#main-content > section.flex.flex-col.py-32:nth-of-type(3)',
      style: null,
      blocks: ['cards-linklist'],
      defaultContent: ['#main-content > section.flex.flex-col.py-32:nth-of-type(3) h2'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-quickhelp': heroQuickhelpParser,
  'cards-quicklinks': cardsQuicklinksParser,
  'columns-promo': columnsPromoParser,
  'cards-linklist': cardsLinklistParser,
};

// TRANSFORMER REGISTRY - cleanup runs first, section transformer runs after
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * Order matters: the hero (section container) is discovered before
 * cards-quicklinks (the nested <ul>) so the hero parser can extract its rows
 * before the <ul> is parsed into a separate block.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup + section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path. Map the root/homepage URL to /index.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
