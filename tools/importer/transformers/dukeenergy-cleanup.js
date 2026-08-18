/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Duke Energy site-wide cleanup.
 * Removes non-authorable global chrome (header, footer, nav, cookie consent)
 * so the import contains only page-level authorable content.
 *
 * All selectors verified against migration-work/cleaned.html:
 *  - #onetrust-consent-sdk    (line 978)  — cookie consent overlay
 *  - iframe                   (line 1185) — OneTrust resize iframe / tracking pixels
 *  - header.z-header          (line 5)    — sticky global site header
 *  - header.sr-only           (line 250)  — screen-reader-only page-title header
 *  - footer                   (line 490)  — global site footer (its internal
 *                                            <header> nav blocks go with it)
 *
 * NOTE: bare `header` is deliberately NOT removed — the "More for customers"
 * cards (cards-linklist) wrap each card title in an authorable <header>
 * (lines 326, 394, ...). Only the two site-chrome headers above are targeted.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent / privacy overlays — removed before parsing so they can't
    // interfere with block matching.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.onetrust-pc-dark-filter',
      'iframe',
      // Mobile hamburger navigation drawer (off-canvas overlay). Sits outside
      // header.z-header, so it must be removed explicitly or its duplicate
      // "Navigation" link lists leak into the imported content.
      'nav#hamburger-nav',
      'div.z-overlay',
      '.fixed.inset-0.z-overlay',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (site shell / layout).
    // Only the two site-chrome headers are targeted — bare `header` would also
    // strip the authorable card headers in the "More for customers" section.
    WebImporter.DOMUtils.remove(element, [
      'header.z-header',
      'header.sr-only',
      'footer',
      'link',
      'noscript',
      'style',
      'script',
      // Trailing analytics / tracking-pixel images injected by third-party tags.
      // They render as empty <picture> elements at the end of the content.
      'img[src*="jadserve.postrelease.com"]',
      'img[src*="qualtrics.com"]',
      'img[src*="t.co/"]',
      'img[src*="analytics.twitter.com"]',
    ]);
  }
}
