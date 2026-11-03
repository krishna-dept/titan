/* eslint-disable */
/* global WebImporter */

/**
 * Titan section transformer.
 *
 * Uses payload.template.sections ({ id, name, selector: string[], style, ... }).
 * Selectors are tried in order; the first match is the section's start element.
 *
 * beforeTransform (parser targets still exist): walk sections in reverse and
 * insert an <hr> before every non-first section. Styled sections get a
 * temporary data-excat-section-id marker on their <hr>; a styled first section
 * gets a temporary marked <hr> that is removed afterwards.
 *
 * afterTransform: walk in reverse and add a Section Metadata block at the end of
 * each styled section (just before the next <hr>, or at the end of the parent),
 * then strip the markers / the first section's temporary <hr>.
 *
 * Note: the "collection" section spans two sibling components
 * (.experience-shopByCategory heading + the following mobileGrid1r1c tiles).
 * Its first selector matches the heading, so the break lands before the heading
 * and the tiles stay in the same section (the next break is before the
 * "movement-in-time" component).
 */

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector in this engine; try the next one
    }
  }
  return null;
}

function getSections(payload) {
  const template = payload && payload.template;
  return (template && Array.isArray(template.sections)) ? template.sections : [];
}

export default function transform(hookName, element, payload) {
  const sections = getSections(payload);
  if (sections.length < 2 && !(sections[0] && sections[0].style)) return;
  const document = (payload && payload.document) || element.ownerDocument;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const isFirst = i === 0;
      if (isFirst && !section.style) continue;

      const el = findSectionElement(element, section);
      if (!el || !el.parentNode) continue;

      let hr = el.previousElementSibling;
      if (!hr || hr.tagName !== 'HR' || hr.hasAttribute(MARKER)) {
        hr = document.createElement('hr');
        el.parentNode.insertBefore(hr, el);
      }
      if (section.style) hr.setAttribute(MARKER, section.id);
      if (isFirst) hr.setAttribute('data-excat-first-section', 'true');
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      let anchor = marker;
      if (!anchor) {
        // marker lost: fall back to the surviving section element
        const el = findSectionElement(element, section);
        if (!el) continue;
        anchor = el;
      }

      // Section end = just before the next <hr> sibling (or end of parent).
      let next = anchor.nextElementSibling;
      while (next && next.tagName !== 'HR') next = next.nextElementSibling;

      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      if (next) {
        next.parentNode.insertBefore(metadata, next);
      } else {
        anchor.parentNode.appendChild(metadata);
      }
    }

    element.querySelectorAll('hr[data-excat-first-section]').forEach((hr) => hr.remove());
    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
  }
}
