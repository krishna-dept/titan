/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-bento (`.tw-trending-banners__grid`, "movement in time").
 * The first tile is the featured (large) tile. Row per tile: [ tile image | bare tile link ]
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
  return candidates.map(abs).find((u) => u && !u.startsWith('data:') && !unsafe(u)) || '';
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.tw-trending-banners__item')];
  if (!items.length) {
    items = [...element.querySelectorAll('a[href], figure')].filter((el) => el.querySelector('img'));
  }

  const cells = [];
  items.forEach((item) => {
    const link = item.matches('a[href]') ? item : item.querySelector('a[href]');
    const img = item.querySelector('img');
    const src = tileImageUrl(item);
    if (!src) return;
    const image = document.createElement('img');
    image.src = src;
    image.alt = ((img && img.getAttribute('alt')) || '').trim();

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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-bento', cells });
  element.replaceWith(block);
}
