import { optimizePictures, removeEmpty } from '../../scripts/block-utils.js';

const NAME = 'hero-strip';

/**
 * Short full-width strip: a background image with a line of text and a CTA on top.
 * Authors may put the image in its own row/cell or together with the text; the first
 * image becomes the background (an optional second image is used on narrow screens),
 * everything else becomes the centered content.
 */
export default function decorate(block) {
  optimizePictures(block, {
    breakpoints: [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }],
  });

  const media = document.createElement('div');
  media.className = `${NAME}-media`;
  const pictures = [...block.querySelectorAll('picture')].slice(0, 2);
  pictures.forEach((picture, i) => {
    if (pictures.length > 1) picture.classList.add(i === 0 ? `${NAME}-desktop` : `${NAME}-mobile`);
    const holder = picture.closest('a[href]');
    media.append(picture);
    // a linked background image: keep its link as the CTA when there is no other link
    if (holder && !holder.textContent.trim() && !holder.querySelector('img')) {
      const others = [...block.querySelectorAll('a[href]')].filter((a) => a !== holder);
      if (others.length) holder.remove();
      else holder.textContent = holder.getAttribute('title') || 'Learn more';
    }
  });

  const content = document.createElement('div');
  content.className = `${NAME}-content`;
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => content.append(...cell.childNodes));
  removeEmpty(content);

  // CTA links: a bare (unformatted) link in the strip still reads as a button
  content.querySelectorAll('a[href]').forEach((a) => {
    if (!a.classList.contains('button')) a.classList.add('button');
    const p = a.closest('p');
    if (p && p.textContent.trim() === a.textContent.trim()) p.classList.add('button-wrapper');
  });

  const parts = [media, content].filter((el) => el.children.length || el.textContent.trim());
  block.replaceChildren(...parts);
  if (!media.children.length) block.classList.add(`${NAME}-no-image`);
}
