/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-banner (container-width promo slider, `.promo-banner-carousel`).
 * Row per slide: [ desktop image + mobile image | bare promotion link ]
 */
const ORIGIN = 'https://www.titan.co.in/';

function abs(url) {
  if (!url) return '';
  let out = url.trim();
  try { out = new URL(out, ORIGIN).href; } catch (e) { /* keep as is */ }
  return out;
}

function firstSrc(srcset) {
  return (srcset || '').split(',')[0].trim().split(/\s+/)[0];
}

/** Returns [desktopUrl, mobileUrl] for a <picture> (mobile omitted when identical). */
function pictureUrls(scope) {
  const img = scope.querySelector('img');
  let desktop = '';
  let mobile = '';
  scope.querySelectorAll('source').forEach((s) => {
    const src = firstSrc(s.getAttribute('srcset') || s.getAttribute('data-srcset'));
    if (!src) return;
    const media = s.getAttribute('media') || '';
    if (/min-width/.test(media) && !desktop) desktop = src;
    else if (/max-width/.test(media) && !mobile) mobile = src;
  });
  const fallback = img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : '';
  if (!desktop) desktop = fallback || mobile;
  if (!mobile) mobile = fallback;
  desktop = abs(desktop);
  mobile = abs(mobile);
  // helix-importer builds an unescaped RegExp from image URLs: "[" / "]" in a path
  // (e.g. SALE-BANNERS-ALL-[Recovered-2].jpg) crash html2md, so such variants are dropped.
  const unsafe = (u) => /[[\]]|%5B|%5D/i.test(u);
  if (unsafe(mobile)) mobile = '';
  if (unsafe(desktop)) desktop = mobile;
  if (!desktop) return [];
  return mobile && mobile !== desktop ? [desktop, mobile] : [desktop];
}

function makeImg(document, src, alt) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || '';
  return img;
}

export default function parse(element, { document }) {
  const cells = [];
  const slides = [...element.querySelectorAll('.carousel-inner > .carousel-item')]
    .filter((s) => !s.classList.contains('slick-cloned'));

  slides.forEach((slide) => {
    const holder = slide.querySelector('[data-name]');
    const link = slide.querySelector('a[href]');
    const img = slide.querySelector('img');
    const alt = ((img && img.getAttribute('alt'))
      || (holder && holder.getAttribute('data-name'))
      || (link && (link.getAttribute('aria-label') || '').replace(/^Image Link For\s*/i, ''))
      || '').trim();

    const urls = pictureUrls(slide);
    if (!urls[0]) return;
    const imageCell = urls.map((u) => makeImg(document, u, alt));

    const linkCell = [];
    if (link && link.getAttribute('href') && link.getAttribute('href') !== '#') {
      const href = abs(link.getAttribute('href'));
      const a = document.createElement('a');
      a.href = href;
      a.textContent = href;
      linkCell.push(a);
    }
    cells.push([imageCell, linkCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-banner', cells });
  element.replaceWith(block);
}
