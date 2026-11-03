/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-hero (Titan homepage hero slider, `.tw-hero-carousel`).
 * Row per slide: [ desktop image + mobile image | label paragraph + bare slide link ]
 * Labels come from the `.progress-indicator` strip (same order as the slides),
 * falling back to the slide's data-imagename / data-name / aria-label.
 */
const ORIGIN = 'https://www.titan.co.in/';

function abs(url) {
  if (!url) return '';
  try { return new URL(url.trim(), ORIGIN).href; } catch (e) { return url.trim(); }
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
  return mobile && mobile !== desktop ? [desktop, mobile] : [desktop];
}

function makeImg(document, src, alt) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || '';
  return img;
}

export default function parse(element, { document }) {
  const labels = [...element.querySelectorAll('.progress-indicator li')]
    .map((li) => (li.querySelector('span') || li).textContent.trim());

  const cells = [];
  const slides = [...element.querySelectorAll('.carousel-inner > .carousel-item')]
    .filter((s) => !s.classList.contains('slick-cloned'));

  slides.forEach((slide, i) => {
    const holder = slide.querySelector('[data-imagename], [data-name]');
    const link = slide.querySelector('a[href]');
    let label = labels[i]
      || (holder && (holder.getAttribute('data-imagename') || holder.getAttribute('data-name')))
      || (link && (link.getAttribute('aria-label') || '').replace(/^Image Link For\s*/i, ''))
      || '';
    label = label.trim();

    const urls = pictureUrls(slide);
    if (!urls[0]) return;
    const imageCell = urls.map((u) => makeImg(document, u, label));

    const textCell = [];
    if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      textCell.push(p);
    }
    if (link) {
      const href = abs(link.getAttribute('href'));
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = href;
      p.append(a);
      textCell.push(p);
    }
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
