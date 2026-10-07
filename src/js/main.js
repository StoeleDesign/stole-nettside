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

  /* ---------- Mobilmeny (modal: innholdet bak er utilgjengelig mens den er åpen) ---------- */
  const behind = [...document.querySelectorAll('.skip, main, .site-footer')];
  const setMenu = (open, { focusBtn = false } = {}) => {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    doc.classList.toggle('menu-open', open);
    behind.forEach((el) => { el.inert = open; });
    if (open) { header?.classList.remove('is-hidden'); menu.scrollTop = 0; menu.querySelector('a')?.focus(); }
    else if (focusBtn) menuBtn.focus();
  };
  menuBtn?.addEventListener('click', () => setMenu(!menuOpen()));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  // Klikk utenfor topptekst og meny lukker menyen
  document.addEventListener('click', (e) => {
    if (menuOpen() && header && !header.contains(e.target)) setMenu(false, { focusBtn: true });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen()) setMenu(false, { focusBtn: true });
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Utskrift: hent bilder som ennå ikke er lastet ---------- */
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
  });

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

  /* ---------- Dybde-velgeren på tjenestesiden (faner på desktop, trekkspill på mobil) ---------- */
  const velger = document.querySelector('[data-velger]');
  if (velger) {
    const items = [...velger.querySelectorAll('.velger__item')];
    const btns = items.map((it) => it.querySelector('.velger__btn'));
    const panels = items.map((it) => it.querySelector('.velger__panel'));
    const desktop = window.matchMedia('(min-width: 901px)');
    const isOpen = (i) => btns[i].getAttribute('aria-expanded') === 'true';
    const setOpen = (idx, { animate = true, toggle = false } = {}) => {
      items.forEach((_, i) => {
        const was = isOpen(i);
        const next = i === idx ? (toggle && !desktop.matches ? !was : true) : false;
        btns[i].setAttribute('aria-expanded', String(next));
        panels[i].hidden = !next;
        if (next && !was && animate && !reduce.matches) {
          panels[i].classList.remove('is-entering');
          void panels[i].offsetWidth; // start animasjonen på nytt
          panels[i].classList.add('is-entering');
        }
      });
    };
    velger.classList.add('is-enhanced');
    const start = Math.min(btns.length - 1, Number(velger.dataset.default) || 0);
    setOpen(start, { animate: false });
    btns.forEach((b, i) => b.addEventListener('click', () => setOpen(i, { toggle: true })));
    // Piltaster mellom nivåene (desktop)
    velger.addEventListener('keydown', (e) => {
      const i = btns.indexOf(document.activeElement);
      if (i < 0 || !['ArrowDown', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const n = (i + (e.key === 'ArrowDown' ? 1 : btns.length - 1)) % btns.length;
      btns[n].focus();
      if (desktop.matches) setOpen(n);
    });
    desktop.addEventListener('change', () => { if (desktop.matches && !btns.some((_, i) => isOpen(i))) setOpen(start, { animate: false }); });

    const openSlug = (slug) => {
      const i = items.findIndex((it) => it.dataset.slug === slug);
      if (i < 0) return false;
      setOpen(i);
      const target = desktop.matches ? velger : btns[i];
      target.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
      btns[i].focus({ preventScroll: true });
      return true;
    };
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#valg-"]');
      if (!a) return;
      const slug = a.getAttribute('href').slice(6);
      if (openSlug(slug)) { e.preventDefault(); if (location.hash !== `#valg-${slug}`) history.pushState(null, '', `#valg-${slug}`); }
    });
    if (location.hash.startsWith('#valg-')) openSlug(location.hash.slice(6));
    const fromHash = () => { if (location.hash.startsWith('#valg-')) openSlug(location.hash.slice(6)); };
    window.addEventListener('hashchange', fromHash);
  }

  /* ---------- Glorien i «Personen bak» beveger seg bare når den er synlig ---------- */
  const om = document.querySelector('.s-om');
  if (om && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => om.classList.toggle('is-visible', en.isIntersecting)).observe(om);
  }

  /* ---------- Diskré inntoning når innhold kommer til syne ---------- */
  if (!reduce.matches && 'IntersectionObserver' in window) {
    const groupSel = '.moments, .steps, .tiers, .sit, .kort__list, .reise';
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    const below = (el) => el.getBoundingClientRect().top > window.innerHeight;
    const watch = (el, cls = 'reveal') => { if (below(el)) { el.classList.add(cls); io.observe(el); } };
    document.querySelectorAll(groupSel).forEach((g) => {
      watch(g, 'reveal-group');
      [...g.children].forEach((child, i) => { child.style.setProperty('--i', String(i)); watch(child); });
    });
    document.querySelectorAll('main .wrap > *, .case, .s-om__fig').forEach((el) => {
      if (!el.matches(groupSel) && !el.closest('.velger') && !el.matches('.s-intro__panel')) watch(el);
    });
    document.querySelectorAll('.velger__item').forEach((el) => watch(el.querySelector('.velger__h')));
  }
})();
