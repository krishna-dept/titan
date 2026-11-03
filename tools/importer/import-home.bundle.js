/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  var ORIGIN = "https://www.titan.co.in/";
  function abs(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN).href;
    } catch (e) {
      return url.trim();
    }
  }
  function firstSrc(srcset) {
    return (srcset || "").split(",")[0].trim().split(/\s+/)[0];
  }
  function pictureUrls(scope) {
    const img = scope.querySelector("img");
    let desktop = "";
    let mobile = "";
    scope.querySelectorAll("source").forEach((s) => {
      const src = firstSrc(s.getAttribute("srcset") || s.getAttribute("data-srcset"));
      if (!src) return;
      const media = s.getAttribute("media") || "";
      if (/min-width/.test(media) && !desktop) desktop = src;
      else if (/max-width/.test(media) && !mobile) mobile = src;
    });
    const fallback = img ? img.getAttribute("src") || img.getAttribute("data-src") || "" : "";
    if (!desktop) desktop = fallback || mobile;
    if (!mobile) mobile = fallback;
    desktop = abs(desktop);
    mobile = abs(mobile);
    return mobile && mobile !== desktop ? [desktop, mobile] : [desktop];
  }
  function makeImg(document, src, alt) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt || "";
    return img;
  }
  function parse(element, { document }) {
    const labels = [...element.querySelectorAll(".progress-indicator li")].map((li) => (li.querySelector("span") || li).textContent.trim());
    const cells = [];
    const slides = [...element.querySelectorAll(".carousel-inner > .carousel-item")].filter((s) => !s.classList.contains("slick-cloned"));
    slides.forEach((slide, i) => {
      const holder = slide.querySelector("[data-imagename], [data-name]");
      const link2 = slide.querySelector("a[href]");
      let label = labels[i] || holder && (holder.getAttribute("data-imagename") || holder.getAttribute("data-name")) || link2 && (link2.getAttribute("aria-label") || "").replace(/^Image Link For\s*/i, "") || "";
      label = label.trim();
      const urls = pictureUrls(slide);
      if (!urls[0]) return;
      const imageCell = urls.map((u) => makeImg(document, u, label));
      const textCell = [];
      if (label) {
        const p = document.createElement("p");
        p.textContent = label;
        textCell.push(p);
      }
      if (link2) {
        const href = abs(link2.getAttribute("href"));
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        p.append(a);
        textCell.push(p);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-inline.js
  var ORIGIN2 = "https://www.titan.co.in/";
  function abs2(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN2).href;
    } catch (e) {
      return url.trim();
    }
  }
  function firstSrc2(srcset) {
    return (srcset || "").split(",")[0].trim().split(/\s+/)[0];
  }
  function iconUrl(scope) {
    const candidates = [];
    scope.querySelectorAll("source").forEach((s) => {
      const src = firstSrc2(s.getAttribute("srcset") || s.getAttribute("data-srcset"));
      if (src && /min-width/.test(s.getAttribute("media") || "")) candidates.push(src);
    });
    const img = scope.querySelector("img");
    if (img) candidates.push(img.getAttribute("src") || img.getAttribute("data-src") || "");
    return candidates.map(abs2).find((u) => u && !u.startsWith("data:")) || "";
  }
  function parse2(element, { document }) {
    const cells = [];
    element.querySelectorAll(".signup-benefit-item").forEach((item) => {
      const img = item.querySelector("img");
      const title = (item.querySelector(".benefit-heading") || { textContent: "" }).textContent.trim();
      const sub = (item.querySelector(".benefit-subheading") || { textContent: "" }).textContent.trim();
      const iconCell = [];
      const src = iconUrl(item.querySelector(".benefit-icon-wrapper") || item);
      if (src) {
        const icon = document.createElement("img");
        icon.src = src;
        icon.alt = img && img.getAttribute("alt") || title;
        iconCell.push(icon);
      }
      const textCell = [];
      if (title) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = title;
        p.append(strong);
        textCell.push(p);
      }
      if (sub) {
        const p = document.createElement("p");
        p.textContent = sub;
        textCell.push(p);
      }
      const link2 = item.querySelector("a[href]");
      if (link2 && link2.getAttribute("href") !== "#") {
        const a = document.createElement("a");
        a.href = abs2(link2.getAttribute("href"));
        a.textContent = a.href;
        textCell.push(a);
      }
      if (!iconCell.length && !textCell.length) return;
      cells.push([iconCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon-inline", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-banner.js
  var ORIGIN3 = "https://www.titan.co.in/";
  function abs3(url) {
    if (!url) return "";
    let out = url.trim();
    try {
      out = new URL(out, ORIGIN3).href;
    } catch (e) {
    }
    return out;
  }
  function firstSrc3(srcset) {
    return (srcset || "").split(",")[0].trim().split(/\s+/)[0];
  }
  function pictureUrls2(scope) {
    const img = scope.querySelector("img");
    let desktop = "";
    let mobile = "";
    scope.querySelectorAll("source").forEach((s) => {
      const src = firstSrc3(s.getAttribute("srcset") || s.getAttribute("data-srcset"));
      if (!src) return;
      const media = s.getAttribute("media") || "";
      if (/min-width/.test(media) && !desktop) desktop = src;
      else if (/max-width/.test(media) && !mobile) mobile = src;
    });
    const fallback = img ? img.getAttribute("src") || img.getAttribute("data-src") || "" : "";
    if (!desktop) desktop = fallback || mobile;
    if (!mobile) mobile = fallback;
    desktop = abs3(desktop);
    mobile = abs3(mobile);
    const unsafe5 = (u) => /[[\]]|%5B|%5D/i.test(u);
    if (unsafe5(mobile)) mobile = "";
    if (unsafe5(desktop)) desktop = mobile;
    if (!desktop) return [];
    return mobile && mobile !== desktop ? [desktop, mobile] : [desktop];
  }
  function makeImg2(document, src, alt) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt || "";
    return img;
  }
  function parse3(element, { document }) {
    const cells = [];
    const slides = [...element.querySelectorAll(".carousel-inner > .carousel-item")].filter((s) => !s.classList.contains("slick-cloned"));
    slides.forEach((slide) => {
      const holder = slide.querySelector("[data-name]");
      const link2 = slide.querySelector("a[href]");
      const img = slide.querySelector("img");
      const alt = (img && img.getAttribute("alt") || holder && holder.getAttribute("data-name") || link2 && (link2.getAttribute("aria-label") || "").replace(/^Image Link For\s*/i, "") || "").trim();
      const urls = pictureUrls2(slide);
      if (!urls[0]) return;
      const imageCell = urls.map((u) => makeImg2(document, u, alt));
      const linkCell = [];
      if (link2 && link2.getAttribute("href") && link2.getAttribute("href") !== "#") {
        const href = abs3(link2.getAttribute("href"));
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        linkCell.push(a);
      }
      cells.push([imageCell, linkCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-image-tiles.js
  var ORIGIN4 = "https://www.titan.co.in/";
  function abs4(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN4).href;
    } catch (e) {
      return url.trim();
    }
  }
  function firstSrc4(srcset) {
    return (srcset || "").split(",")[0].trim().split(/\s+/)[0];
  }
  var unsafe = (u) => /[[\]]|%5B|%5D/i.test(u);
  function tileImageUrl(scope) {
    const candidates = [];
    scope.querySelectorAll("source").forEach((s) => {
      const src = firstSrc4(s.getAttribute("srcset") || s.getAttribute("data-srcset"));
      if (src && /min-width/.test(s.getAttribute("media") || "")) candidates.push(src);
    });
    const img = scope.querySelector("img");
    if (img) candidates.push(img.getAttribute("src") || img.getAttribute("data-src") || "");
    scope.querySelectorAll("source").forEach((s) => {
      candidates.push(firstSrc4(s.getAttribute("srcset") || s.getAttribute("data-srcset")));
    });
    return candidates.map(abs4).find((u) => u && !u.startsWith("data:") && !unsafe(u)) || "";
  }
  function labelOf(link2, img) {
    const clean = (v) => {
      const t = (v || "").replace(/^Image Link For\s*/i, "").trim();
      return /^(null|undefined|image)$/i.test(t) ? "" : t;
    };
    return clean(img && img.getAttribute("alt")) || clean(link2 && link2.getAttribute("aria-label"));
  }
  function parse4(element, { document }) {
    let items = [...element.querySelectorAll(
      ".experience-commerce_assets-imageCTA, .experience-commerce_assets-shopByBrand"
    )];
    if (!items.length) {
      items = [...element.querySelectorAll("figure, a[href]")].filter((el) => el.querySelector("img")).filter((el) => !(el.tagName === "A" && el.closest("figure")));
    }
    items = items.filter((el) => !el.closest(".slick-cloned"));
    const cells = [];
    items.forEach((item) => {
      const link2 = item.matches("a[href]") ? item : item.querySelector("a[href]");
      const img = item.querySelector("img");
      const src = tileImageUrl(item);
      if (!src) return;
      const image = document.createElement("img");
      image.src = src;
      image.alt = labelOf(link2, img);
      const linkCell = [];
      const rawHref = link2 && link2.getAttribute("href");
      if (rawHref && rawHref !== "#") {
        const href = abs4(rawHref);
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        linkCell.push(a);
      }
      cells.push([[image], linkCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-image-tiles", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-tiles.js
  var ORIGIN5 = "https://www.titan.co.in/";
  function abs5(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN5).href;
    } catch (e) {
      return url.trim();
    }
  }
  function firstSrc5(srcset) {
    return (srcset || "").split(",")[0].trim().split(/\s+/)[0];
  }
  var unsafe2 = (u) => /[[\]]|%5B|%5D/i.test(u);
  function tileImageUrl2(scope) {
    const candidates = [];
    scope.querySelectorAll("source").forEach((s) => {
      const src = firstSrc5(s.getAttribute("srcset") || s.getAttribute("data-srcset"));
      if (src && /min-width/.test(s.getAttribute("media") || "")) candidates.push(src);
    });
    const img = scope.querySelector("img");
    if (img) candidates.push(img.getAttribute("src") || img.getAttribute("data-src") || "");
    scope.querySelectorAll("source").forEach((s) => {
      candidates.push(firstSrc5(s.getAttribute("srcset") || s.getAttribute("data-srcset")));
    });
    return candidates.map(abs5).find((u) => u && !u.startsWith("data:") && !unsafe2(u)) || "";
  }
  function labelOf2(link2, img) {
    const clean = (v) => {
      const t = (v || "").replace(/^Image Link For\s*/i, "").trim();
      return /^(null|undefined|image)$/i.test(t) ? "" : t;
    };
    return clean(img && img.getAttribute("alt")) || clean(link2 && link2.getAttribute("aria-label"));
  }
  function parse5(element, { document }) {
    const cells = [];
    const items = [...element.querySelectorAll(".tw-image-cta-container, .tw-slick-slide")].filter((el) => !(el.classList.contains("tw-slick-slide") && el.querySelector(".tw-image-cta-container"))).filter((el) => !el.closest(".slick-cloned"));
    items.forEach((item) => {
      const link2 = item.querySelector("a[href]");
      const img = item.querySelector("img");
      const src = tileImageUrl2(item);
      if (!src) return;
      const image = document.createElement("img");
      image.src = src;
      image.alt = labelOf2(link2, img);
      const linkCell = [];
      const rawHref = link2 && link2.getAttribute("href");
      if (rawHref && rawHref !== "#") {
        const href = abs5(rawHref);
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        linkCell.push(a);
      }
      cells.push([[image], linkCell]);
    });
    const heading = element.querySelector(".tw-woalf-carousel__heading, .tw-shopbylooks-carousel__heading");
    if (heading) element.before(heading);
    const name = element.classList.contains("tw-woalf-carousel") ? "carousel-tiles (compact)" : "carousel-tiles";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-circles.js
  var ORIGIN6 = "https://www.titan.co.in/";
  function abs6(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN6).href;
    } catch (e) {
      return url.trim();
    }
  }
  function firstSrc6(srcset) {
    return (srcset || "").split(",")[0].trim().split(/\s+/)[0];
  }
  var unsafe3 = (u) => /[[\]]|%5B|%5D/i.test(u);
  function imageUrl(scope) {
    const candidates = [];
    scope.querySelectorAll("source").forEach((s) => {
      const src = firstSrc6(s.getAttribute("srcset") || s.getAttribute("data-srcset"));
      if (src && /min-width/.test(s.getAttribute("media") || "")) candidates.push(src);
    });
    const img = scope.querySelector("img");
    if (img) candidates.push(img.getAttribute("src") || img.getAttribute("data-src") || "");
    scope.querySelectorAll("source").forEach((s) => {
      candidates.push(firstSrc6(s.getAttribute("srcset") || s.getAttribute("data-srcset")));
    });
    return candidates.map(abs6).find((u) => u && !u.startsWith("data:") && !unsafe3(u)) || "";
  }
  function parse6(element, { document }) {
    const cells = [];
    const tiles = [...element.querySelectorAll(".tw-category-tile")].filter((t) => !t.closest(".slick-cloned"));
    tiles.forEach((tile) => {
      const labelEl = tile.querySelector(".tw-category-tile__content, .tw-category-tile__label");
      const imageLink = tile.querySelector(".tw-category-tile__image a[href]");
      const labelLink = tile.querySelector("a.tw-category-tile__url[href]") || imageLink;
      const label = (labelEl ? labelEl.textContent : "").trim() || (imageLink && (imageLink.getAttribute("data-gtm") || "")).trim();
      const src = imageUrl(tile.querySelector(".tw-category-tile__image") || tile);
      if (!src && !label) return;
      const imageCell = [];
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = label;
        imageCell.push(img);
      }
      const textCell = [];
      const rawHref = labelLink && labelLink.getAttribute("href");
      if (rawHref && rawHref !== "#") {
        const a = document.createElement("a");
        a.href = abs6(rawHref);
        a.textContent = label || a.href;
        textCell.push(a);
      } else if (label) {
        const p = document.createElement("p");
        p.textContent = label;
        textCell.push(p);
      }
      cells.push([imageCell, textCell]);
    });
    const heading = element.querySelector(".tw-category-carousel__heading");
    if (heading) element.before(heading);
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-circles", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-shorts.js
  var ORIGIN7 = "https://www.titan.co.in/";
  var THUMB = "https://prod-saleassist.gumlet.io/thumbnail.jpeg";
  function abs7(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN7).href;
    } catch (e) {
      return url.trim();
    }
  }
  function videoUrlOf(slide) {
    const holder = slide.querySelector("[src-data]");
    const fromHolder = holder && holder.getAttribute("src-data");
    if (fromHolder) return abs7(fromHolder);
    const video = slide.querySelector("video");
    const src = video && (video.getAttribute("src") || video.getAttribute("data-src")) || (slide.querySelector("video source[src]") || { getAttribute: () => "" }).getAttribute("src");
    return src ? abs7(src) : "";
  }
  function posterUrlOf(slide, videoUrl) {
    const still = [...slide.querySelectorAll("img")].map((img) => img.getAttribute("src") || img.getAttribute("data-src") || "").find((src) => src && !src.startsWith("data:") && /\.(jpe?g|png|webp)(\?|$)|thumbnail/i.test(src));
    if (still) return abs7(still);
    const video = slide.querySelector("video");
    const poster = video && video.getAttribute("poster");
    if (poster && /\.(jpe?g|png|webp)(\?|$)/i.test(poster)) return abs7(poster);
    return videoUrl ? `${THUMB}?video_url=${videoUrl}&width=450` : "";
  }
  function para(document, ...children) {
    const p = document.createElement("p");
    p.append(...children);
    return p;
  }
  function link(document, href, text) {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = text || href;
    return a;
  }
  function parse7(element, { document }) {
    const coverflow = !!element.querySelector(".swiper-coverflow") || element.classList.contains("swiper-coverflow");
    let slides = [...element.querySelectorAll(".sa_shorts_video-wrapper")].filter((s) => !s.closest(".saleassist-video-shorts-modal-wrapper, #sa_shorts_modal-wrapper")).filter((s) => !s.classList.contains("swiper-slide-duplicate"));
    if (slides.length && slides.every((s) => s.hasAttribute("data-swiper-slide-index"))) {
      slides = slides.map((s, i) => ({ s, i, k: parseInt(s.getAttribute("data-swiper-slide-index"), 10) })).sort((a, b) => a.k - b.k || a.i - b.i).map((o) => o.s);
    }
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    slides.forEach((slide) => {
      const videoUrl = videoUrlOf(slide);
      if (!videoUrl || seen.has(videoUrl)) return;
      seen.add(videoUrl);
      const imageCell = [];
      const posterUrl = posterUrlOf(slide, videoUrl);
      if (posterUrl) {
        const img = document.createElement("img");
        img.src = posterUrl;
        img.alt = "";
        imageCell.push(img);
      }
      const textCell = [para(document, link(document, videoUrl))];
      const views = slide.querySelector(".carousel-video-views-count");
      const viewText = views ? views.textContent.trim() : "";
      if (viewText) textCell.push(para(document, `${viewText} views`));
      const cta = [...slide.querySelectorAll("a.cta-link[href], .sa_shorts_products-wrapper a[href]")].find((a) => {
        const h = (a.getAttribute("href") || "").trim();
        return h && h !== "#" && !h.startsWith("javascript");
      });
      if (cta) {
        const label = cta.textContent.replace(/\s+/g, " ").trim() || "Shop Now";
        textCell.push(para(document, link(document, abs7(cta.getAttribute("href")), label)));
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "carousel-shorts",
      variants: coverflow ? ["coverflow"] : [],
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-reviews.js
  function parse8(element, { document }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const cards = [...element.querySelectorAll(".testimonial-slider")].filter((c) => !c.closest(".slick-cloned"));
    cards.forEach((card) => {
      const ratingEl = card.querySelector(".testimonials-rating");
      const nameEl = card.querySelector(".author-name");
      const dateEl = card.querySelector(".author-date");
      const textEl = card.querySelector(".testimonials-description");
      const rating = ratingEl ? ratingEl.textContent.replace(/\s+/g, "") : "";
      const name = nameEl ? nameEl.textContent.replace(/\s+/g, " ").trim() : "";
      const date = dateEl ? dateEl.textContent.replace(/\s+/g, " ").trim() : "";
      const text = textEl ? textEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (!text && !name) return;
      const key = `${name}|${date}|${text.slice(0, 60)}`;
      if (seen.has(key)) return;
      seen.add(key);
      const meta = [];
      if (rating) {
        const p = document.createElement("p");
        p.textContent = rating;
        meta.push(p);
      }
      if (name) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = name;
        p.append(strong);
        meta.push(p);
      }
      if (date) {
        const p = document.createElement("p");
        p.textContent = date;
        meta.push(p);
      }
      const body = [];
      if (text) {
        const p = document.createElement("p");
        p.textContent = text;
        body.push(p);
      }
      cells.push([meta, body]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-reviews", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-bento.js
  var ORIGIN8 = "https://www.titan.co.in/";
  function abs8(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN8).href;
    } catch (e) {
      return url.trim();
    }
  }
  function firstSrc7(srcset) {
    return (srcset || "").split(",")[0].trim().split(/\s+/)[0];
  }
  var unsafe4 = (u) => /[[\]]|%5B|%5D/i.test(u);
  function tileImageUrl3(scope) {
    const candidates = [];
    scope.querySelectorAll("source").forEach((s) => {
      const src = firstSrc7(s.getAttribute("srcset") || s.getAttribute("data-srcset"));
      if (src && /min-width/.test(s.getAttribute("media") || "")) candidates.push(src);
    });
    const img = scope.querySelector("img");
    if (img) candidates.push(img.getAttribute("src") || img.getAttribute("data-src") || "");
    return candidates.map(abs8).find((u) => u && !u.startsWith("data:") && !unsafe4(u)) || "";
  }
  function parse9(element, { document }) {
    let items = [...element.querySelectorAll(".tw-trending-banners__item")];
    if (!items.length) {
      items = [...element.querySelectorAll("a[href], figure")].filter((el) => el.querySelector("img"));
    }
    const cells = [];
    items.forEach((item) => {
      const link2 = item.matches("a[href]") ? item : item.querySelector("a[href]");
      const img = item.querySelector("img");
      const src = tileImageUrl3(item);
      if (!src) return;
      const image = document.createElement("img");
      image.src = src;
      image.alt = (img && img.getAttribute("alt") || "").trim();
      const linkCell = [];
      const rawHref = link2 && link2.getAttribute("href");
      if (rawHref && rawHref !== "#") {
        const href = abs8(rawHref);
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        linkCell.push(a);
      }
      cells.push([[image], linkCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-bento", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-stack.js
  var ORIGIN9 = "https://www.titan.co.in/";
  function abs9(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN9).href;
    } catch (e) {
      return url.trim();
    }
  }
  function parse10(element, { document }) {
    const cells = [];
    let items = [...element.querySelectorAll(".tw-cb-section__item")];
    if (!items.length) items = [...element.children];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const labelEl = item.querySelector("p, span, h1, h2, h3, h4, h5, h6");
      const label = (labelEl ? labelEl.textContent : item.textContent).replace(/\s+/g, " ").trim();
      const iconCell = [];
      const src = img && abs9(img.getAttribute("src") || img.getAttribute("data-src"));
      if (src && !src.startsWith("data:")) {
        const icon = document.createElement("img");
        icon.src = src;
        icon.alt = (img.getAttribute("alt") || "").trim() || label;
        iconCell.push(icon);
      }
      const textCell = [];
      if (label) {
        const p = document.createElement("p");
        p.textContent = label;
        textCell.push(p);
      }
      const link2 = item.querySelector("a[href]");
      if (link2 && link2.getAttribute("href") !== "#") {
        const a = document.createElement("a");
        a.href = abs9(link2.getAttribute("href"));
        a.textContent = a.href;
        textCell.push(a);
      }
      if (!iconCell.length && !textCell.length) return;
      cells.push([iconCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon-stack", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-strip.js
  var ORIGIN10 = "https://www.titan.co.in/";
  var LOGIN_URL = "https://www.titan.co.in/login";
  function abs10(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN10).href;
    } catch (e) {
      return url.trim();
    }
  }
  function firstSrc8(srcset) {
    return (srcset || "").split(",")[0].trim().split(/\s+/)[0];
  }
  function parse11(element, { document }) {
    const picture = element.querySelector(":scope > picture") || element.querySelector("picture");
    const bgImg = picture ? picture.querySelector("img") : element.querySelector("img.tw-login-banner");
    const alt = (bgImg && bgImg.getAttribute("alt") || "").trim();
    let desktop = "";
    if (picture) {
      picture.querySelectorAll("source").forEach((s) => {
        const src = firstSrc8(s.getAttribute("srcset") || s.getAttribute("data-srcset"));
        if (src && !desktop && /min-width/.test(s.getAttribute("media") || "")) desktop = src;
      });
    }
    const mobile = bgImg ? bgImg.getAttribute("src") || bgImg.getAttribute("data-src") || "" : "";
    const urls = [abs10(desktop || mobile), abs10(mobile)].filter((u, i, a) => u && a.indexOf(u) === i);
    const cells = [];
    const imageCell = urls.map((u) => {
      const img = document.createElement("img");
      img.src = u;
      img.alt = alt;
      return img;
    });
    if (imageCell.length) cells.push([imageCell]);
    const content = [];
    const heading = element.querySelector(".tw-section-heading, .tw-login-prompt");
    if (heading) {
      const clone = heading.cloneNode(true);
      clone.querySelectorAll("img, button, a").forEach((el) => el.replaceWith(" "));
      const text = clone.textContent.replace(/\s+/g, " ").trim();
      if (text) {
        const p = document.createElement("p");
        p.textContent = text;
        content.push(p);
      }
    }
    const cta = element.querySelector("a[href], button");
    if (cta) {
      const label = cta.textContent.replace(/\s+/g, " ").trim() || "Login Now";
      const rawHref = cta.tagName === "A" ? cta.getAttribute("href") : "";
      const a = document.createElement("a");
      a.href = rawHref && rawHref !== "#" ? abs10(rawHref) : LOGIN_URL;
      a.textContent = label;
      const p = document.createElement("p");
      p.append(a);
      content.push(p);
    }
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-strip", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/titan-cleanup.js
  var SHOW_COMMENT = 128;
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      root.querySelectorAll(sel).forEach((el) => el.remove());
    });
  }
  function isolateMainContent(root) {
    const main = root.querySelector("#maincontent");
    if (!main) return;
    let node = main;
    while (node && node.parentElement && node.tagName !== "BODY" && node !== root) {
      const parent = node.parentElement;
      [...parent.children].forEach((sib) => {
        if (sib !== node && sib.tagName !== "HEAD") sib.remove();
      });
      if (parent === root || parent.tagName === "BODY") break;
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
    return !!el.querySelector("img, picture, video, iframe, svg, table");
  }
  function isEmpty(el) {
    return el.textContent.trim() === "" && !hasMedia(el);
  }
  function transform(hookName, element, payload) {
    const document = payload && payload.document || element.ownerDocument;
    if (hookName === "beforeTransform") {
      isolateMainContent(element);
      removeAll(element, [
        // promo strip + location capture above the header
        ".header-banner",
        ".locationCaptureContainer",
        ".locationcapture-container",
        ".header-section-m-spacing",
        ".sticky-padding",
        // global header / nav / footer
        "header.header",
        "header",
        "#sg-navbar-collapse",
        "footer.footer-div",
        "footer",
        // cookie banner
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#onetrust-pc-sdk",
        // popups / modals / widgets
        ".titan-signup-widget",
        // floating GET STARTED popup
        ".tw-login-coupon-toast-popup",
        "#trackOrderPopUp",
        "#country-redirect-modal",
        ".modal-reminders",
        ".modal-background",
        ".error-messaging",
        "#evg-new-template-WYS",
        ".saleassist-video-shorts-modal-wrapper",
        "#sa_shorts_modal-wrapper",
        // tracking pixels / iframes / scripts
        "script",
        "noscript",
        "style",
        "link",
        "iframe",
        "#criteo-tags-div",
        '[id^="batBeacon"]',
        'img[src*="analytics.yahoo.com"]',
        'img[src*="bat.bing.com"]',
        'img[src*="demdex.net"]',
        'img[src*="facebook.com/tr"]',
        'img[width="1"][height="1"]',
        // hidden form plumbing
        "input",
        // hidden placeholder H1 ("Homepage", d-none on source)
        "#homepage > h1.d-none",
        // slider chrome (never content): clones, arrows, dots, swiper UI
        ".slick-cloned",
        ".swiper-slide-duplicate",
        ".slick-arrow",
        ".slick-dots",
        ".tw-carousel-dots",
        ".carousel-indicators",
        ".carousel-control-prev",
        ".carousel-control-next",
        ".sa-shorts-swiper-button-prev",
        ".sa-shorts-swiper-button-next",
        ".swiper-button-prev",
        ".swiper-button-next",
        ".swiper-pagination",
        ".swiper-notification",
        ".swiper-slide-shadow-left",
        ".swiper-slide-shadow-right",
        ".tw-carousel-navigators"
      ]);
      removeComments(element, document);
    }
    if (hookName === "afterTransform") {
      element.querySelectorAll(".experience-commerce_layouts-twCategoryCarousel").forEach((comp) => {
        if (comp.querySelector(".tw-category-carousel.mobile-view-active") && !comp.querySelector(".desktop-view-active")) {
          comp.remove();
        }
      });
      element.querySelectorAll(".tw-category-carousel.mobile-view-active").forEach((el) => el.remove());
      removeAll(element, [
        ".experience-einstein-einsteinCarouselProductWithStatic",
        ".einstein-carousel"
      ]);
      removeAll(element, [
        ".progress-indicator",
        ".slick-arrow",
        ".slick-dots",
        ".carousel-control-prev",
        ".carousel-control-next",
        ".swiper-notification"
      ]);
      element.querySelectorAll(".experience-commerce_assets-contentAsset, .content-asset, .experience-component").forEach((el) => {
        if (el.isConnected && isEmpty(el)) el.remove();
      });
      element.querySelectorAll('a[href^="javascript"]').forEach((a) => {
        a.setAttribute("href", "https://www.titan.co.in/login");
      });
      element.querySelectorAll(".highlight-gold").forEach((span) => {
        const em = document.createElement("em");
        em.textContent = span.textContent;
        span.replaceWith(em);
      });
      element.querySelectorAll("a.tw-benefits-login-button").forEach((a) => {
        if (a.closest("strong")) return;
        const strong = document.createElement("strong");
        a.replaceWith(strong);
        strong.append(a);
      });
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const n = attr.name;
          if (n.startsWith("on") || n.startsWith("data-gtm") || n.startsWith("data-track") || n.startsWith("data-analytics") || n.startsWith("data-pid") || n === "data-tracking") {
            el.removeAttribute(n);
          }
        });
      });
    }
  }

  // tools/importer/transformers/titan-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function getSections(payload) {
    const template = payload && payload.template;
    return template && Array.isArray(template.sections) ? template.sections : [];
  }
  function transform2(hookName, element, payload) {
    const sections = getSections(payload);
    if (sections.length < 2 && !(sections[0] && sections[0].style)) return;
    const document = payload && payload.document || element.ownerDocument;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const isFirst = i === 0;
        if (isFirst && !section.style) continue;
        const el = findSectionElement(element, section);
        if (!el || !el.parentNode) continue;
        let hr = el.previousElementSibling;
        if (!hr || hr.tagName !== "HR" || hr.hasAttribute(MARKER)) {
          hr = document.createElement("hr");
          el.parentNode.insertBefore(hr, el);
        }
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (isFirst) hr.setAttribute("data-excat-first-section", "true");
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        let anchor = marker;
        if (!anchor) {
          const el = findSectionElement(element, section);
          if (!el) continue;
          anchor = el;
        }
        let next = anchor.nextElementSibling;
        while (next && next.tagName !== "HR") next = next.nextElementSibling;
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (next) {
          next.parentNode.insertBefore(metadata, next);
        } else {
          anchor.parentNode.appendChild(metadata);
        }
      }
      element.querySelectorAll("hr[data-excat-first-section]").forEach((hr) => hr.remove());
      element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
    "name": "home",
    "urls": [
      "https://www.titan.co.in/"
    ],
    "representativeUrl": "https://www.titan.co.in/",
    "description": "Titan homepage: hero and promo carousels, category/price/collection tiles, video shorts, testimonials, brand grid, trust badges",
    "blocks": [
      {
        "name": "carousel-hero",
        "instances": [
          ".tw-hero-carousel"
        ]
      },
      {
        "name": "cards-icon-inline",
        "instances": [
          ".signup-benefits-list"
        ]
      },
      {
        "name": "carousel-banner",
        "instances": [
          ".promo-banner-carousel:has(.carousel-item + .carousel-item)"
        ]
      },
      {
        "name": "cards-image-tiles",
        "instances": [
          ".tw-1x2-grid",
          ".experience-commerce_layouts-mobileGrid1r1c:has(.experience-commerce_layouts-mobileGrid2r2c) .mobile-1r-1c > .container",
          ".tw-layout-4c-3r-container"
        ]
      },
      {
        "name": "carousel-tiles",
        "instances": [
          ".tw-woalf-carousel",
          ".tw-shopbylooks-carousel"
        ]
      },
      {
        "name": "carousel-circles",
        "instances": [
          ".tw-category-carousel.desktop-view-active"
        ]
      },
      {
        "name": "carousel-shorts",
        "instances": [
          ".saleassist-video-shorts-root-container"
        ]
      },
      {
        "name": "carousel-reviews",
        "instances": [
          ".testimonials-carousel-wrapper"
        ]
      },
      {
        "name": "cards-bento",
        "instances": [
          ".tw-trending-banners__grid"
        ]
      },
      {
        "name": "cards-icon-stack",
        "instances": [
          ".tw-cb-section__container"
        ]
      },
      {
        "name": "hero-strip",
        "instances": [
          ".tw-login-banner-wrapper"
        ]
      }
    ],
    "urlPattern": "/",
    "sections": [
      {
        "id": "hero-carousel",
        "name": "Hero carousel",
        "selector": [
          ".experience-commerce_layouts-twHeroCarousel",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-twHeroCarousel"
        ],
        "style": null,
        "blocks": [
          "carousel-hero"
        ],
        "defaultContent": []
      },
      {
        "id": "signup-benefits",
        "name": "Signup benefits",
        "selector": [
          ".experience-commerce_layouts-mobileGrid1r1c:has(.signup-benefits-container)",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-mobileGrid1r1c:nth-of-type(3)"
        ],
        "style": null,
        "blocks": [
          "cards-icon-inline"
        ],
        "defaultContent": [
          ".signup-benefits-title",
          ".tw-benefits-login-button"
        ]
      },
      {
        "id": "raga-promo",
        "name": "Raga Unlocked promo banner",
        "selector": [
          ".experience-commerce_assets-imageAndButton",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_assets-imageAndButton"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".experience-commerce_assets-imageAndButton figure"
        ]
      },
      {
        "id": "promo-banner-carousel",
        "name": "Promo banner carousel",
        "selector": [
          ".experience-commerce_layouts-BannerCarousel:has(.carousel-item + .carousel-item)",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-BannerCarousel:nth-of-type(5)"
        ],
        "style": null,
        "blocks": [
          "carousel-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "watches-for-him-her",
        "name": "Watches for him / her",
        "selector": [
          ".experience-commerce_layouts-tw1x2Container",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-tw1x2Container"
        ],
        "style": null,
        "blocks": [
          "cards-image-tiles"
        ],
        "defaultContent": []
      },
      {
        "id": "shop-by-price",
        "name": "Shop by price",
        "selector": [
          ".experience-commerce_layouts-simpleCarousel",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-simpleCarousel"
        ],
        "style": "centered",
        "blocks": [
          "carousel-tiles"
        ],
        "defaultContent": [
          ".tw-woalf-carousel__heading"
        ]
      },
      {
        "id": "category-circles",
        "name": "Shop by category circles",
        "selector": [
          ".experience-commerce_layouts-twCategoryCarousel:has(.desktop-view-active)",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-twCategoryCarousel:nth-of-type(10)"
        ],
        "style": "centered",
        "blocks": [
          "carousel-circles"
        ],
        "defaultContent": [
          ".tw-category-carousel.desktop-view-active .tw-category-carousel__heading"
        ]
      },
      {
        "id": "sbi-card-banner",
        "name": "SBI card cashback banner",
        "selector": [
          ".experience-commerce_layouts-BannerCarousel:not(:has(.carousel-item + .carousel-item))",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-BannerCarousel:nth-of-type(12)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".promo-banner-carousel .carousel-item"
        ]
      },
      {
        "id": "customer-stories",
        "name": "Customer testimonials and stories (video shorts)",
        "selector": [
          "#homepage .col-12.px-0 > .experience-commerce_assets-contentAsset:has(.swiper-coverflow)",
          "#homepage .col-12.px-0 > .experience-commerce_assets-contentAsset:nth-of-type(13)",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_assets-contentAsset:nth-of-type(13)"
        ],
        "style": "centered",
        "blocks": [
          "carousel-shorts"
        ],
        "defaultContent": [
          ".tw-homepage-studio"
        ]
      },
      {
        "id": "testimonials",
        "name": "Testimonials",
        "selector": [
          "#homepage .col-12.px-0 > .experience-commerce_assets-testimonialsCarouselComponent",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_assets-testimonialsCarouselComponent"
        ],
        "style": null,
        "blocks": [
          "carousel-reviews"
        ],
        "defaultContent": [
          ".testimonial-heading",
          ".testimonial-see-more a"
        ]
      },
      {
        "id": "new-arrivals",
        "name": "New arrivals",
        "selector": [
          "#homepage .col-12.px-0 > .experience-commerce_layouts-twShopByLooksCarousel:nth-of-type(15)",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-twShopByLooksCarousel:nth-of-type(15)"
        ],
        "style": "centered",
        "blocks": [
          "carousel-tiles"
        ],
        "defaultContent": [
          ".tw-shopbylooks-carousel__heading"
        ]
      },
      {
        "id": "world-of-titan",
        "name": "Experience the world of Titan (video shorts)",
        "selector": [
          "#homepage .col-12.px-0 > .experience-commerce_assets-contentAsset:has(.saleassist-video-shorts-root-container):not(:has(.swiper-coverflow))",
          "#homepage .col-12.px-0 > .experience-commerce_assets-contentAsset:nth-of-type(16)",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_assets-contentAsset:nth-of-type(16)"
        ],
        "style": "centered",
        "blocks": [
          "carousel-shorts"
        ],
        "defaultContent": [
          ".tw-homepage-studio"
        ]
      },
      {
        "id": "collection",
        "name": "Collection",
        "selector": [
          ".experience-shopByCategory",
          ".experience-commerce_layouts-mobileGrid1r1c:has(.experience-commerce_layouts-mobileGrid2r2c)",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-shopByCategory , #homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-mobileGrid1r1c:nth-of-type(18)"
        ],
        "style": "centered",
        "blocks": [
          "cards-image-tiles"
        ],
        "defaultContent": [
          ".popular-cat-heading h4"
        ]
      },
      {
        "id": "movement-in-time",
        "name": "Movement in time",
        "selector": [
          ".experience-commerce_layouts-mobileGrid1r1c:has(.tw-trending-banners__container)",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-mobileGrid1r1c:nth-of-type(19)"
        ],
        "style": "centered",
        "blocks": [
          "cards-bento"
        ],
        "defaultContent": [
          ".tw-trending-banners__heading"
        ]
      },
      {
        "id": "shop-by-brands",
        "name": "Shop by brands",
        "selector": [
          ".experience-commerce_layouts-grid3r4c",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-grid3r4c"
        ],
        "style": "cream, centered",
        "blocks": [
          "cards-image-tiles"
        ],
        "defaultContent": [
          ".tw-layout-4c-3r__heading"
        ]
      },
      {
        "id": "discover-your-style",
        "name": "Discover your style",
        "selector": [
          "#homepage .col-12.px-0 > .experience-commerce_layouts-twShopByLooksCarousel:nth-of-type(21)",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-twShopByLooksCarousel:nth-of-type(21)"
        ],
        "style": "centered",
        "blocks": [
          "carousel-tiles"
        ],
        "defaultContent": [
          ".tw-shopbylooks-carousel__heading"
        ]
      },
      {
        "id": "trust-badges",
        "name": "Trust badges",
        "selector": [
          ".experience-commerce_layouts-1RowX1Col:has(.tw-cb-section)",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_layouts-1RowX1Col"
        ],
        "style": "light-grey",
        "blocks": [
          "cards-icon-stack"
        ],
        "defaultContent": []
      },
      {
        "id": "neucoins-login",
        "name": "NeuCoins login banner",
        "selector": [
          "#homepage .col-12.px-0 > .experience-commerce_assets-contentAsset:has(.tw-login-banner-wrapper)",
          "#homepage > div.container-fluid.px-0 > div.row.mx-0:nth-of-type(1) > div.col-12.px-0 > div.experience-component.experience-commerce_assets-contentAsset:nth-of-type(23)"
        ],
        "style": null,
        "blocks": [
          "hero-strip"
        ],
        "defaultContent": []
      }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    "cards-icon-inline": parse2,
    "carousel-banner": parse3,
    "cards-image-tiles": parse4,
    "carousel-tiles": parse5,
    "carousel-circles": parse6,
    "carousel-shorts": parse7,
    "carousel-reviews": parse8,
    "cards-bento": parse9,
    "cards-icon-stack": parse10,
    "hero-strip": parse11
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
