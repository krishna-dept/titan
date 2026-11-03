/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-shorts (SaleAssist video shorts, `.saleassist-video-shorts-root-container`).
 * The instance rendered as a swiper coverflow becomes "Carousel Shorts (coverflow)".
 * Row per short: [ poster image | video link, view count, optional "Shop Now" product link ]
 *
 * The source has no still poster on the slides (the `poster` attribute is an mp4 preview),
 * so the poster is the SaleAssist/Gumlet thumbnail of the video, the same URL the source
 * uses for its modal placeholders.
 */
const ORIGIN = 'https://www.titan.co.in/';
const THUMB = 'https://prod-saleassist.gumlet.io/thumbnail.jpeg';

function abs(url) {
  if (!url) return '';
  try { return new URL(url.trim(), ORIGIN).href; } catch (e) { return url.trim(); }
}

function videoUrlOf(slide) {
  const holder = slide.querySelector('[src-data]');
  const fromHolder = holder && holder.getAttribute('src-data');
  if (fromHolder) return abs(fromHolder);
  const video = slide.querySelector('video');
  const src = (video && (video.getAttribute('src') || video.getAttribute('data-src')))
    || (slide.querySelector('video source[src]') || { getAttribute: () => '' }).getAttribute('src');
  return src ? abs(src) : '';
}

function posterUrlOf(slide, videoUrl) {
  const still = [...slide.querySelectorAll('img')]
    .map((img) => img.getAttribute('src') || img.getAttribute('data-src') || '')
    .find((src) => src && !src.startsWith('data:') && /\.(jpe?g|png|webp)(\?|$)|thumbnail/i.test(src));
  if (still) return abs(still);
  const video = slide.querySelector('video');
  const poster = video && video.getAttribute('poster');
  if (poster && /\.(jpe?g|png|webp)(\?|$)/i.test(poster)) return abs(poster);
  return videoUrl ? `${THUMB}?video_url=${videoUrl}&width=450` : '';
}

function para(document, ...children) {
  const p = document.createElement('p');
  p.append(...children);
  return p;
}

function link(document, href, text) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text || href;
  return a;
}

export default function parse(element, { document }) {
  const coverflow = !!element.querySelector('.swiper-coverflow')
    || element.classList.contains('swiper-coverflow');

  let slides = [...element.querySelectorAll('.sa_shorts_video-wrapper')]
    .filter((s) => !s.closest('.saleassist-video-shorts-modal-wrapper, #sa_shorts_modal-wrapper'))
    .filter((s) => !s.classList.contains('swiper-slide-duplicate'));

  // swiper may render a looped/rotated order: restore authoring order when indices exist
  if (slides.length && slides.every((s) => s.hasAttribute('data-swiper-slide-index'))) {
    slides = slides
      .map((s, i) => ({ s, i, k: parseInt(s.getAttribute('data-swiper-slide-index'), 10) }))
      .sort((a, b) => (a.k - b.k) || (a.i - b.i))
      .map((o) => o.s);
  }

  const seen = new Set();
  const cells = [];
  slides.forEach((slide) => {
    const videoUrl = videoUrlOf(slide);
    if (!videoUrl || seen.has(videoUrl)) return;
    seen.add(videoUrl);

    const imageCell = [];
    const posterUrl = posterUrlOf(slide, videoUrl);
    if (posterUrl) {
      const img = document.createElement('img');
      img.src = posterUrl;
      img.alt = '';
      imageCell.push(img);
    }

    const textCell = [para(document, link(document, videoUrl))];
    const views = slide.querySelector('.carousel-video-views-count');
    const viewText = views ? views.textContent.trim() : '';
    if (viewText) textCell.push(para(document, `${viewText} views`));

    const cta = [...slide.querySelectorAll('a.cta-link[href], .sa_shorts_products-wrapper a[href]')]
      .find((a) => {
        const h = (a.getAttribute('href') || '').trim();
        return h && h !== '#' && !h.startsWith('javascript');
      });
    if (cta) {
      const label = cta.textContent.replace(/\s+/g, ' ').trim() || 'Shop Now';
      textCell.push(para(document, link(document, abs(cta.getAttribute('href')), label)));
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'carousel-shorts',
    variants: coverflow ? ['coverflow'] : [],
    cells,
  });
  element.replaceWith(block);
}
