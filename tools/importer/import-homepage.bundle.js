/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-quickhelp.js
  function parse(element, { document: document2 }) {
    const picture = element.querySelector(":scope > picture, picture");
    const bgImage = picture || element.querySelector('img[class*="object-cover"], img[class*="w-full"]');
    const heading = element.querySelector(':scope > h2, h1, h2, [class*="drop-shadow"]');
    if (!heading && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      cells.push([[document2.createComment(" field:image "), bgImage]]);
    } else {
      cells.push([""]);
    }
    if (heading) {
      cells.push([[document2.createComment(" field:text "), heading]]);
    } else {
      cells.push([""]);
    }
    const quicklinksUl = element.querySelector("ul");
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-quickhelp", cells });
    element.replaceWith(block);
    if (quicklinksUl) block.after(quicklinksUl);
  }

  // tools/importer/parsers/cards-quicklinks.js
  function parse2(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(":scope > li"));
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((li) => {
      const img = li.querySelector("img");
      const link = li.querySelector("a[href]");
      const imageCell = img ? [document2.createComment(" field:image "), img] : "";
      let textContent = link;
      if (!textContent) {
        textContent = li.querySelector("span") || null;
      }
      const textCell = textContent ? [document2.createComment(" field:text "), textContent] : "";
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-quicklinks", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  function parse3(element, { document: document2 }) {
    const card = element.querySelector(":scope > div") || element;
    const image = card.querySelector("img");
    const panel = card.querySelector('div[class*="flex-col"]') || card.querySelector(":scope > div:last-child");
    if (!image && !panel) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const leftCell = image ? [image] : [""];
    const rightCell = [];
    if (panel) {
      const label = panel.querySelector('span[class*="uppercase"]');
      const heading = panel.querySelector("h1, h2, h3, h4, h5, h6");
      const paras = Array.from(panel.querySelectorAll(":scope > p"));
      if (label) rightCell.push(label);
      if (heading) rightCell.push(heading);
      paras.forEach((p) => rightCell.push(p));
    }
    if (!rightCell.length) rightCell.push("");
    const cells = [[leftCell, rightCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-linklist.js
  function parse4(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(":scope > li"));
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((li) => {
      const icon = li.querySelector('header img[src^="http"], img[class*="size-64"]');
      const heading = li.querySelector("h1, h2, h3, h4, h5, h6");
      const anchors = Array.from(li.querySelectorAll('.grow a[href], div[class*="p-16"] a[href]')).filter((a) => a.getAttribute("href"));
      const imageCell = icon ? [document2.createComment(" field:image "), icon] : "";
      const textParts = [document2.createComment(" field:text ")];
      if (heading) textParts.push(heading);
      if (anchors.length) {
        const ul = document2.createElement("ul");
        anchors.forEach((a) => {
          const item = document2.createElement("li");
          item.appendChild(a);
          ul.appendChild(item);
        });
        textParts.push(ul);
      }
      const textCell = textParts.length > 1 ? textParts : "";
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-linklist", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/dukeenergy-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".onetrust-pc-dark-filter",
        "iframe",
        // Mobile hamburger navigation drawer (off-canvas overlay). Sits outside
        // header.z-header, so it must be removed explicitly or its duplicate
        // "Navigation" link lists leak into the imported content.
        "nav#hamburger-nav",
        "div.z-overlay",
        ".fixed.inset-0.z-overlay"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.z-header",
        "header.sr-only",
        "footer",
        "link",
        "noscript",
        "style",
        "script",
        // Trailing analytics / tracking-pixel images injected by third-party tags.
        // They render as empty <picture> elements at the end of the content.
        'img[src*="jadserve.postrelease.com"]',
        'img[src*="qualtrics.com"]',
        'img[src*="t.co/"]',
        'img[src*="analytics.twitter.com"]'
      ]);
    }
  }

  // tools/importer/transformers/dukeenergy-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Duke Energy residential homepage: hero with heading, quick-help link cards, featured promo, and a multi-column 'more for customers' cards section with header and footer.",
    urls: [
      "https://www.duke-energy.com/"
    ],
    blocks: [
      {
        name: "hero-quickhelp",
        instances: ["#main-content > section.bg-teal-darker"]
      },
      {
        name: "cards-quicklinks",
        instances: ["#main-content > section.bg-teal-darker ul"]
      },
      {
        name: "columns-promo",
        instances: ["#featured-product-card"]
      },
      {
        name: "cards-linklist",
        instances: ["#main-content > section.flex.flex-col.py-32:nth-of-type(3) ul.group"]
      }
    ],
    sections: [
      {
        id: "rc2",
        name: "teal-hero-quick-help",
        selector: "#main-content > section.bg-teal-darker",
        style: "teal-darker",
        blocks: ["hero-quickhelp", "cards-quicklinks"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "summer-energy-solutions-promo",
        selector: "#main-content > section.flex.flex-col.py-32:nth-of-type(2)",
        style: null,
        blocks: ["columns-promo"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "more-for-customers",
        selector: "#main-content > section.flex.flex-col.py-32:nth-of-type(3)",
        style: null,
        blocks: ["cards-linklist"],
        defaultContent: ["#main-content > section.flex.flex-col.py-32:nth-of-type(3) h2"]
      }
    ]
  };
  var parsers = {
    "hero-quickhelp": parse,
    "cards-quicklinks": parse2,
    "columns-promo": parse3,
    "cards-linklist": parse4
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
