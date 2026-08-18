import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Inline brand icons (single-color paths, inherit currentColor) keyed by a
// substring of the destination URL. Kept generic so any footer can reuse them.
const SOCIAL_ICONS = [
  { match: ['facebook.com'], label: 'Facebook', path: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94z' },
  { match: ['x.com', 'twitter.com'], label: 'Twitter', path: 'M18.24 2.25h3.31l-7.23 8.26L22.85 21.75h-6.66l-5.22-6.82-5.97 6.82H1.68l7.73-8.84L1.15 2.25h6.83l4.71 6.23 5.55-6.23zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64z' },
  { match: ['instagram.com'], label: 'Instagram', path: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.44c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.19.41-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.17.42-.36 1.04-.41 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.41 2.19.21.55.47.94.88 1.35.41.41.8.67 1.35.88.42.17 1.04.36 2.19.41 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.19-.41.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.17-.42.36-1.04.41-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.41-2.19a3.6 3.6 0 00-.88-1.35 3.6 3.6 0 00-1.35-.88c-.42-.17-1.04-.36-2.19-.41-1.24-.06-1.61-.07-4.76-.07zm0 3.67a4.73 4.73 0 110 9.46 4.73 4.73 0 010-9.46zm0 7.8a3.07 3.07 0 100-6.14 3.07 3.07 0 000 6.14zm6.03-7.98a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z' },
  { match: ['linkedin.com'], label: 'LinkedIn', path: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z' },
  { match: ['/rss', 'news.duke-energy'], label: 'RSS', path: 'M4.26 11.06a8.68 8.68 0 018.68 8.68h-2.45a6.23 6.23 0 00-6.23-6.23v-2.45zm0-4.44c8.35 0 15.12 6.77 15.12 15.12h-2.45c0-7-5.67-12.67-12.67-12.67V6.62zM6.18 20a1.92 1.92 0 11-3.84 0 1.92 1.92 0 013.84 0z' },
  { match: ['youtube.com'], label: 'YouTube', path: 'M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3.02 3.02 0 002.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 002.12-2.14A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8zM9.6 15.6V8.4l6.27 3.6L9.6 15.6z' },
  { match: ['tiktok.com'], label: 'TikTok', path: 'M16.6 5.82a4.28 4.28 0 01-1.05-2.82h-3.1v12.4a2.53 2.53 0 01-2.53 2.45 2.53 2.53 0 01-2.53-2.53 2.53 2.53 0 012.53-2.53c.26 0 .51.04.75.11v-3.16a5.7 5.7 0 00-.75-.05A5.66 5.66 0 004.3 15.32a5.66 5.66 0 0011.32 0V9.01a7.34 7.34 0 004.28 1.37V7.28a4.28 4.28 0 01-3.3-1.46z' },
];

function iconFor(href) {
  return SOCIAL_ICONS.find((ic) => ic.match.some((m) => href.includes(m)));
}

/**
 * Replaces text-only social links with inline brand icons (label kept as
 * accessible text). Detects the social list as the <ul> whose links all map
 * to a known icon, so it's not tied to a fixed position in the fragment.
 * @param {Element} footer The decorated footer container
 */
function decorateSocialIcons(footer) {
  footer.querySelectorAll('ul').forEach((ul) => {
    const links = [...ul.querySelectorAll(':scope > li > a')];
    if (links.length < 3) return;
    const allSocial = links.every((a) => iconFor(a.href));
    if (!allSocial) return;
    ul.classList.add('footer-social');
    links.forEach((a) => {
      const ic = iconFor(a.href);
      const label = a.textContent.trim();
      a.setAttribute('aria-label', label);
      a.setAttribute('title', label);
      a.innerHTML = `<span class="footer-social-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="${ic.path}"></path></svg></span><span class="sr-only">${label}</span>`;
    });
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/content/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  decorateSocialIcons(footer);

  // Tag the app-store badge list (a <ul> whose links wrap images) so CSS can
  // lay the badges out in a row.
  footer.querySelectorAll('ul').forEach((ul) => {
    const links = [...ul.querySelectorAll(':scope > li > a')];
    if (links.length && links.every((a) => a.querySelector('img'))) {
      ul.classList.add('footer-apps');
    }
  });

  block.append(footer);
}
