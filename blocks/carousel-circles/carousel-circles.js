import buildCarousel from '../../scripts/carousel.js';
import {
  optimizePictures, linkTile, removeEmpty,
} from '../../scripts/block-utils.js';

const NAME = 'carousel-circles';

/**
 * One authored row = one item: an image (shown as a circle) and a label/link below it.
 * A single link (on the image or the label) makes the whole item clickable.
 */
function buildSlide(row) {
  if (!row.querySelector('picture, img') && !row.textContent.trim()) return null;
  optimizePictures(row, { breakpoints: [{ width: '300' }] });

  const item = document.createElement('div');
  item.className = `${NAME}-item`;
  const media = document.createElement('div');
  media.className = `${NAME}-item-media`;
  const picture = row.querySelector('picture');
  if (picture) {
    const holder = picture.closest('a[href]');
    media.append(picture);
    if (holder && !holder.textContent.trim() && !holder.querySelector('img')) {
      holder.textContent = holder.getAttribute('href');
    }
  }
  const label = document.createElement('div');
  label.className = `${NAME}-item-label`;
  [...row.children].forEach((cell) => label.append(...cell.childNodes));
  removeEmpty(label);

  item.append(media, label);
  linkTile(item, `${NAME}-item-link`);
  removeEmpty(item);
  if (!media.children.length) media.remove();
  return item;
}

export default function decorate(block) {
  buildCarousel(block, {
    name: NAME,
    mode: 'multi',
    indicators: 'none',
    loop: false,
    label: 'Categories',
    buildSlide,
  });
}
