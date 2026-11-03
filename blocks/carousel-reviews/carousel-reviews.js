import buildCarousel from '../../scripts/carousel.js';
import { optimizePictures, removeEmpty } from '../../scripts/block-utils.js';

const NAME = 'carousel-reviews';

// "4.5", "4.5/5", "10/10", "9 / 10", "4 out of 5", "Rating: 4", "4 stars", "★ 9/10", or stars
const RATING = /^(?:rating:?\s*)?[★☆⭐]?\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:(?:\/|out\s+of|of)\s*(\d{1,3}))?\s*(?:stars?|[★☆⭐])?$/i;
const STARS = /^[★☆]+$/;
// "20 Nov, 2025", "Nov 20, 2025", "2025-11-20", "20/11/2025"
const DATE = /^(\d{1,2}[\s-]+[a-z]{3,9}\.?,?[\s-]+\d{2,4}|[a-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}[/.]\d{1,2}[/.]\d{2,4})$/i;

function parseRating(text) {
  const t = text.trim();
  if (STARS.test(t)) return { value: [...t].filter((c) => c === '★').length, max: t.length };
  const m = t.match(RATING);
  if (!m) return null;
  const value = parseFloat(m[1].replace(',', '.'));
  // a bare number is out of 5, or out of 10 when it is above 5
  let max = value > 5 ? 10 : 5;
  if (m[2]) max = parseInt(m[2], 10);
  if (Number.isNaN(value) || !max || value > max) return null;
  return { value, max };
}

/**
 * One authored row = one review. Cells and lines may come in any order; each line is
 * recognised by its content: a rating ("4.5" or "4.5/5" or stars), a date, the reviewer
 * name (a heading/bold line, or a short line next to the review), an optional avatar
 * image, and the review text (everything else).
 */
function buildSlide(row) {
  if (!row.textContent.trim()) return null;
  optimizePictures(row, { breakpoints: [{ width: '120' }] });

  const lines = [];
  [...row.children].forEach((cell) => {
    const blocks = [...cell.children].filter((el) => el.matches('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, picture, div'));
    if (blocks.length) {
      lines.push(...blocks);
      // loose text directly in the cell
      [...cell.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim())
        .forEach((n) => { const p = document.createElement('p'); p.textContent = n.textContent.trim(); lines.push(p); });
    } else if (cell.textContent.trim() || cell.querySelector('picture')) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      lines.push(p);
    }
  });

  let rating = null;
  let date = null;
  let name = null;
  let avatar = null;
  const rest = [];
  lines.forEach((el) => {
    const text = el.textContent.trim();
    if (!avatar && el.querySelector('picture') && !text) { avatar = el.querySelector('picture'); return; }
    const parsed = !rating && text ? parseRating(text) : null;
    if (parsed) { rating = parsed; return; }
    if (!date && text && text.length < 30 && DATE.test(text)) { date = text; return; }
    if (!name && text && (el.matches('h1, h2, h3, h4, h5, h6')
      || (el.children.length === 1 && el.firstElementChild.matches('strong, b') && el.firstElementChild.textContent.trim() === text))) {
      name = text;
      return;
    }
    if (text || el.querySelector('picture')) rest.push(el);
  });
  // no explicit name: a short first line followed by a longer text is the name
  if (!name && rest.length > 1 && rest[0].textContent.trim().length <= 40
    && !rest[0].querySelector('a')) {
    name = rest.shift().textContent.trim();
  }

  const figure = document.createElement('figure');
  figure.className = `${NAME}-card`;

  const header = document.createElement('div');
  header.className = `${NAME}-card-header`;
  const mark = document.createElement('span');
  mark.className = `${NAME}-quote-mark`;
  mark.setAttribute('aria-hidden', 'true');
  header.append(mark);
  if (rating) {
    const r = document.createElement('p');
    r.className = `${NAME}-rating`;
    r.style.setProperty('--carousel-reviews-rating', (rating.value / rating.max).toFixed(3));
    r.setAttribute('role', 'img');
    r.setAttribute('aria-label', `Rated ${rating.value} out of ${rating.max}`);
    // same badge for every scale: star, value, "/max" (e.g. "★ 10 /10", "★ 4.5 /5")
    const value = document.createElement('span');
    value.className = `${NAME}-rating-value`;
    value.setAttribute('aria-hidden', 'true');
    value.textContent = rating.value;
    const max = document.createElement('span');
    max.className = `${NAME}-rating-max`;
    max.setAttribute('aria-hidden', 'true');
    max.textContent = `/${rating.max}`;
    r.append(value, max);
    header.append(r);
  }
  figure.append(header);

  const quote = document.createElement('blockquote');
  quote.className = `${NAME}-text`;
  rest.forEach((el) => {
    if (el.tagName === 'BLOCKQUOTE') quote.append(...el.childNodes);
    else quote.append(el);
  });
  removeEmpty(quote);

  const caption = document.createElement('figcaption');
  caption.className = `${NAME}-author`;
  if (avatar) {
    const a = document.createElement('span');
    a.className = `${NAME}-avatar`;
    a.append(avatar);
    caption.append(a);
  }
  if (name) {
    const n = document.createElement('span');
    n.className = `${NAME}-name`;
    n.textContent = name;
    caption.append(n);
  }
  if (date) {
    const d = document.createElement('time');
    d.className = `${NAME}-date`;
    d.textContent = date;
    const parsed = Date.parse(date.replace(/,/g, ''));
    if (!Number.isNaN(parsed)) {
      const dt = new Date(parsed);
      d.dateTime = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    }
    caption.append(d);
  }

  if (caption.children.length) figure.append(caption);
  if (quote.textContent.trim()) figure.append(quote);
  return figure;
}

export default function decorate(block) {
  buildCarousel(block, {
    name: NAME,
    mode: 'multi',
    indicators: 'dots',
    loop: false,
    // like titan.co.in: arrows and dots move one review at a time
    step: 'slide',
    label: 'Customer reviews',
    buildSlide,
    getLabel: (slide, i) => {
      const name = slide.querySelector(`.${NAME}-name`)?.textContent;
      return name ? `review by ${name}` : `review ${i + 1}`;
    },
  });
}
