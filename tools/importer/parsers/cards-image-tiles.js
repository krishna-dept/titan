/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-image-tiles. Instances:
 *  - `.tw-1x2-grid` (watches for him / her, imageCTA components)
 *  - collection container holding two `.mobile-2r-2c` grids (8 shopByBrand tiles, one block)
 *  - `.tw-layout-4c-3r-container` (12 brand tiles)
 * Row per tile: [ tile image | bare tile link ]
 */
const ORIGIN = 'https://www.titan.co.in/';

function abs(url) {
  if (!url) return '';
  try { return new URL(url.trim(), ORIGIN).href; } catch (e) { return url.trim(); }
}

function firstSrc(srcset) {
  return (srcset || '').split(',')[0].trim().split(/\s+/)[0];
}

const unsafe = (u) => /[[\]]|%5B|%5D/i.test(u);

/** Desktop image URL (min-width source), falling back to the <img>. */
function tileImageUrl(scope) {
  const candidates = [];
  scope.querySelectorAll('source').forEach((s) => {
    const src = firstSrc(s.getAttribute('srcset') || s.getAttribute('data-srcset'));
    if (src && /min-width/.test(s.getAttribute('media') || '')) candidates.push(src);
  });
  const img = scope.querySelector('img');
  if (img) candidates.push(img.getAttribute('src') || img.getAttribute('data-src') || '');
  scope.querySelectorAll('source').forEach((s) => {
    candidates.push(firstSrc(s.getAttribute('srcset') || s.getAttribute('data-srcset')));
  });
  return candidates.map(abs).find((u) => u && !u.startsWith('data:') && !unsafe(u)) || '';
}

function labelOf(link, img) {
  const clean = (v) => {
    const t = (v || '').replace(/^Image Link For\s*/i, '').trim();
    return /^(null|undefined|image)$/i.test(t) ? '' : t;
  };
  return clean(img && img.getAttribute('alt')) || clean(link && link.getAttribute('aria-label'));
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(
    '.experience-commerce_assets-imageCTA, .experience-commerce_assets-shopByBrand',
  )];
  if (!items.length) {
    // fallback: every figure / linked picture in document order
    items = [...element.querySelectorAll('figure, a[href]')]
      .filter((el) => el.querySelector('img'))
      .filter((el) => !(el.tagName === 'A' && el.closest('figure')));
  }
  items = items.filter((el) => !el.closest('.slick-cloned'));

  const cells = [];
  items.forEach((item) => {
    const link = item.matches('a[href]') ? item : item.querySelector('a[href]');
    const img = item.querySelector('img');
    const src = tileImageUrl(item);
    if (!src) return;
    const image = document.createElement('img');
    image.src = src;
    image.alt = labelOf(link, img);

    const linkCell = [];
    const rawHref = link && link.getAttribute('href');
    if (rawHref && rawHref !== '#') {
      const href = abs(rawHref);
      const a = document.createElement('a');
      a.href = href;
      a.textContent = href;
      linkCell.push(a);
    }
    cells.push([[image], linkCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-image-tiles', cells });
  element.replaceWith(block);
}
