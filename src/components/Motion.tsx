'use client';

import { useEffect } from 'react';

/** What fades up as it scrolls into view. Items inside one parent come in one after another. */
const REVEAL =
  '.section > .head, .adm-section > .head, .adm-card, .adm-nform, .cards > *, .nb-item, .cal-item, .dl-group, .art-cards > li, .faq > details, .step, .stat, .map, .section > .callout, .reg > *';

const BN = '০১২৩৪৫৬৭৮৯';

/**
 * Light scroll animations (no libraries): fade-up with a small stagger, and the stats row
 * counting up. Does nothing for people who turned on reduced motion, and without JavaScript
 * everything simply shows.
 */
export default function Motion() {
  // Scroll boxes: fade the bottom edge while there is more to scroll (works with reduced motion too).
  useEffect(() => {
    const mark = (box: HTMLElement) => {
      const more = box.scrollHeight - box.clientHeight - box.scrollTop > 24;
      box.toggleAttribute('data-more', more);
    };
    const boxes = new Set<HTMLElement>();
    const ro = new ResizeObserver((entries) => entries.forEach((e) => mark(e.target as HTMLElement)));
    const onScroll = (e: Event) => mark(e.currentTarget as HTMLElement);
    function scan() {
      document.querySelectorAll<HTMLElement>('[data-scrollbox]').forEach((box) => {
        if (boxes.has(box)) return;
        boxes.add(box);
        box.addEventListener('scroll', onScroll, { passive: true });
        ro.observe(box);
        if (box.firstElementChild) ro.observe(box.firstElementChild);
        mark(box);
      });
    }
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      ro.disconnect();
      boxes.forEach((b) => b.removeEventListener('scroll', onScroll));
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    const root = document.documentElement;

    const counted = new WeakSet<Element>();
    function countUp(el: HTMLElement) {
      if (counted.has(el)) return;
      counted.add(el);
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target)) return;
      const bn = el.dataset.lang === 'bn';
      // Years count the last stretch only (2000 → 2018) so they don't spin from zero.
      const from = target > 1000 ? target - 18 : 0;
      const start = performance.now();
      const dur = 900;
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const v = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
        const s = String(v);
        el.textContent = bn ? s.replace(/[0-9]/g, (d) => BN[Number(d)]) : s;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.classList.add('is-in');
          el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    function scan() {
      document.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
        if (el.classList.contains('rv')) return;
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
        el.style.setProperty('--i', String(Math.min(siblings.indexOf(el), 8)));
        el.classList.add('rv');
        io.observe(el);
      });
    }

    root.classList.add('motion-ok');
    scan();
    // Notices, dates and downloads stream in after the page loads; pick them up too.
    const mo = new MutationObserver(() => scan());
    mo.observe(document.querySelector('main') ?? document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
