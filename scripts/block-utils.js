import { createOptimizedPicture } from './aem.js';

/**
 * Optimizes authored pictures. Only same-origin, non-SVG images are rewritten:
 * createOptimizedPicture keeps only the pathname (migrated images still point at the
 * source host until upload) and can't transcode SVG, so anything else keeps its picture.
 * @param {Element} root Element containing the pictures
 * @param {object} [opts]
 * @param {boolean} [opts.eager] Load the first optimized image eagerly (LCP candidates)
 * @param {Array} [opts.breakpoints] createOptimizedPicture breakpoints
 */
export function optimizePictures(root, { eager = false, breakpoints = [{ width: '750' }] } = {}) {
  root.querySelectorAll('picture > img').forEach((img, idx) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) {
      if (eager && idx === 0) img.loading = 'eager';
      return;
    }
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, eager && idx === 0, breakpoints),
    );
  });
}

/**
 * Whether a link's visible text is just its URL (an author pasted a bare link).
 * @param {HTMLAnchorElement} a
 */
export function isUrlText(a) {
  const text = a.textContent.trim();
  if (!text) return true;
  // only text that is itself written as a URL; a plain word such as "Automatic" linking to
  // /Automatic is a label, even though it would resolve to the same address
  return /^(https?:|mailto:|tel:|\/|www\.)/i.test(text) && !/\s/.test(text);
}

/**
 * Removes empty paragraphs/divs left behind after moving authored content around.
 * @param {Element} root
 */
export function removeEmpty(root) {
  root.querySelectorAll('p, div').forEach((el) => {
    if (!el.children.length && !el.textContent.trim()) el.remove();
  });
}

/**
 * Replaces an authored link with its own content (keeps the label text, drops the link and
 * any button decoration added by decorateButtons).
 * @param {HTMLAnchorElement} a
 */
function unwrapLink(a) {
  const wrapper = a.closest('.button-wrapper');
  if (wrapper) wrapper.classList.remove('button-wrapper');
  if (isUrlText(a)) {
    a.remove();
  } else {
    const span = document.createElement('span');
    span.className = a.className.split(' ').filter((c) => !['button', 'primary', 'secondary', 'accent'].includes(c)).join(' ');
    if (!span.className) span.removeAttribute('class');
    span.append(...a.childNodes);
    a.replaceWith(span);
  }
}

/**
 * Turns a tile that holds exactly one link into a single, fully clickable link.
 * Works whether the author linked the image itself or placed a link (bare URL or labelled)
 * next to it. Tiles with zero or several links are left untouched.
 * @param {Element} tile Element whose children become the link content
 * @param {string} [className] Class for the created anchor
 * @returns {HTMLAnchorElement|null} The created link, if any
 */
export function linkTile(tile, className) {
  const links = [...tile.querySelectorAll('a[href]')];
  if (links.length !== 1) return null;
  const [link] = links;
  const anchor = document.createElement('a');
  anchor.href = link.getAttribute('href');
  ['target', 'rel'].forEach((attr) => {
    if (link.hasAttribute(attr)) anchor.setAttribute(attr, link.getAttribute(attr));
  });
  const { title } = link;
  if (title && !isUrlText(link) && title !== link.textContent.trim()) anchor.title = title;
  if (className) anchor.className = className;
  unwrapLink(link);
  removeEmpty(tile);
  anchor.append(...tile.childNodes);
  tile.append(anchor);

  // the link needs an accessible name: visible text, else image alt text
  const visible = anchor.textContent.trim().replace(/\s+/g, ' ').toLowerCase();
  if (visible) {
    // alt text that only repeats the visible label would be announced twice
    anchor.querySelectorAll('img[alt]').forEach((img) => {
      if (img.alt.trim().toLowerCase() === visible) img.alt = '';
    });
  } else {
    const alts = [...anchor.querySelectorAll('img[alt]')].map((img) => img.alt.trim()).filter(Boolean);
    if (alts.length) {
      anchor.setAttribute('aria-label', alts[0]);
    } else {
      const slug = new URL(anchor.href, window.location.href).pathname.split('/').filter(Boolean).pop();
      if (slug) anchor.setAttribute('aria-label', decodeURIComponent(slug).replace(/[-_]+/g, ' ').replace(/\.\w+$/, ''));
    }
  }
  return anchor;
}

/**
 * Whether a cell holds only media (picture/image/icon) and no text.
 * @param {Element} cell
 */
export function isMediaCell(cell) {
  return !!cell.querySelector('picture, img, .icon') && !cell.textContent.trim();
}
