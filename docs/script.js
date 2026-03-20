(() => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (prefersReducedMotion) return;

  /**
   * Scroll-scrub the intro chat timeline.
   * - Uses each bubble's CSS custom props: --d (delay, seconds) and optional --hold (typing hold).
   * - As you scroll through the element, bubbles appear and then stay (typing bubbles appear only during their hold).
   */
  const chats = Array.from(document.querySelectorAll('.intro-chat'));
  if (chats.length === 0) return;

  const clamp01 = (n) => Math.max(0, Math.min(1, n));

  const parseSeconds = (value) => {
    const v = String(value || '').trim();
    if (!v) return 0;
    if (v.endsWith('ms')) return parseFloat(v) / 1000;
    if (v.endsWith('s')) return parseFloat(v);
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const smoothstep = (x) => {
    const t = clamp01(x);
    return t * t * (3 - 2 * t);
  };

  const initChat = (chat) => {
    const bubbles = Array.from(chat.querySelectorAll('.intro-chat__bubble'));
    if (bubbles.length === 0) return null;

    chat.dataset.mode = 'scroll';

    const bubbleMeta = bubbles.map((el) => {
      const cs = getComputedStyle(el);
      const d = parseSeconds(cs.getPropertyValue('--d'));
      const hold = parseSeconds(cs.getPropertyValue('--hold'));
      const isTyping = el.classList.contains('intro-chat__bubble--typing');
      return { el, d, hold, isTyping };
    });

    const minDelay = Math.min(...bubbleMeta.map((m) => m.d));

    // Timeline end considers typing hold.
    const maxEnd = Math.max(
      ...bubbleMeta.map((m) => (m.isTyping ? m.d + (m.hold || 0.75) : m.d))
    );

    // Give the last real message a bit of breathing room.
    const endTime = Math.max(maxEnd + 0.35, minDelay + 0.35);

    const state = {
      chat,
      bubbles: bubbleMeta,
      minDelay,
      endTime,
      startY: 0,
      endY: 1,
      maxProgress: 0,
    };

    const recompute = () => {
      const rect = chat.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const vh = window.innerHeight || 1;

      // Start when the chat reaches ~70% of viewport height.
      // Then play the whole timeline across a fixed scroll distance so it doesn't
      // stall before the user gets far enough down the page.
      state.startY = top - vh * 0.7;

      const minScrollRange = Math.max(700, Math.round(vh * 1.05));
      state.endY = state.startY + minScrollRange;
      if (state.endY <= state.startY) state.endY = state.startY + 1;
    };

    const render = (time) => {
      // Non-typing bubbles: appear then stay.
      const fadeIn = 0.35;
      const typingFade = 0.2;

      for (const m of state.bubbles) {
        if (m.isTyping) {
          const hold = m.hold || 0.75;
          const t0 = m.d;
          const t1 = m.d + hold;

          let alpha = 0;
          if (time >= t0 && time <= t1) {
            const inP = (time - t0) / typingFade;
            const outP = (t1 - time) / typingFade;
            alpha = Math.min(1, smoothstep(inP), smoothstep(outP));
          }

          m.el.style.opacity = String(alpha);
          m.el.style.transform = `translateY(${(1 - alpha) * 10}px)`;
          m.el.style.pointerEvents = alpha > 0.05 ? 'auto' : 'none';
          continue;
        }

        const t = time - m.d;
        const p = t <= 0 ? 0 : t >= fadeIn ? 1 : smoothstep(t / fadeIn);
        m.el.style.opacity = String(p);
        m.el.style.transform = `translateY(${(1 - p) * 10}px)`;
        m.el.style.pointerEvents = p > 0.05 ? 'auto' : 'none';
      }
    };

    const update = () => {
      const y = window.scrollY;
      let p = clamp01((y - state.startY) / (state.endY - state.startY));

      // One-way playback: don't reverse when scrolling up.
      if (p < state.maxProgress) p = state.maxProgress;
      else state.maxProgress = p;

      // Shift so the earliest bubble is visible at progress 0.
      const t = state.minDelay + p * (state.endTime - state.minDelay);
      render(t);
    };

    recompute();
    update();

    return { recompute, update };
  };

  const instances = chats.map(initChat).filter(Boolean);
  if (instances.length === 0) return;

  let raf = 0;
  const onScrollOrResize = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = 0;
      for (const inst of instances) inst.update();
    });
  };

  const onResize = () => {
    for (const inst of instances) inst.recompute();
    onScrollOrResize();
  };

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onResize);
})();
