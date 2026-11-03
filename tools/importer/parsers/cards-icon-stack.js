/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-icon-stack (`.tw-cb-section__container`, trust badges).
 * Row per badge: [ icon | short label ]
 */
const ORIGIN = 'https://www.titan.co.in/';

function abs(url) {
  if (!url) return '';
  try { return new URL(url.trim(), ORIGIN).href; } catch (e) { return url.trim(); }
}

export default function parse(element, { document }) {
  const cells = [];
  let items = [...element.querySelectorAll('.tw-cb-section__item')];
  if (!items.length) items = [...element.children];

  items.forEach((item) => {
    const img = item.querySelector('img');
    const labelEl = item.querySelector('p, span, h1, h2, h3, h4, h5, h6');
    const label = (labelEl ? labelEl.textContent : item.textContent).replace(/\s+/g, ' ').trim();

    const iconCell = [];
    const src = img && abs(img.getAttribute('src') || img.getAttribute('data-src'));
    if (src && !src.startsWith('data:')) {
      const icon = document.createElement('img');
      icon.src = src;
      icon.alt = (img.getAttribute('alt') || '').trim() || label;
      iconCell.push(icon);
    }

    const textCell = [];
    if (label) {
      const p = document.createElement('p');
      p.textContent = label;
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-stack', cells });
  element.replaceWith(block);
}
