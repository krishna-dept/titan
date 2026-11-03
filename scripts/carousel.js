/*
 * Shared carousel engine for the carousel-* blocks.
 *
 * Native horizontal scrolling with scroll-snap does the moving (touch, trackpad and keyboard
 * scrolling work for free); this module adds prev/next buttons, indicators, optional
 * autoplay with a pause control, and keeps ARIA state in sync with the scroll position.
 * Every generated class is prefixed with the block name so each block owns its CSS.
 */

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let instanceCount = 0;

/**
 * @param {Element} block The block element
 * @param {object} config
 * @param {string} config.name Block name, used as class prefix (e.g. 'carousel-hero')
 * @param {(row: Element, index: number) => Element|null} config.buildSlide
 *   Builds the content of one slide from an authored row; return null to skip the row
 * @param {'single'|'multi'} [config.mode] One slide per view, or as many as fit
 * @param {'dots'|'labels'|'none'} [config.indicators] Indicator style
 * @param {(slide: Element, index: number) => string} [config.getLabel] Label for slide n
 * @param {boolean} [config.loop] Wrap around at the ends
 * @param {'start'|'center'} [config.align] Which slide counts as active
 * @param {'page'|'slide'} [config.step] How far prev/next move in multi mode
 * @param {number} [config.autoplay] Autoplay interval in ms (0 = off)
 * @param {string} [config.label] Accessible name of the carousel region
 * @param {(slide: Element, index: number) => void} [config.onChange] Active slide changed
 * @returns {{ goTo: Function, slides: Element[] }|null}
 */
