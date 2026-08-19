import { fetchPlaceholders } from './placeholders.js';

/**
 * Shared helpers for content-fragment / headless blocks.
 * Ported (minimal subset) to match the WeHealthcare setup.
 */

/**
 * Fetch the AEM author hostname from placeholders (key: `hostname`).
 * @returns {Promise<string|undefined>}
 */
export async function getHostname() {
  try {
    const placeholders = await fetchPlaceholders();
    const { hostname } = placeholders || {};
    if (hostname) return hostname;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error fetching placeholders for hostname:', error);
  }
  return undefined;
}

let cachedPathMappings = null;

/**
 * Load /paths.json (fstab-style mappings) once and cache it.
 * @returns {Promise<{mappings: string[], includes: string[]}>}
 */
export async function getPathMappings() {
  if (cachedPathMappings) return cachedPathMappings;
  try {
    const resp = await fetch('/paths.json', { headers: { Accept: 'application/json' } });
    if (!resp.ok) return { mappings: [], includes: [] };
    const json = await resp.json();
    cachedPathMappings = {
      mappings: Array.isArray(json.mappings) ? json.mappings.slice() : [],
      includes: Array.isArray(json.includes) ? json.includes.slice() : [],
    };
    return cachedPathMappings;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load /paths.json', e);
    return { mappings: [], includes: [] };
  }
}

/**
 * Map a given AEM content path to a site-relative path using mappings from
 * paths.json. Chooses the longest matching source prefix, preserves the
 * remaining suffix (without .html), and always returns a leading-slash path.
 * @param {string} aemPath
 * @returns {Promise<string>}
 */
export async function mapAemPathToSitePath(aemPath) {
  try {
    if (!aemPath || typeof aemPath !== 'string') return aemPath || '/';
    const url = new URL(aemPath, window.location.origin);
    let pathname = url.pathname || aemPath;
    pathname = pathname.replace(/\.html$/i, '');
    const { mappings } = await getPathMappings();
    if (!mappings || !mappings.length) return pathname;
    let best = null;
    mappings.forEach((entry) => {
      if (typeof entry !== 'string' || !entry.includes(':')) return;
      const [srcRaw, destRaw] = entry.split(':');
      const src = srcRaw.trim();
      const dest = (destRaw || '').trim();
      if (src && pathname.startsWith(src)) {
        if (!best || src.length > best.src.length) {
          best = { src, dest };
        }
      }
    });
    if (!best) return pathname;
    const suffix = pathname.substring(best.src.length);
    const join = (a, b) => {
      if (!a) return b || '/';
      if (!b) return a || '/';
      const left = a.endsWith('/') ? a.slice(0, -1) : a;
      const right = b.startsWith('/') ? b.slice(1) : b;
      return `/${[left, right].filter(Boolean).join('/')}`.replace(/\/{2,}/g, '/');
    };
    let mapped = join(best.dest, suffix);
    if (!mapped.startsWith('/')) mapped = `/${mapped}`;
    mapped = mapped.replace(/\/{2,}/g, '/');
    return mapped;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to map AEM path to site path', e);
    return aemPath;
  }
}
