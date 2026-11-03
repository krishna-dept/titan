/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-strip (`.tw-login-banner-wrapper`, NeuCoins login strip).
 * Row 1: [ desktop background image + mobile background image ]
 * Row 2: [ short text line + CTA link ]
 * The inline NeuCoin glyph inside the text is dropped (a second image in the block is read
 * as the mobile background). The source CTA is a modal <button> without a URL, so it is
 * rebuilt as a link to the site login page.
 */
const ORIGIN = 'https://www.titan.co.in/';
const LOGIN_URL = 'https://www.titan.co.in/login';

function abs(url) {
  if (!url) return '';
  try { return new URL(url.trim(), ORIGIN).href; } catch (e) { return url.trim(); }
}

function firstSrc(srcset) {
  return (srcset || '').split(',')[0].trim().split(/\s+/)[0];
}

export default function parse(element, { document }) {
  const picture = element.querySelector(':scope > picture') || element.querySelector('picture');
  const bgImg = picture ? picture.querySelector('img') : element.querySelector('img.tw-login-banner');
  const alt = ((bgImg && bgImg.getAttribute('alt')) || '').trim();

  let desktop = '';
  if (picture) {
    picture.querySelectorAll('source').forEach((s) => {
      const src = firstSrc(s.getAttribute('srcset') || s.getAttribute('data-srcset'));
      if (src && !desktop && /min-width/.test(s.getAttribute('media') || '')) desktop = src;
    });
  }
  const mobile = bgImg ? (bgImg.getAttribute('src') || bgImg.getAttribute('data-src') || '') : '';
  const urls = [abs(desktop || mobile), abs(mobile)].filter((u, i, a) => u && a.indexOf(u) === i);

  const cells = [];
  const imageCell = urls.map((u) => {
    const img = document.createElement('img');
    img.src = u;
    img.alt = alt;
    return img;
  });
  if (imageCell.length) cells.push([imageCell]);

  const content = [];
  const heading = element.querySelector('.tw-section-heading, .tw-login-prompt');
  if (heading) {
    const clone = heading.cloneNode(true);
    clone.querySelectorAll('img, button, a').forEach((el) => el.replaceWith(' '));
    const text = clone.textContent.replace(/\s+/g, ' ').trim();
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      content.push(p);
    }
  }
  const cta = element.querySelector('a[href], button');
  if (cta) {
    const label = cta.textContent.replace(/\s+/g, ' ').trim() || 'Login Now';
    const rawHref = cta.tagName === 'A' ? cta.getAttribute('href') : '';
    const a = document.createElement('a');
    a.href = rawHref && rawHref !== '#' ? abs(rawHref) : LOGIN_URL;
    a.textContent = label;
    const p = document.createElement('p');
    p.append(a);
    content.push(p);
  }
  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-strip', cells });
  element.replaceWith(block);
}