export default function buildCarousel(block, config) {
  const {
    name,
    buildSlide,
    mode = 'single',
    indicators = 'dots',
    getLabel = (slide, i) => `Slide ${i + 1}`,
    loop = mode === 'single',
    align = 'start',
    step = mode === 'single' ? 'slide' : 'page',
    autoplay = 0,
    label = 'Carousel',
    onChange,
  } = config;

  instanceCount += 1;
  const id = `${name}-${instanceCount}`;
  const rows = [...block.children];

  const viewport = document.createElement('div');
  viewport.className = `${name}-viewport`;
  const track = document.createElement('ul');
  track.className = `${name}-slides`;
  track.id = `${id}-slides`;
  viewport.append(track);

  const slides = [];
  rows.forEach((row) => {
    const content = buildSlide(row, slides.length);
    if (!content) return;
    const slide = document.createElement('li');
    slide.className = `${name}-slide`;
    slide.id = `${id}-slide-${slides.length}`;
    slide.dataset.slideIndex = slides.length;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.append(content);
    track.append(slide);
    slides.push(slide);
  });

  block.replaceChildren(viewport);
  block.id = block.id || id;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.hasAttribute('aria-label') && !block.hasAttribute('aria-labelledby')) {
    // name the region after the heading just before the block, when there is one
    const wrapper = block.parentElement;
    const prev = wrapper?.previousElementSibling;
    const heading = prev?.matches('h1, h2, h3, h4, h5, h6') ? prev
      : prev?.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6');
    block.setAttribute('aria-label', heading?.textContent.trim() || label);
  }

  slides.forEach((slide, i) => {
    slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
  });

  if (slides.length === 0) return null;
  block.classList.add(`${name}-count-${Math.min(slides.length, 10)}`);
  if (slides.length < 2) {
    block.classList.add(`${name}-static`);
    return { goTo: () => {}, slides };
  }

  /* ---------- geometry ---------- */

  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const slideLeft = (slide) => slide.getBoundingClientRect().left
    - track.getBoundingClientRect().left + track.scrollLeft;
  const slideTarget = (slide) => {
    const left = align === 'center'
      ? slideLeft(slide) - (track.clientWidth - slide.offsetWidth) / 2
      : slideLeft(slide);
    return Math.min(Math.max(0, left), maxScroll());
  };
  const perView = () => {
    if (mode === 'single' || step === 'slide') return 1;
    const w = slides[0].offsetWidth || 1;
    // measure slide-to-slide pitch so a CSS gap between slides is accounted for
    const pitch = slides[1] ? Math.abs(slides[1].offsetLeft - slides[0].offsetLeft) || w : w;
    const gap = Math.max(0, pitch - w);
    return Math.max(1, Math.floor((track.clientWidth + gap + 1) / pitch));
  };
  // a "stop" is a scroll position a control can move to: one per slide or one per page
  const stops = () => {
    const n = perView();
    const result = [];
    for (let i = 0; i < slides.length; i += n) result.push(i);
    // drop trailing stops that land on the same (clamped) scroll position
    return result.filter((s, idx) => idx === 0
      || Math.abs(slideTarget(slides[s]) - slideTarget(slides[result[idx - 1]])) > 1);
  };

  let current = 0; // index into stops()
  let lastFirst = -1;

  const currentStop = () => {
    const list = stops();
    const pos = track.scrollLeft;
    let best = 0;
    list.forEach((s, idx) => {
      const dist = Math.abs(slideTarget(slides[s]) - pos);
      if (dist < Math.abs(slideTarget(slides[list[best]]) - pos)) best = idx;
    });
    return best;
  };

  /* ---------- controls ---------- */

  const controls = document.createElement('div');
  controls.className = `${name}-controls`;
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = `${name}-prev`;
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.setAttribute('aria-controls', track.id);
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = `${name}-next`;
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.setAttribute('aria-controls', track.id);
  controls.append(prevBtn, nextBtn);
  viewport.append(controls);

  let indicatorList;
  if (indicators !== 'none') {
    const nav = document.createElement('nav');
    nav.className = `${name}-indicators-nav`;
    nav.setAttribute('aria-label', `${block.getAttribute('aria-label')} slide controls`);
    indicatorList = document.createElement('ol');
    indicatorList.className = `${name}-indicators`;
    if (indicators === 'labels') indicatorList.classList.add(`${name}-indicators-labels`);
    nav.append(indicatorList);
    block.append(nav);
  }

  let toggleBtn;
  let timer;
  let playing = false;
  let userPaused = false;

  function renderIndicators() {
    if (!indicatorList) return;
    const list = stops();
    if (indicatorList.children.length === list.length) return;
    indicatorList.replaceChildren(...list.map((s, idx) => {
      const li = document.createElement('li');
      li.className = `${name}-indicator`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-controls', slides[s].id);
      if (indicators === 'labels') {
        btn.textContent = getLabel(slides[s], s);
      } else {
        const what = list.length === slides.length ? getLabel(slides[s], s) : `page ${idx + 1}`;
        btn.setAttribute('aria-label', `Show ${what} (${idx + 1} of ${list.length})`);
      }
      // eslint-disable-next-line no-use-before-define
      btn.addEventListener('click', () => { stopAutoplay(true); goTo(idx); });
      li.append(btn);
      return li;
    }));
  }

  function updateState() {
    const list = stops();
    current = currentStop();
    const first = list[current];
    const last = current + 1 < list.length ? list[current + 1] - 1 : slides.length - 1;
    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft >= maxScroll() - 1;
    const scrollable = maxScroll() > 1;

    block.classList.toggle(`${name}-static`, !scrollable);
    controls.hidden = !scrollable;
    if (indicatorList) indicatorList.closest('nav').hidden = !scrollable || list.length < 2;
    prevBtn.disabled = !loop && atStart;
    nextBtn.disabled = !loop && atEnd;

    slides.forEach((slide, i) => {
      const active = i >= first && i <= last;
      slide.classList.toggle('is-active', align === 'center' ? i === first : active);
      if (mode === 'single') {
        // only the visible slide is reachable for keyboard and screen reader users
        slide.setAttribute('aria-hidden', String(!active));
        slide.querySelectorAll('a, button, video, iframe, [tabindex]').forEach((el) => {
          if (active) {
            if (el.dataset.carouselTabindex !== undefined) {
              if (el.dataset.carouselTabindex) el.setAttribute('tabindex', el.dataset.carouselTabindex);
              else el.removeAttribute('tabindex');
              delete el.dataset.carouselTabindex;
            }
          } else if (el.dataset.carouselTabindex === undefined) {
            el.dataset.carouselTabindex = el.getAttribute('tabindex') || '';
            el.setAttribute('tabindex', '-1');
          }
        });
      }
    });

    if (indicatorList) {
      [...indicatorList.querySelectorAll('button')].forEach((btn, idx) => {
        if (idx === current) btn.setAttribute('aria-current', 'true');
        else btn.removeAttribute('aria-current');
      });
    }
    if (onChange && first !== lastFirst) onChange(slides[first], first);
    lastFirst = first;
  }

  function goTo(stopIndex) {
    const list = stops();
    let idx = stopIndex;
    if (idx < 0) idx = loop ? list.length - 1 : 0;
    if (idx >= list.length) idx = loop ? 0 : list.length - 1;
    track.scrollTo({ left: slideTarget(slides[list[idx]]), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  /* ---------- autoplay ---------- */

  function setToggleState() {
    if (!toggleBtn) return;
    toggleBtn.setAttribute('aria-label', playing ? 'Pause automatic slide show' : 'Start automatic slide show');
    toggleBtn.classList.toggle('is-playing', playing);
  }

  function tick() {
    if (!block.isConnected) { clearInterval(timer); return; }
    goTo(current + 1);
  }

  function startAutoplay() {
    if (!autoplay || userPaused || playing) return;
    playing = true;
    timer = setInterval(tick, autoplay);
    setToggleState();
  }

  function stopAutoplay(byUser = false) {
    if (byUser) userPaused = true;
    if (!playing) { setToggleState(); return; }
    playing = false;
    clearInterval(timer);
    setToggleState();
  }

  if (autoplay > 0 && !reducedMotion()) {
    toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = `${name}-toggle`;
    toggleBtn.setAttribute('aria-controls', track.id);
    toggleBtn.addEventListener('click', () => {
      if (playing) {
        stopAutoplay(true);
      } else {
        userPaused = false;
        startAutoplay();
      }
    });
    controls.append(toggleBtn);
    // pause while the user is hovering or focused inside, or the carousel is off screen
    let hovering = false;
    let focused = false;
    let visible = false;
    const sync = () => {
      if (hovering || focused || !visible || document.hidden) stopAutoplay();
      else startAutoplay();
    };
    block.addEventListener('mouseenter', () => { hovering = true; sync(); });
    block.addEventListener('mouseleave', () => { hovering = false; sync(); });
    block.addEventListener('focusin', () => { focused = true; sync(); });
    block.addEventListener('focusout', (e) => {
      if (!block.contains(e.relatedTarget)) { focused = false; sync(); }
    });
    document.addEventListener('visibilitychange', sync);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); })
      .observe(block);
    setToggleState();
  }

  /* ---------- events ---------- */

  prevBtn.addEventListener('click', () => { stopAutoplay(true); goTo(current - 1); });
  nextBtn.addEventListener('click', () => { stopAutoplay(true); goTo(current + 1); });

  let frame;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(updateState);
  }, { passive: true });
  track.addEventListener('pointerdown', () => stopAutoplay(true), { passive: true });

  // keyboard: arrow keys move between slides when focus is inside the carousel
  block.addEventListener('keydown', (e) => {
    if (e.target.closest(`.${name}-indicators`) || e.target.matches('input, textarea, select, video, audio')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); stopAutoplay(true); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); stopAutoplay(true); goTo(current + 1); }
  });

  new ResizeObserver(() => {
    renderIndicators();
    updateState();
  }).observe(track);

  renderIndicators();
  updateState();

  return { goTo, slides };
}
