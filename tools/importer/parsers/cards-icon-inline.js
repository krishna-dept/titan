/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-icon-inline (`.signup-benefits-list`).
 * Row per benefit: [ icon | **title** + short line ]
 */
const ORIGIN = 'https://www.titan.co.in/';

function abs(url) {
  if (!url) return '';
  try { return new URL(url.trim(), ORIGIN).href; } catch (e) { return url.trim(); }
}

function firstSrc(srcset) {
  return (srcset || '').split(',')[0].trim().split(/\s+/)[0];
}

/** Desktop icon (min-width source) when present, else the <img>. */
function iconUrl(scope) {
  const candidates = [];
  scope.querySelectorAll('source').forEach((s) => {
    const src = firstSrc(s.getAttribute('srcset') || s.getAttribute('data-srcset'));
    if (src && /min-width/.test(s.getAttribute('media') || '')) candidates.push(src);
  });
  const img = scope.querySelector('img');
  if (img) candidates.push(img.getAttribute('src') || img.getAttribute('data-src') || '');
  return candidates.map(abs).find((u) => u && !u.startsWith('data:')) || '';
}

export default function parse(element, { document }) {
  const cells = [];
  element.querySelectorAll('.signup-benefit-item').forEach((item) => {
    const img = item.querySelector('img');
    const title = (item.querySelector('.benefit-heading') || { textContent: '' }).textContent.trim();
    const sub = (item.querySelector('.benefit-subheading') || { textContent: '' }).textContent.trim();

    const iconCell = [];
    const src = iconUrl(item.querySelector('.benefit-icon-wrapper') || item);
    if (src) {
      const icon = document.createElement('img');
      icon.src = src;
      icon.alt = (img && img.getAttribute('alt')) || title;
      iconCell.push(icon);
    }

    const textCell = [];
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = title;
      p.append(strong);
      textCell.push(p);
    }
    if (sub) {
      const p = document.createElement('p');
      p.textContent = sub;
      textCell.push(p);
    }
    const link = item.querySelector('a[href]');
    if (link && link.getAttribute('href') !== '#') {
      const a = document.createElement('a');
      a.href = abs(link.getAttribute('href'));
      a.textContent = a.href;
      textCell.push(a);
    }
    if (!iconCell.length && !textCell.length) return;
    cells.push([iconCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-inline', cells });
  element.replaceWith(block);
}
