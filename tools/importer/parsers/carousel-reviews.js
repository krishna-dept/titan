/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-reviews (`.testimonials-carousel-wrapper`, slick slider).
 * Slick clones are skipped. Row per review:
 * [ rating ("10/10"), **reviewer name**, date | review text ]
 * The decorative quote/star images are not authored (the block draws them).
 */
export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();
  const cards = [...element.querySelectorAll('.testimonial-slider')]
    .filter((c) => !c.closest('.slick-cloned'));

  cards.forEach((card) => {
    const ratingEl = card.querySelector('.testimonials-rating');
    const nameEl = card.querySelector('.author-name');
    const dateEl = card.querySelector('.author-date');
    const textEl = card.querySelector('.testimonials-description');

    const rating = ratingEl ? ratingEl.textContent.replace(/\s+/g, '') : '';
    const name = nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const date = dateEl ? dateEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const text = textEl ? textEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!text && !name) return;

    const key = `${name}|${date}|${text.slice(0, 60)}`;
    if (seen.has(key)) return;
    seen.add(key);

    const meta = [];
    if (rating) {
      const p = document.createElement('p');
      p.textContent = rating;
      meta.push(p);
    }
    if (name) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = name;
      p.append(strong);
      meta.push(p);
    }
    if (date) {
      const p = document.createElement('p');
      p.textContent = date;
      meta.push(p);
    }

    const body = [];
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      body.push(p);
    }
    cells.push([meta, body]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-reviews', cells });
  element.replaceWith(block);
}
