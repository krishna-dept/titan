/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-tiles (`.tw-woalf-carousel` shop by price, `.tw-shopbylooks-carousel`
 * new arrivals / discover your style). The section heading stays default content.
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

/** Desktop image URL of a <picture> (min-width source), falling back to the <img>. */
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
  const cells = [];
  const items = [...element.querySelectorAll('.tw-image-cta-container, .tw-slick-slide')]
    // one unit per slide: prefer the inner .tw-image-cta-container, skip its .tw-slick-slide parent
    .filter((el) => !(el.classList.contains('tw-slick-slide') && el.querySelector('.tw-image-cta-container')))
    .filter((el) => !el.closest('.slick-cloned'));

  items.forEach((item) => {
    const link = item.querySelector('a[href]');
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

  // The section heading sits inside the slider wrapper; keep it as default content before the block.
  const heading = element.querySelector('.tw-woalf-carousel__heading, .tw-shopbylooks-carousel__heading');
  if (heading) element.before(heading);

  // Shop by Price (.tw-woalf-carousel) uses the smaller, centred tile layout.
  const name = element.classList.contains('tw-woalf-carousel') ? 'carousel-tiles (compact)' : 'carousel-tiles';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
