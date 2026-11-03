import { optimizePictures, linkTile, isMediaCell } from '../../scripts/block-utils.js';

const NAME = 'cards-icon-stack';

/**
 * Trust badges: centered icon above a short label.
 * One authored row = one card. The image/icon may sit in its own cell or inside the text
 * cell; empty rows and cells are ignored, extra text cells are merged into the card body.
 * A card holding exactly one link becomes a single clickable link.
 */
function buildCard(row) {
  if (!row.textContent.trim() && !row.querySelector('picture, img, .icon')) return null;
  const li = document.createElement('li');
  li.className = `${NAME}-card`;
  const media = document.createElement('div');
  media.className = `${NAME}-card-media`;
  const body = document.createElement('div');
  body.className = `${NAME}-card-body`;

  [...row.children].forEach((cell) => {
    if (!media.children.length && isMediaCell(cell)) media.append(...cell.childNodes);
    else body.append(...cell.childNodes);
  });
  // media authored inside the text cell
  if (!media.children.length) {
    const pic = body.querySelector('picture, img, .icon');
    if (pic) {
      const holder = pic.closest('p');
      media.append(holder && holder.textContent.trim() === '' ? holder : pic);
    }
  }
  // a linked image: keep the link, drop it from the image so the card can carry it
  const imageLink = media.querySelector('a[href]');
  const bodyLinks = [...body.querySelectorAll('a[href]')];
  if (imageLink && (!bodyLinks.length
    || bodyLinks.every((a) => a.getAttribute('href') === imageLink.getAttribute('href')))) {
    imageLink.replaceWith(...imageLink.childNodes);
    if (!bodyLinks.length) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = imageLink.getAttribute('href');
      a.textContent = a.getAttribute('href');
      p.append(a);
      body.append(p);
    }
  }
  body.querySelectorAll('p, div').forEach((el) => {
    if (!el.children.length && !el.textContent.trim()) el.remove();
  });

  if (media.children.length) li.append(media);
  li.append(body);
  linkTile(li, `${NAME}-card-link`);
  if (!body.textContent.trim() && !body.querySelector('img, picture')) body.remove();
  return li;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const card = buildCard(row);
    if (card) ul.append(card);
  });
  optimizePictures(ul, { breakpoints: [{ width: '160' }] });
  block.replaceChildren(ul);
}
