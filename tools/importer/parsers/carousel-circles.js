/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-circles (`.tw-category-carousel.desktop-view-active`).
 * The heading stays default content.
 * Row per category: [ circle image | label link ]
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

function imageUrl(scope) {
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

export default function parse(element, { document }) {
  const cells = [];
  const tiles = [...element.querySelectorAll('.tw-category-tile')]
    .filter((t) => !t.closest('.slick-cloned'));

  tiles.forEach((tile) => {
    const labelEl = tile.querySelector('.tw-category-tile__content, .tw-category-tile__label');
    const imageLink = tile.querySelector('.tw-category-tile__image a[href]');
    const labelLink = tile.querySelector('a.tw-category-tile__url[href]') || imageLink;
    const label = (labelEl ? labelEl.textContent : '').trim()
      || (imageLink && (imageLink.getAttribute('data-gtm') || '')).trim();
    const src = imageUrl(tile.querySelector('.tw-category-tile__image') || tile);
    if (!src && !label) return;

    const imageCell = [];
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = label;
      imageCell.push(img);
    }

    const textCell = [];
    const rawHref = labelLink && labelLink.getAttribute('href');
    if (rawHref && rawHref !== '#') {
      const a = document.createElement('a');
      a.href = abs(rawHref);
      a.textContent = label || a.href;
      textCell.push(a);
    } else if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      textCell.push(p);
    }
    cells.push([imageCell, textCell]);
  });

  // The section heading sits inside the slider wrapper; keep it as default content before the block.
  const heading = element.querySelector('.tw-category-carousel__heading');
  if (heading) element.before(heading);

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-circles', cells });
  element.replaceWith(block);
}
