import buildCarousel from '../../scripts/carousel.js';
import { optimizePictures, removeEmpty, isUrlText } from '../../scripts/block-utils.js';

const NAME = 'carousel-shorts';
const FILE_VIDEO = /\.(mp4|webm|ogv|mov|m4v)(\?|#|$)/i;

/**
 * Returns an embed URL for YouTube / Vimeo links, or null.
 * @param {URL} url
 */
function embedUrl(url) {
  const host = url.hostname.replace(/^www\./, '');
  let id;
  if (host === 'youtu.be') [, id] = url.pathname.split('/');
  else if (host.endsWith('youtube.com')) {
    id = url.searchParams.get('v') || url.pathname.match(/\/(shorts|embed|live)\/([^/?]+)/)?.[2];
  }
  if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`;
  if (host.endsWith('vimeo.com')) {
    const vid = url.pathname.match(/(\d+)/)?.[1];
    if (vid) return `https://player.vimeo.com/video/${vid}?autoplay=1&playsinline=1`;
  }
  return null;
}

function videoKind(a) {
  try {
    const url = new URL(a.href, window.location.href);
    if (FILE_VIDEO.test(url.pathname)) return 'file';
    if (embedUrl(url)) return 'embed';
  } catch { /* not a URL */ }
  return null;
}

function pauseOthers(block, except) {
  block.querySelectorAll('video').forEach((v) => { if (v !== except) v.pause(); });
  block.querySelectorAll(`.${NAME}-item iframe`).forEach((frame) => {
    if (frame === except) return;
    const media = frame.closest(`.${NAME}-item-media`);
    if (media?.restorePoster) media.restorePoster();
  });
}

function createVideo(href, poster, { autoplay }) {
  const video = document.createElement('video');
  video.src = href;
  video.controls = true;
  video.playsInline = true;
  video.preload = autoplay ? 'auto' : 'metadata';
  if (poster) video.poster = poster;
  return video;
}

/**
 * One authored row = one short: a poster image, a video link (mp4/webm file, YouTube or
 * Vimeo) and optional text such as a view count or a "Shop now" link, in any cells.
 */
function buildSlide(row, index, block) {
  if (!row.querySelector('picture, img, a[href]') && !row.textContent.trim()) return null;
  optimizePictures(row, { breakpoints: [{ width: '400' }] });

  const item = document.createElement('div');
  item.className = `${NAME}-item`;
  const media = document.createElement('div');
  media.className = `${NAME}-item-media`;
  const body = document.createElement('div');
  body.className = `${NAME}-item-body`;

  const picture = row.querySelector('picture');
  // the video link: one pointing at a video file / provider, else a link wrapping the poster
  const links = [...row.querySelectorAll('a[href]')];
  const videoLink = links.find((a) => videoKind(a)) || null;
  const kind = videoLink ? videoKind(videoLink) : null;

  if (picture) media.append(picture);
  [...row.children].forEach((cell) => body.append(...cell.childNodes));
  if (videoLink) {
    const wrapper = videoLink.closest('.button-wrapper');
    if (wrapper) wrapper.classList.remove('button-wrapper');
    videoLink.remove();
  }
  // a link that wrapped the poster (not a video): keep it as the poster's link
  const posterLink = [...body.querySelectorAll('a[href]')]
    .find((a) => !a.textContent.trim() && !a.querySelector('img'));
  body.querySelectorAll('a[href]').forEach((a) => {
    if (a === posterLink) return;
    a.classList.add(`${NAME}-cta`);
    if (isUrlText(a)) a.textContent = 'Shop now';
  });
  removeEmpty(body);

  const img = media.querySelector('img');
  const title = body.querySelector('h1, h2, h3, h4, h5, h6, strong')?.textContent.trim()
    || img?.alt?.trim() || `Video ${index + 1}`;

  if (kind && img) {
    const play = document.createElement('button');
    play.type = 'button';
    play.className = `${NAME}-play`;
    play.setAttribute('aria-label', `Play video: ${title}`);
    media.append(play);
    const posterNodes = [...media.childNodes];
    media.restorePoster = () => {
      media.replaceChildren(...posterNodes);
      media.classList.remove('is-playing');
    };
    play.addEventListener('click', () => {
      let player;
      if (kind === 'file') {
        player = createVideo(videoLink.href, img.currentSrc || img.src, { autoplay: true });
        player.setAttribute('aria-label', title);
        player.addEventListener('play', () => pauseOthers(block, player));
      } else {
        player = document.createElement('iframe');
        player.src = embedUrl(new URL(videoLink.href, window.location.href));
        player.title = title;
        player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        pauseOthers(block, player);
      }
      media.replaceChildren(player);
      media.classList.add('is-playing');
      if (kind === 'file') {
        player.play().catch(() => { /* autoplay refused: controls remain */ });
      }
      player.focus();
    });
  } else if (kind) {
    // no poster: show the player straight away
    const player = kind === 'file'
      ? createVideo(videoLink.href, null, { autoplay: false })
      : Object.assign(document.createElement('a'), { href: videoLink.href, textContent: `Watch: ${title}` });
    if (kind === 'file') {
      player.setAttribute('aria-label', title);
      player.addEventListener('play', () => pauseOthers(block, player));
    }
    media.append(player);
  } else if (posterLink && picture) {
    posterLink.className = `${NAME}-poster-link`;
    posterLink.setAttribute('aria-label', title);
    posterLink.append(picture);
    media.append(posterLink);
  }

  item.append(media);
  if (body.textContent.trim() || body.querySelector('img, picture')) item.append(body);
  return item;
}

/**
 * Coverflow extras: open on the middle short (like the source) and, when a side short is
 * clicked, bring it to the center instead of playing it small.
 */
function setupCoverflow(block, carousel) {
  if (!carousel || carousel.slides.length < 2) return;
  const { slides, goTo } = carousel;
  const track = block.querySelector(`.${NAME}-slides`);
  const mid = slides[Math.floor((slides.length - 1) / 2)];
  const observer = new ResizeObserver(() => {
    if (!track.clientWidth) return;
    observer.disconnect();
    const left = mid.getBoundingClientRect().left - track.getBoundingClientRect().left
      + track.scrollLeft - (track.clientWidth - mid.offsetWidth) / 2;
    track.scrollTo({ left, behavior: 'instant' });
  });
  observer.observe(track);

  block.addEventListener('click', (e) => {
    const slide = e.target.closest(`.${NAME}-slide`);
    if (!slide || slide.classList.contains('is-active') || e.target.closest(`.${NAME}-cta`)) return;
    if (!e.target.closest(`.${NAME}-play, .${NAME}-poster-link`)) return;
    e.preventDefault();
    e.stopPropagation();
    goTo(slides.indexOf(slide));
  }, true);
}

export default function decorate(block) {
  const coverflow = block.classList.contains('coverflow');
  const carousel = buildCarousel(block, {
    name: NAME,
    mode: 'multi',
    indicators: 'none',
    loop: false,
    align: coverflow ? 'center' : 'start',
    step: coverflow ? 'slide' : 'page',
    label: 'Videos',
    buildSlide: (row, index) => buildSlide(row, index, block),
    onChange: coverflow ? (active) => {
      // stop playback on slides that leave the center
      block.querySelectorAll(`.${NAME}-slide`).forEach((slide) => {
        if (slide !== active) {
          slide.querySelectorAll('video').forEach((v) => v.pause());
          const media = slide.querySelector(`.${NAME}-item-media`);
          if (media?.restorePoster && media.querySelector('iframe')) media.restorePoster();
        }
      });
    } : undefined,
  });
  if (coverflow) setupCoverflow(block, carousel);
}
