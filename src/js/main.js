// STØLE – liten, avhengighetsfri JavaScript. Siden fungerer også uten.
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Smart topptekst: skjules ved scroll ned, vises ved scroll opp ---------- */
  const header = document.querySelector('[data-header]');
  const menuBtn = document.querySelector('[data-menu-btn]');
  const menu = document.querySelector('[data-menu]');
  let lastY = window.scrollY;
  let ticking = false;
  const menuOpen = () => menuBtn && menuBtn.getAttribute('aria-expanded') === 'true';

  const onScroll = () => {
    const y = window.scrollY;
    const delta = y - lastY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 8);
      const keep = menuOpen() || header.contains(document.activeElement);
      if (y < 160 || keep) header.classList.remove('is-hidden');
      else if (delta > 6) header.classList.add('is-hidden');
      else if (delta < -6) header.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  header?.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  /* ---------- Mobilmeny ---------- */
  const setMenu = (open, { focusBtn = false } = {}) => {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (open) menu.querySelector('a')?.focus();
    else if (focusBtn) menuBtn.focus();
  };
  menuBtn?.addEventListener('click', () => setMenu(!menuOpen()));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen()) setMenu(false, { focusBtn: true });
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Kopier e-postadresse / malen ---------- */
  const status = document.querySelector('[data-copy-status]');
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Reserve for eldre nettlesere
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  };
  document.querySelectorAll('[data-copy], [data-copy-from]').forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener('click', async () => {
      const src = btn.dataset.copyFrom ? document.getElementById(btn.dataset.copyFrom) : null;
      const text = src ? src.textContent : btn.dataset.copy;
      const ok = await copyText(text);
      const msg = ok ? (btn.dataset.copied || 'Kopiert') : 'Kunne ikke kopiere. Marker teksten og kopier den manuelt.';
      btn.textContent = ok ? 'Kopiert ✓' : 'Kunne ikke kopiere';
      btn.classList.toggle('is-done', ok);
      if (status) { status.textContent = ''; setTimeout(() => { status.textContent = msg; }, 50); }
      setTimeout(() => { btn.textContent = label; btn.classList.remove('is-done'); }, 2600);
    });
  });

  /* ---------- Diskré inntoning når seksjoner kommer til syne ---------- */
  if (!reduce.matches && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('main .wrap > *, .case, .s-om__fig');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) { el.classList.add('reveal'); io.observe(el); }
    });
  }
})();
