/* Siden skal ikke kunne vises inni en annen side (vern mot klikkfelle) */
if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.style.display = 'none'; } }

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

  /* ---------- E-postlenker: reserve når ingen e-postapp åpner seg ----------
     Bruker man nettmail (Gmail, Uniweb o.l.) skjer det ofte ingenting når man trykker en mailto-lenke.
     Mister ikke vinduet fokus innen kort tid, kopieres adressen og en tydelig beskjed vises. */
  let toast;
  const visBeskjed = (tekst) => {
    if (!toast) {
      toast = document.createElement('p');
      toast.className = 'toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = tekst;
    toast.classList.add('is-vist');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => toast.classList.remove('is-vist'), 7000);
  };
  document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
    a.addEventListener('click', () => {
      const adresse = decodeURIComponent(a.getAttribute('href').slice(7).split('?')[0]).replace('xn--stle-hra.com', 'støle.com');
      let aapnet = false;
      const merk = () => { aapnet = true; };
      window.addEventListener('blur', merk, { once: true });
      document.addEventListener('visibilitychange', merk, { once: true });
      setTimeout(async () => {
        window.removeEventListener('blur', merk);
        document.removeEventListener('visibilitychange', merk);
        if (aapnet || !document.hasFocus()) return;
        const ok = await copyText(adresse);
        visBeskjed(ok ? `Fant ikke et e-postprogram, så jeg kopierte adressen ${adresse}. Lim den inn i e-posten din.`
                      : `Fant ikke et e-postprogram. Send til ${adresse}.`);
      }, 1200);
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

/* ---------- Prosjektskjema (/start/) ---------- */
(() => {
  const form = document.querySelector('[data-brief]');
  if (!form) return;
  const steg = [...form.querySelectorAll('[data-steg]')];
  const fremdrift = [...document.querySelectorAll('[data-fremdrift]')];
  const teller = document.querySelector('[data-teller]');
  const linje = document.querySelector('[data-linje]');
  const status = form.querySelector('[data-brief-status]');
  const lagreNokkel = 'stole-brief';
  let naa = 1;

  // Utkast i økten: ingenting forsvinner ved Tilbake, oppdatering eller nettleserens tilbakeknapp
  const lagre = () => {
    const data = {};
    new FormData(form).forEach((v, k) => { if (k === '_gotcha') return; (data[k] = data[k] || []).push(v); });
    try { sessionStorage.setItem(lagreNokkel, JSON.stringify(data)); } catch {}
  };
  const hent = () => {
    let data = null;
    try { data = JSON.parse(sessionStorage.getItem(lagreNokkel) || 'null'); } catch {}
    if (!data) {
      const pakke = new URLSearchParams(location.search).get('pakke');
      const kart = JSON.parse(form.dataset.pakker || '{}');
      if (pakke && kart[pakke]) data = { behov: kart[pakke] };
    }
    if (!data) return;
    Object.entries(data).forEach(([k, verdier]) => {
      form.querySelectorAll(`[name="${CSS.escape(k)}"]`).forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = verdier.includes(el.value);
        else el.value = verdier[0] || '';
      });
    });
  };

  // Spørsmål som bare vises når de er relevante
  const vilkaar = () => {
    const valgt = [...form.querySelectorAll('[name="behov"]:checked')].map((el) => el.value);
    form.querySelectorAll('[data-vis-hvis]').forEach((el) => {
      const vis = el.dataset.visHvis.split(' ').some((v) => valgt.includes(v));
      el.hidden = !vis;
      el.querySelectorAll('input, textarea').forEach((i) => { i.disabled = !vis; });
    });
  };

  const feil = (el, melding) => {
    const boks = document.getElementById(`${el.id}-feil`);
    if (melding) {
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', [`${el.id}-feil`, el.getAttribute('aria-describedby')].filter(Boolean).join(' '));
      if (boks) { boks.textContent = melding; boks.hidden = false; }
    } else {
      el.removeAttribute('aria-invalid');
      if (boks) { boks.hidden = true; boks.textContent = ''; }
    }
  };
  const sjekk = (el) => {
    const v = el.value.trim();
    if (el.required && !v) return el.type === 'email' ? 'Skriv inn e-postadressen din, så jeg kan svare deg.' : 'Skriv inn navnet ditt.';
    if (el.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Sjekk e-postadressen. Den ser ut til å mangle noe, for eksempel @ eller .no.';
    return '';
  };
  const gyldig = (n) => {
    let forste = null;
    steg[n - 1].querySelectorAll('input[required], input[type="email"]').forEach((el) => {
      const m = sjekk(el); feil(el, m);
      if (m && !forste) forste = el;
    });
    if (forste) forste.focus();
    return !forste;
  };

  const oppsummer = () => {
    const liste = form.querySelector('[data-oppsummering-liste]');
    const rader = [];
    const legg = (navn, verdi, tilSteg) => { if (verdi) rader.push([navn, verdi, tilSteg]); };
    const v = (k) => (form.elements[k] && !form.elements[k].disabled ? String(form.elements[k].value || '').trim() : '');
    legg('Navn', v('navn'), 1); legg('E-post', v('email'), 1); legg('Bedrift', v('bedrift'), 1);
    legg('Hjelp med', [...form.querySelectorAll('[name="behov"]:checked')].map((el) => el.dataset.label).join(', '), 2);
    legg('Tidsramme', v('tidsramme'), 4); legg('Budsjett', v('budsjett'), 4);
    liste.textContent = '';
    rader.forEach(([navn, verdi, tilSteg]) => {
      const dt = document.createElement('dt'); dt.textContent = navn;
      const dd = document.createElement('dd'); dd.textContent = verdi;
      const knapp = document.createElement('button'); knapp.type = 'button'; knapp.className = 'brief__endre'; knapp.textContent = 'Endre';
      knapp.setAttribute('aria-label', `Endre ${navn.toLowerCase()}`);
      knapp.addEventListener('click', () => vis(tilSteg));
      liste.append(dt, dd, knapp);
    });
    form.querySelector('[data-oppsummering]').hidden = !rader.length;
  };

  const vis = (n, { historikk = true, fokus = true } = {}) => {
    naa = Math.min(Math.max(1, n), steg.length);
    steg.forEach((s, i) => s.classList.toggle('is-naa', i === naa - 1));
    fremdrift.forEach((li, i) => {
      li.classList.toggle('is-naa', i === naa - 1);
      li.classList.toggle('is-ferdig', i < naa - 1);
      const hopp = li.querySelector('.brief__hopp');
      if (hopp) { hopp.disabled = i >= naa - 1; hopp.setAttribute('aria-label', i < naa - 1 ? `Gå tilbake til steg ${i + 1}: ${hopp.textContent.replace(/^\d+/, '').trim()}` : hopp.textContent.replace(/^\d+/, '').trim()); }
      if (i === naa - 1) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    if (teller) teller.textContent = `Steg ${naa} av ${steg.length}`;
    if (linje) linje.style.setProperty('--fremdrift', `${((naa - 1) / (steg.length - 1)) * 100}%`);
    if (naa === steg.length) oppsummer();
    if (historikk) history.pushState({ steg: naa }, '', `?steg=${naa}`);
    if (fokus) {
      const tittel = steg[naa - 1].querySelector('.brief__tittel');
      tittel.setAttribute('tabindex', '-1'); tittel.focus({ preventScroll: true });
      const topp = form.closest('.s-brief').getBoundingClientRect().top + window.scrollY - 90;
      if (window.scrollY > topp) window.scrollTo({ top: topp, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  };

  hent(); vilkaar();
  const startSteg = Number(new URLSearchParams(location.search).get('steg')) || 1;
  // Hopp aldri forbi steg 1 uten navn og e-post
  const tillatt = startSteg > 1 && form.elements.navn.value && form.elements.email.value ? startSteg : 1;
  history.replaceState({ steg: tillatt }, '', tillatt > 1 ? `?steg=${tillatt}` : location.pathname + location.search.replace(/[?&]steg=\d+/, ''));
  vis(tillatt, { historikk: false, fokus: false });

  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') feil(e.target, sjekk(e.target));
    if (e.target.name === 'behov') vilkaar();
    lagre();
  });
  form.addEventListener('change', lagre);
  form.addEventListener('focusout', (e) => { if (e.target.matches('input[required], input[type="email"]') && e.target.value) feil(e.target, sjekk(e.target)); });
  form.querySelectorAll('[data-neste]').forEach((b) => b.addEventListener('click', () => { if (gyldig(naa)) vis(naa + 1); }));
  // Tilbake går alltid ett steg tilbake i skjemaet (ikke nettleserhistorikken, som kan føre ut av siden)
  form.querySelectorAll('[data-tilbake]').forEach((b) => b.addEventListener('click', () => vis(naa - 1)));
  fremdrift.forEach((li, i) => li.querySelector('.brief__hopp')?.addEventListener('click', () => { if (i < naa - 1) vis(i + 1); }));
  window.addEventListener('popstate', (e) => vis(e.state?.steg || 1, { historikk: false }));
  // Enter i et tekstfelt går til neste steg i stedet for å sende hele skjemaet
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input:not([type="checkbox"]):not([type="radio"])') && naa < steg.length) {
      e.preventDefault(); if (gyldig(naa)) vis(naa + 1);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!gyldig(1)) { vis(1); return; }
    const knapp = form.querySelector('.brief__send');
    knapp.disabled = true; knapp.firstChild.textContent = 'Sender … ';
    status.hidden = true;
    // Strukturerte data: tydelige feltnavn, lister som tekst
    const fd = new FormData(form);
    const behov = [...form.querySelectorAll('[name="behov"]:checked')].map((el) => el.dataset.label);
    const data = {
      navn: fd.get('navn'), email: fd.get('email'), bedrift: fd.get('bedrift'), telefon: fd.get('telefon'), lenke: fd.get('lenke'),
      behov: behov.join(', '), behov_annet: fd.get('behov_annet'), eksisterende_profil: fd.get('eksisterende_profil'), nettside: fd.get('nettside'),
      beskrivelse: fd.get('beskrivelse'), om_bedriften: fd.get('om_bedriften'), kundene: fd.get('kundene'), maal: fd.get('maal'),
      tidsramme: fd.get('tidsramme'), budsjett: fd.get('budsjett'), inspirasjon: fd.get('inspirasjon'), annet: fd.get('annet'),
      kilde: document.referrer ? new URL(document.referrer).pathname : '', _gotcha: fd.get('_gotcha'),
      _subject: `Ny prosjektforespørsel: ${fd.get('bedrift') || fd.get('navn')}`,
    };
    Object.keys(data).forEach((k) => { if (data[k] === null || data[k] === '') delete data[k]; });
    try {
      const svar = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!svar.ok) throw new Error(String(svar.status));
      try { sessionStorage.removeItem(lagreNokkel); sessionStorage.setItem('stole-brief-navn', String(data.navn).split(' ')[0]); } catch {}
      document.body.classList.add('is-sender');
      setTimeout(() => { location.href = '/veien-videre/'; }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450);
    } catch {
      knapp.disabled = false; knapp.firstChild.textContent = 'Send forespørsel ';
      status.textContent = 'Forespørselen ble ikke sendt. Det du har skrevet er tatt vare på. Prøv igjen, eller send en e-post til hei@støle.com.';
      status.hidden = false;
    }
  });
})();

/* ---------- Veien videre ---------- */
(() => {
  const takk = document.querySelector('[data-takk]');
  if (!takk) return;
  let navn = '';
  try { navn = sessionStorage.getItem('stole-brief-navn') || ''; } catch {}
  if (navn) takk.textContent = `Takk, ${navn}. Forespørselen er sendt.`;
  const hero = document.querySelector('.s-videre-hero');
  if (hero) requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-inne')));
})();
