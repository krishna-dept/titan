import buildCarousel from '../../scripts/carousel.js';
import {
  optimizePictures, linkTile, removeEmpty,
} from '../../scripts/block-utils.js';

const NAME = 'carousel-tiles';

/**
 * One authored row = one tile: an image plus an optional label and link, in any cells.
 * A single link (on the image or as text) makes the whole tile clickable.
 */
function buildSlide(row) {
  if (!row.querySelector('picture, img') && !row.textContent.trim()) return null;
  optimizePictures(row, { breakpoints: [{ width: '600' }] });

  const tile = document.createElement('div');
  tile.className = `${NAME}-tile`;
  const media = document.createElement('div');
  media.className = `${NAME}-tile-media`;
  const picture = row.querySelector('picture');
  if (picture) {
    const holder = picture.closest('a[href]');
    media.append(picture);
    if (holder && !holder.textContent.trim() && !holder.querySelector('img')) {
      holder.textContent = holder.getAttribute('href');
    }
  }
  const body = document.createElement('div');
  body.className = `${NAME}-tile-body`;
  [...row.children].forEach((cell) => body.append(...cell.childNodes));
  removeEmpty(body);

  tile.append(media, body);
  linkTile(tile, `${NAME}-tile-link`);
  removeEmpty(tile);
  if (!media.children.length) media.remove();
  return tile;
}

export default function decorate(block) {
  buildCarousel(block, {
    name: NAME,
    mode: 'multi',
    indicators: 'none',
    loop: false,
    buildSlide,
    getLabel: (slide, i) => slide.textContent.trim() || slide.querySelector('img')?.alt || `item ${i + 1}`,
  });
}
