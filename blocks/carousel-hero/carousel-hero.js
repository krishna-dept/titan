import buildCarousel from '../../scripts/carousel.js';
import {
  optimizePictures, isUrlText, linkTile, removeEmpty,
} from '../../scripts/block-utils.js';

const NAME = 'carousel-hero';

/**
 * Picks a short label for a slide: heading, link text, first line of text, image alt.
 */
function slideLabel(content, media, index) {
  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading?.textContent.trim()) return heading.textContent.trim();
  const link = [...content.querySelectorAll('a[href]')].find((a) => !isUrlText(a));
  if (link) return link.textContent.trim();
  const plain = content.cloneNode(true);
  plain.querySelectorAll('a[href]').forEach((a) => { if (isUrlText(a)) a.remove(); });
  const text = [...plain.querySelectorAll('p, div')].map((el) => el.textContent.trim()).find(Boolean)
    || plain.textContent.trim();
  if (text) return text.split('\n')[0].trim();
  const alt = media.querySelector('img')?.alt?.trim();
  return alt || `Slide ${index + 1}`;
}

/**
 * One authored row = one slide. Any cell may hold the image; an optional second image is
 * used on narrow screens. Remaining text becomes either the slide label (a single label
 * and/or link) or an overlay (heading, description, CTAs).
 */
function buildSlide(row, index) {
  if (!row.querySelector('picture, img') && !row.textContent.trim()) return null;

  optimizePictures(row, {
    eager: index === 0,
    breakpoints: [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }],
  });

  const inner = document.createElement('div');
  inner.className = `${NAME}-slide-inner`;
  const media = document.createElement('div');
  media.className = `${NAME}-slide-media`;
  const pictures = [...row.querySelectorAll('picture')];
  pictures.slice(0, 2).forEach((picture, i) => {
    if (pictures.length > 1) picture.classList.add(i === 0 ? `${NAME}-desktop` : `${NAME}-mobile`);
    const holder = picture.closest('a[href]');
    media.append(picture);
    // a linked image becomes a bare link so the whole slide can carry it
    if (holder && !holder.textContent.trim() && !holder.querySelector('img')) {
      holder.textContent = holder.getAttribute('href');
    }
  });

  const content = document.createElement('div');
  content.className = `${NAME}-slide-content`;
  [...row.children].forEach((cell) => content.append(...cell.childNodes));
  removeEmpty(content);

  const label = slideLabel(content, media, index);
  inner.dataset.label = label;

  const links = content.querySelectorAll('a[href]');
  const textBlocks = [...content.children].filter((el) => el.textContent.trim());
  const isSimple = !content.querySelector('h1, h2, h3, h4, h5, h6')
    && links.length <= 1 && textBlocks.length <= 2
    && (links.length === 0 || textBlocks.length <= 1 || isUrlText(links[0]));

  if (isSimple) {
    // label + optional link: the label shows in the indicator strip, the whole slide links
    inner.append(media);
    if (links.length === 1) {
      const holder = document.createElement('div');
      holder.append(media, links[0]);
      const anchor = linkTile(holder, `${NAME}-slide-link`);
      anchor.setAttribute('aria-label', label);
      [...anchor.children].forEach((child) => { if (child !== media) child.remove(); });
      inner.append(anchor);
    }
    content.remove();
  } else {
    // rich slide: overlay text; a bare URL link (e.g. from a linked image) links the image
    const bare = [...links].find((a) => isUrlText(a));
    if (bare && media.children.length) {
      const parent = bare.parentElement;
      bare.textContent = '';
      bare.className = `${NAME}-slide-link`;
      bare.setAttribute('aria-label', label);
      bare.removeAttribute('title');
      bare.append(...media.childNodes);
      media.append(bare);
      const emptyParent = parent && parent !== content
        && !parent.textContent.trim() && !parent.children.length;
      if (emptyParent) parent.remove();
    }
    inner.append(media, content);
  }
  if (!media.children.length) inner.classList.add(`${NAME}-slide-text-only`);
  return inner;
}

/**
 * Keeps the active label visible in the (horizontally scrollable) indicator strip without
 * scrolling the page itself.
 */
function revealIndicator(block, index) {
  const list = block.querySelector(`.${NAME}-indicators`);
  const item = list?.children[index];
  if (!item || list.scrollWidth <= list.clientWidth) return;
  const offset = item.getBoundingClientRect().left - list.getBoundingClientRect().left;
  const left = list.scrollLeft + offset - (list.clientWidth - item.offsetWidth) / 2;
  list.scrollTo({ left: Math.max(0, left) });
}

const AUTOPLAY = 6000;

export default function decorate(block) {
  // the active label's progress fill runs for exactly one autoplay interval
  block.style.setProperty(`--${NAME}-interval`, `${AUTOPLAY}ms`);
  buildCarousel(block, {
    name: NAME,
    mode: 'single',
    indicators: 'labels',
    loop: true,
    autoplay: AUTOPLAY,
    label: 'Featured',
    buildSlide,
    getLabel: (slide, i) => slide.firstElementChild?.dataset.label || `Slide ${i + 1}`,
    onChange: (slide, index) => revealIndicator(block, index),
  });
}
