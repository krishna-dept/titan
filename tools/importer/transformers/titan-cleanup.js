/* eslint-disable */
/* global WebImporter */

/**
 * Titan (www.titan.co.in, Salesforce Commerce Cloud) cleanup transformer.
 *
 * beforeTransform: remove page chrome and slider chrome that would otherwise
 * leak into block cells. It does NOT remove direct children of
 * `#homepage .col-12.px-0`, because several section selectors in
 * page-templates.json rely on `:nth-of-type(n)` positions among those siblings
 * (e.g. new-arrivals = nth-of-type(15), discover-your-style = nth-of-type(21)).
 *
 * afterTransform: remove the remaining non-authorable top-level components
 * (mobile-only category carousel, empty Einstein slots, empty content assets)
 * plus leftover slider chrome/tracking attributes. HTML comments are never
 * touched here (XWalk field hints are comments written by the parsers).
 */

const SHOW_COMMENT = 128;

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => el.remove());
  });
}

/** Keep only #maincontent: drop every sibling of it and of its ancestors up to <body>. */
function isolateMainContent(root) {
  const main = root.querySelector('#maincontent');
  if (!main) return;
  let node = main;
  while (node && node.parentElement && node.tagName !== 'BODY' && node !== root) {
    const parent = node.parentElement;
    [...parent.children].forEach((sib) => {
      if (sib !== node && sib.tagName !== 'HEAD') sib.remove();
    });
    if (parent === root || parent.tagName === 'BODY') break;
    node = parent;
  }
}

function removeComments(root, document) {
  const doc = document || root.ownerDocument;
  if (!doc || !doc.createTreeWalker) return;
  const walker = doc.createTreeWalker(root, SHOW_COMMENT);
  const comments = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((c) => c.remove());
}

function hasMedia(el) {
  return !!el.querySelector('img, picture, video, iframe, svg, table');
}

function isEmpty(el) {
  return el.textContent.trim() === '' && !hasMedia(el);
}

export default function transform(hookName, element, payload) {
  const document = (payload && payload.document) || element.ownerDocument;

  if (hookName === 'beforeTransform') {
    // Everything outside #maincontent is header/footer/modals/tracking.
    isolateMainContent(element);

    // Explicit chrome (fallback when the page structure differs).
    removeAll(element, [
      // promo strip + location capture above the header
      '.header-banner',
      '.locationCaptureContainer',
      '.locationcapture-container',
      '.header-section-m-spacing',
      '.sticky-padding',
      // global header / nav / footer
      'header.header',
      'header',
      '#sg-navbar-collapse',
      'footer.footer-div',
      'footer',
      // cookie banner
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      // popups / modals / widgets
      '.titan-signup-widget', // floating GET STARTED popup
      '.tw-login-coupon-toast-popup',
      '#trackOrderPopUp',
      '#country-redirect-modal',
      '.modal-reminders',
      '.modal-background',
      '.error-messaging',
      '#evg-new-template-WYS',
      '.saleassist-video-shorts-modal-wrapper',
      '#sa_shorts_modal-wrapper',
      // tracking pixels / iframes / scripts
      'script',
      'noscript',
      'style',
      'link',
      'iframe',
      '#criteo-tags-div',
      '[id^="batBeacon"]',
      'img[src*="analytics.yahoo.com"]',
      'img[src*="bat.bing.com"]',
      'img[src*="demdex.net"]',
      'img[src*="facebook.com/tr"]',
      'img[width="1"][height="1"]',
      // hidden form plumbing
      'input',
      // hidden placeholder H1 ("Homepage", d-none on source)
      '#homepage > h1.d-none',
      // slider chrome (never content): clones, arrows, dots, swiper UI
      '.slick-cloned',
      '.swiper-slide-duplicate',
      '.slick-arrow',
      '.slick-dots',
      '.tw-carousel-dots',
      '.carousel-indicators',
      '.carousel-control-prev',
      '.carousel-control-next',
      '.sa-shorts-swiper-button-prev',
      '.sa-shorts-swiper-button-next',
      '.swiper-button-prev',
      '.swiper-button-next',
      '.swiper-pagination',
      '.swiper-notification',
      '.swiper-slide-shadow-left',
      '.swiper-slide-shadow-right',
      '.tw-carousel-navigators',
    ]);
    // NOTE: hero `.progress-indicator` is kept here: its <span> labels are the
    // slide titles the carousel-hero parser reads. It is removed afterTransform.

    // Source comments (dwMarker, GTM, IE conditionals) are noise; safe to drop
    // before parsers write any field-hint comments.
    removeComments(element, document);
  }

  if (hookName === 'afterTransform') {
    // Mobile-only duplicate category carousel (keep the desktop-view-active one).
    element.querySelectorAll('.experience-commerce_layouts-twCategoryCarousel').forEach((comp) => {
      if (comp.querySelector('.tw-category-carousel.mobile-view-active')
        && !comp.querySelector('.desktop-view-active')) {
        comp.remove();
      }
    });
    element.querySelectorAll('.tw-category-carousel.mobile-view-active').forEach((el) => el.remove());

    // Empty Einstein recommendation slots (client-rendered, d-none on source).
    removeAll(element, [
      '.experience-einstein-einsteinCarouselProductWithStatic',
      '.einstein-carousel',
    ]);

    // Leftover slider chrome not consumed by parsers.
    removeAll(element, [
      '.progress-indicator',
      '.slick-arrow',
      '.slick-dots',
      '.carousel-control-prev',
      '.carousel-control-next',
      '.swiper-notification',
    ]);

    // Empty content assets / empty experience components.
    element.querySelectorAll('.experience-commerce_assets-contentAsset, .content-asset, .experience-component')
      .forEach((el) => {
        if (el.isConnected && isEmpty(el)) el.remove();
      });

    // Modal-trigger links (e.g. SIGN UP) have javascript: hrefs; point them at the login page.
    element.querySelectorAll('a[href^="javascript"]').forEach((a) => {
      a.setAttribute('href', 'https://www.titan.co.in/login');
    });

    // Gold highlighted words in headings become authored emphasis.
    element.querySelectorAll('.highlight-gold').forEach((span) => {
      const em = document.createElement('em');
      em.textContent = span.textContent;
      span.replaceWith(em);
    });

    // Source CTA buttons become authored primary buttons (bold link).
    element.querySelectorAll('a.tw-benefits-login-button').forEach((a) => {
      if (a.closest('strong')) return;
      const strong = document.createElement('strong');
      a.replaceWith(strong);
      strong.append(a);
    });

    // Tracking / inline-handler attributes.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        if (n.startsWith('on')
          || n.startsWith('data-gtm')
          || n.startsWith('data-track')
          || n.startsWith('data-analytics')
          || n.startsWith('data-pid')
          || n === 'data-tracking') {
          el.removeAttribute(n);
        }
      });
    });
  }
}
