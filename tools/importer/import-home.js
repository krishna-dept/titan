/* eslint-disable */
/* global WebImporter */

// Parsers
import carouselHeroParser from "./parsers/carousel-hero.js";
import cardsIconInlineParser from "./parsers/cards-icon-inline.js";
import carouselBannerParser from "./parsers/carousel-banner.js";
import cardsImageTilesParser from "./parsers/cards-image-tiles.js";
import carouselTilesParser from "./parsers/carousel-tiles.js";
import carouselCirclesParser from "./parsers/carousel-circles.js";
import carouselShortsParser from "./parsers/carousel-shorts.js";
import carouselReviewsParser from "./parsers/carousel-reviews.js";
import cardsBentoParser from "./parsers/cards-bento.js";
import cardsIconStackParser from "./parsers/cards-icon-stack.js";
import heroStripParser from "./parsers/hero-strip.js";

// Transformers
import titanCleanupTransformer from "./transformers/titan-cleanup.js";
import titanSectionsTransformer from "./transformers/titan-sections.js";

// Page template: home
const PAGE_TEMPLATE = {
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

const parsers = {
  "carousel-hero": carouselHeroParser,
  "cards-icon-inline": cardsIconInlineParser,
  "carousel-banner": carouselBannerParser,
  "cards-image-tiles": cardsImageTilesParser,
  "carousel-tiles": carouselTilesParser,
  "carousel-circles": carouselCirclesParser,
  "carousel-shorts": carouselShortsParser,
  "carousel-reviews": carouselReviewsParser,
  "cards-bento": cardsBentoParser,
  "cards-icon-stack": cardsIconStackParser,
  "hero-strip": heroStripParser,
};

const transformers = [
  titanCleanupTransformer,
  titanSectionsTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers("beforeTransform", main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers("afterTransform", main, payload);

    main.appendChild(document.createElement("hr"));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, "")
      .replace(/\.html?$/, "");
    const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
