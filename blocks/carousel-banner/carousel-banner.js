import buildCarousel from '../../scripts/carousel.js';
import { optimizePictures, linkTile, removeEmpty } from '../../scripts/block-utils.js';

const NAME = 'carousel-banner';

/**
 * One authored row = one banner. The image may sit in any cell; an optional second image
 * is used on narrow screens. A single link anywhere in the row (on the image or as text)
 * makes the whole banner clickable. Any other text is kept as a caption.
 */
function buildSlide(row) {
  if (!row.querySelector('picture, img') && !row.textContent.trim()) return null;
  optimizePictures(row, {
    breakpoints: [{ media: '(min-width: 600px)', width: '1600' }, { width: '750' }],
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
    if (holder && !holder.textContent.trim() && !holder.querySelector('img')) {
      holder.textContent = holder.getAttribute('href');
    }
  });

  const caption = document.createElement('div');
  caption.className = `${NAME}-slide-caption`;
  [...row.children].forEach((cell) => caption.append(...cell.childNodes));
  removeEmpty(caption);

  inner.append(media, caption);
  const anchor = linkTile(inner, `${NAME}-slide-link`);
  removeEmpty(anchor || inner);
  const captionEl = inner.querySelector(`.${NAME}-slide-caption`);
  if (captionEl && !captionEl.textContent.trim()) captionEl.remove();
  return inner;
}

export default function decorate(block) {
  buildCarousel(block, {
    name: NAME,
    mode: 'single',
    indicators: 'dots',
    loop: true,
    autoplay: 5000,
    label: 'Promotions',
    buildSlide,
    getLabel: (slide, i) => slide.querySelector('img')?.alt?.trim() || `slide ${i + 1}`,
  });
}
