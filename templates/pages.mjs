// Maler for alle sidene. Ren JavaScript (template literals), ingen rammeverk.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------- Hjelpere ---------- */
export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// *tekst* blir fremhevet (kursiv aksent). \n blir linjeskift.
const inline = (s = '') => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
const paras = (s = '', cls = '') => String(s).split(/\n\s*\n/).filter(Boolean)
  .map((p) => `<p${cls ? ` class="${cls}"` : ''}>${inline(p.trim())}</p>`).join('');
const svg = (name) => fs.readFileSync(path.join(root, 'src/i', name), 'utf8');
const mailto = (site, body, subject) => {
  const q = [`subject=${encodeURIComponent(subject || site.kontakt.emne)}`];
  if (body) q.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${site.epost_teknisk}?${q.join('&')}`;
};
const chevron = `<svg class="chev" width="6" height="12" viewBox="0 0 6 12" aria-hidden="true" focusable="false"><path d="M1 1l4 5-4 5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- Organiske kanter (fra Figma) ---------- */
const EDGES = {
  wave: ['28 -2 1311 152', 'M1339.02 104.296C1285.08 66.6411 1233.73 100.027 1163.96 117.96C1094.18 135.893 984.76 138.438 948.683 117.96C912.607 97.482 812.497 63.1311 680.482 95.5655C617.619 118.597 523.129 108.85 496.763 59.0888C475.847 19.6147 387.396 -31.9868 318.921 25.9718C250.445 83.9303 203.176 45.5088 167.491 33.2313C114.541 15.0138 91.1532 107.279 28.0471 66.6252V150H1339.02Z'],
  panel: ['0 0 460 80', 'M0 8.56417C32.6887 26.737 40.9873 25.8013 88.1132 43.2959C109.862 49.4871 145.73 57.9534 167.5 56.7954C167.5 56.7954 214.887 56.7949 245.5 52.2954C276.113 47.7959 281.113 45.7954 321.439 31.785C361.764 17.7745 390.113 -2.70402 409.113 0.29579C428.113 3.29559 460 4.7959 460 66.1114V80H0Z'],
  sag: ['0 0 1314 57', 'M0 0C0 0 399.338 56.9121 657 56.9121C914.662 56.9121 1314 0 1314 0V57H0Z'],
  peak: ['0 0 1314 56', 'M0 56C0 56 399.374 0 657 0C914.626 0 1314 56 1314 56Z'],
  soft: ['0 -4 1329 60', 'M0 0.590889C0 0.590889 201.244 45.6223 332.51 50.7937C461.973 55.8941 534.272 37.4992 663.459 27.7414C793.68 17.9056 866.225 -3.85265 996.75 0.590889C1127.94 5.05716 1329 50.7937 1329 50.7937V56H0Z'],
  double: ['0 0 1329 67', 'M1329 0C1329 0 1129.64 66.668 996.75 66.668C863.861 66.668 797.389 -0.02 664.5 0C531.711 0.02 465.3 66.628 332.51 66.668C199.522 66.708 0 0 0 0V67H1329Z'],
  organic: ['0 -12 1281 82', 'M0.5 40.7862C196.06 -0.423752 418.28 -11.1738 640.5 13.9062C862.72 38.9962 1076.06 69.4562 1280.5 19.2862V70H0.5Z'],
};
const edge = (name, cls = '') => {
  const [vb, d] = EDGES[name];
  return `<svg class="edge edge--${name} ${cls}" viewBox="${vb}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${d}" fill="currentColor"/></svg>`;
};

/* ---------- Bilder ---------- */
// Versjon fra innholdet i bildet, så nettlesere henter nytt bilde når det endres (bildene caches i 30 dager)
const bildeVersjon = (name, x) => {
  try { return crypto.createHash('sha1').update(fs.readFileSync(path.join(root, 'src/img', `${name}-${x}.jpg`))).digest('hex').slice(0, 8); } catch { return ''; }
};
const picture = ({ name, widths, sizes, alt, cls = '', w, h, eager = false }) => {
  const v = bildeVersjon(name, widths[1]);
  const q = v ? `?v=${v}` : '';
  const set = (ext) => widths.map((x) => `/img/${name}-${x}.${ext}${q} ${x}w`).join(', ');
  return `<picture class="${cls}">
    <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
    <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
    <img src="/img/${name}-${widths[1]}.jpg${q}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
  </picture>`;
};

/* ---------- Strukturerte data og delingsbilder ---------- */
const brodsmuler = (site, sti) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: sti.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.navn, item: site.url + x.url })),
});
// Eget delingsbilde hvis src/img/og-<navn>.jpg finnes, ellers det felles
// Prosjekttavle (collage fra designmanualen) hvis src/img/case-<navn>-1200.jpg finnes
const harTavle = (navn) => fs.existsSync(path.join(root, 'src/img', `case-${navn}-1200.jpg`));
const ogFor = (navn) => (fs.existsSync(path.join(root, 'src/img', `og-${navn}.jpg`)) ? `og-${navn}.jpg` : 'og.jpg');
// Tjenesteområdet (kommuner/byer i site.json) som strukturerte data
const omrader = (site) => (site.tjenesteomrade || []).filter(Boolean).map((name) => ({ '@type': 'AdministrativeArea', name }));
const FAGOMRADER = ['Grafisk design', 'Visuell identitet', 'Logodesign', 'Visuell profil', 'Designmanual', 'Merkevarebygging'];

/* ---------- Ramme ---------- */
const layout = (ctx, { title, description, path: p, body, bodyClass = '', noindex = false, preloadHero = false, ld: ekstraLd = [], ogImage = 'og.jpg', ogAlt = 'STØLE-logoen over en tåkete fjellvidde.' }) => {
  const { site, hashed, tjenester } = ctx;
  const url = site.url + p;
  const fonts = ['Newsreader-normal', 'SchibstedGrotesk-normal']
    .map((f) => `<link rel="preload" href="${hashed[`fonts/${f}.woff2`] || `/fonts/${f}.woff2`}" as="font" type="font/woff2" crossorigin>`).join('\n  ');
  const nettsted = {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${site.url}/#nettsted`, name: site.navn,
    alternateName: ['Støle', site.visningsdomene].filter(Boolean), url: `${site.url}/`, inLanguage: 'nb-NO',
    publisher: { '@id': `${site.url}/#virksomhet` },
  };
  const virksomhet = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': `${site.url}/#virksomhet`, name: site.navn,
    legalName: site.virksomhet, url: `${site.url}/`, email: site.epost_teknisk, description: site.beskrivelse,
    image: `${site.url}/img/og.jpg`, logo: `${site.url}/img/logo-512.png`,
    address: { '@type': 'PostalAddress', streetAddress: 'Husvikveien 101B', postalCode: '3113', addressLocality: 'Tønsberg', addressCountry: 'NO' },
    areaServed: omrader(site), knowsAbout: FAGOMRADER,
    founder: { '@type': 'Person', name: 'Simen Støle Skjelland', jobTitle: 'Grafisk designer' },
    identifier: { '@type': 'PropertyValue', propertyID: 'Organisasjonsnummer', value: site.orgnr.replace(/\s/g, '') },
    ...(tjenester ? { hasOfferCatalog: {
      '@type': 'OfferCatalog', name: 'Tjenester',
      itemListElement: tjenester.pakker.map((x) => ({ '@type': 'Offer', itemOffered: {
        '@type': 'Service', name: x.navn, description: x.seo_beskrivelse, url: `${site.url}/tjenester/${x.slug}/` } })),
    } } : {}),
    ...(site.instagram ? { sameAs: [`https://www.instagram.com/${site.instagram}/`] } : {}),
  };
  const forsiden = {
    '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${site.url}/#forsiden`, url: `${site.url}/`, name: title,
    isPartOf: { '@id': `${site.url}/#nettsted` }, about: { '@id': `${site.url}/#virksomhet` },
    primaryImageOfPage: { '@type': 'ImageObject', url: `${site.url}/img/og.jpg`, width: 1200, height: 630 },
  };
  const ldList = [...(p === '/' ? [nettsted, virksomhet, forsiden] : []), ...ekstraLd];
  const ld = ldList.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n  ');
  return `<!doctype html>
<html lang="nb">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
  <meta name="theme-color" content="#48151e">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="nb_NO">
  <meta property="og:site_name" content="${esc(site.navn)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site.url}/img/${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(ogAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-192.png" sizes="192x192" type="image/png">
  <link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png">
  <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  ${fonts}
  ${preloadHero ? `<link rel="preload" as="image" type="image/avif" imagesrcset="${[1100, 1600, 2320].map((x) => `/img/hero-${x}.avif?v=${bildeVersjon('hero', 1600)} ${x}w`).join(', ')}" imagesizes="100vw" fetchpriority="high">` : ''}
  <link rel="stylesheet" href="${hashed['css/main.css']}">
  <script src="${hashed['js/main.js']}" defer></script>
  ${ld}
</head>
<body class="${bodyClass}">
  <a class="skip" href="#innhold">Hopp til innholdet</a>
  ${header(ctx, p, body.includes('id="kontakt"') ? '#kontakt' : '/#kontakt')}
  <main id="innhold" tabindex="-1">
${body}
  </main>
  ${footer(ctx)}
</body>
</html>`;
};

const header = ({ site }, current, cta = '#kontakt') => {
  const isActive = (l) => l !== '/' && (current === l || (l !== '/#arbeid' && !l.includes('#') && current.startsWith(l)));
  const links = site.meny.map((m) => `<li><a href="${m.lenke}"${isActive(m.lenke) ? ' aria-current="page"' : ''}>${esc(m.tekst)}</a></li>`).join('');
  return `<header class="site-header" data-header>
    <div class="site-header__bar wrap">
      <a class="brand" href="/" aria-label="STØLE – til forsiden"><img src="/i/logo-cream.svg" alt="" width="149" height="37"></a>
      <nav class="nav" aria-label="Hovedmeny">
        <ul class="nav__list" id="meny">${links}</ul>
      </nav>
      <a class="pill pill--nav" href="${cta}">
        <span class="pill--nav__long">${esc(site.knapp_meny)}</span><span class="pill--nav__short">${esc(site.knapp_meny_kort)}</span>
      </a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobilmeny" data-menu-btn>
        <span>Meny</span><span class="menu-btn__icon" aria-hidden="true"></span>
      </button>
    </div>
    <div class="mobile-menu" id="mobilmeny" hidden data-menu>
      <nav aria-label="Mobilmeny"><ul>${links}</ul></nav>
      <a class="pill pill--sand" href="${cta}">${esc(site.knapp_meny)}</a>
    </div>
  </header>`;
};

const footer = ({ site }) => `<footer class="site-footer">
    ${edge('organic')}
    <div class="wrap site-footer__grid">
      <a class="site-footer__logo" href="/" aria-label="STØLE – til forsiden"><img src="/i/logo-cream-lg.svg" alt="" width="934" height="270" loading="lazy"></a>
      <dl class="facts facts--footer">
        <dt>Virksomhet</dt><dd>${esc(site.virksomhet)} <span class="muted">(${esc(site.foretaksform)})</span></dd>
        <dt>Org.nr.</dt><dd>${esc(site.orgnr)}</dd>
        <dt>Adresse</dt><dd>${esc(site.adresse)}</dd>
        ${site.omrade ? `<dt>Område</dt><dd>${esc(site.omrade)}</dd>` : ''}
        <dt>E-post</dt><dd><a href="mailto:${site.epost_teknisk}">${esc(site.epost)}</a></dd>
        ${site.instagram ? `<dt>Instagram</dt><dd><a href="https://www.instagram.com/${esc(site.instagram)}/" rel="me">@${esc(site.instagram)}</a></dd>` : ''}
      </dl>
      <nav class="site-footer__nav" aria-label="Bunnmeny">
        <ul>
          <li><a href="/tjenester/">Tjenester</a></li>
          <li><a href="/#arbeid">Arbeid</a></li>
          <li><a href="/#om">Om STØLE</a></li>
          <li><a href="/personvern/">Personvern</a></li>
        </ul>
      </nav>
      <p class="site-footer__fine">${esc(site.bunntekst_personvern)}<br>© ${new Date().getFullYear()} STØLE</p>
    </div>
  </footer>`;

/* ---------- Delte komponenter ---------- */
const kontakt = ({ site }, { lead, tittel, undertittel, id = 'kontakt' } = {}) => {
  const k = site.kontakt;
  return `<section class="s-kontakt" id="${id}" aria-labelledby="${id}-tittel">
    <div class="s-kontakt__mark" aria-hidden="true"></div>
    <div class="wrap s-kontakt__grid">
      <div class="s-kontakt__head">
        <h2 class="display display--xl" id="${id}-tittel">${inline(tittel || k.tittel)}</h2>
        <p class="s-kontakt__sub">${esc(undertittel || k.undertittel)}</p>
        <p class="lead">${inline(lead || k.ingress)}</p>
      </div>
      <div class="s-kontakt__ways">
        <h3 class="s-kontakt__h3">${esc(k.epost_tittel)}</h3>
        <p class="s-kontakt__muted">${esc(k.epost_tekst)}</p>
        <p class="s-kontakt__addr"><a href="mailto:${site.epost_teknisk}">${esc(site.epost)}</a></p>
        <div class="btn-row">
          <a class="btn btn--solid" href="${mailto(site)}">Skriv e-post ${chevron}</a>
          <button class="btn btn--ghost" type="button" data-copy="${esc(site.epost)}" data-copied="Adressen er kopiert">Kopier adressen</button>
        </div>
        ${k.reserve ? `<p class="s-kontakt__muted s-kontakt__reserve">${esc(k.reserve)}</p>` : ''}
        <details class="tmpl">
          <summary><span>${esc(k.mal_tittel)}</span><span class="tmpl__plus" aria-hidden="true"></span></summary>
          <div class="tmpl__body">
            <p class="s-kontakt__muted">${esc(k.mal_forklaring)}</p>
            <pre class="tmpl__text" id="${id}-mal">${esc(k.mal)}</pre>
            <div class="btn-row">
              <button class="btn btn--ghost" type="button" data-copy-from="${id}-mal" data-copied="Teksten er kopiert">Kopier teksten</button>
              <a class="btn btn--solid" href="${mailto(site, k.mal)}">Åpne i e-post ${chevron}</a>
            </div>
          </div>
        </details>
        <p class="sr-only" role="status" aria-live="polite" data-copy-status></p>
      </div>
    </div>
  </section>`;
};

const tidslinje = (f) => {
  const k = `<span class="tl__k">${esc(f.bli_kjent)}</span>`;
  const d = `<span class="tl__d">${esc(f.design)}</span>`;
  const jobs = (n) => `<span class="tl__job">${esc(f.oppdrag)} ${n}</span>`;
  return `<figure class="tl" aria-labelledby="tl-cap">
    <figcaption class="sr-only" id="tl-cap">Sammenligning: Med ny designer hver gang starter hvert av tre oppdrag med «bli kjent» før design. Med fast designer skjer «bli kjent» bare én gang, og tiden som spares blir til overs.</figcaption>
    <div class="tl__row" aria-hidden="true">
      <p class="tl__title">${esc(f.rad_a)}</p>
      <div class="tl__bars tl__bars--a"><div class="tl__grp">${k}${d}${jobs(1)}</div><div class="tl__grp">${k}${d}${jobs(2)}</div><div class="tl__grp">${k}${d}${jobs(3)}</div></div>
    </div>
    <div class="tl__row" aria-hidden="true">
      <p class="tl__title">${esc(f.rad_b)}</p>
      <div class="tl__bars tl__bars--b"><div class="tl__grp tl__grp--2">${k}${d}${jobs(1)}</div><div class="tl__grp">${d}<span class="tl__job">2</span></div><div class="tl__grp">${d}<span class="tl__job">3</span></div><span class="tl__s">${esc(f.spart)}</span></div>
    </div>
  </figure>`;
};

const dybdeIkon = (nivaa, cls = '') => nivaa > 0
  ? `<img class="dybde ${cls}" src="/i/dybde-${Math.min(3, Math.round(nivaa))}.svg" alt="" width="176" height="88" loading="lazy">`
  : `<img class="dybde dybde--fast ${cls}" src="/i/steg-5.svg" alt="" width="138" height="32" loading="lazy">`;

/* ---------- Forside ---------- */
export const forside = (ctx, c) => {
  const { site, tjenester } = ctx;
  const ikon = { vokst: ['ikon-vokst.svg', 166, 100], like: ['ikon-like.svg', 166, 100], logo: ['ikon-logo.svg', 144, 87] };
  const body = `
    <section class="s-hero" aria-label="Velkommen">
      ${picture({ name: 'hero', widths: [1100, 1600, 2320], sizes: '100vw', alt: c.helt.bilde_alt, cls: 's-hero__img', w: 2320, h: 1490, eager: true })}
      <div class="s-hero__logo"><img src="/i/logo-wine.svg" alt="STØLE" width="934" height="270"></div>
    </section>

    <section class="s-intro" aria-labelledby="intro-tittel">
      ${edge('wave')}
      ${edge('wave', 'edge--wave-panel')}
      <div class="wrap s-intro__grid">
        <div class="s-intro__panel" aria-hidden="true">${edge('panel', 'edge--panel')}</div>
        <div class="s-intro__mark" aria-hidden="true"></div>
        <h1 class="display display--hero" id="intro-tittel">${c.helt.etikett ? `<span class="label label--caps label--blue s-intro__eyebrow">${esc(c.helt.etikett)}</span><span class="sr-only">: </span>` : ''}${esc(c.helt.tittel_a)} <em>${esc(c.helt.tittel_b)}</em></h1>
        <hr class="rule">
        <div class="s-intro__body">${paras(c.helt.ingress)}</div>
        <div class="s-intro__actions">
          <a class="pill" href="#kontakt">${esc(c.helt.knapp)}</a>
          <a class="textlink" href="#arbeid">${esc(c.helt.lenke)}</a>
        </div>
      </div>
    </section>

    <section class="s-kjenner" aria-labelledby="kjenner-tittel">
      ${edge('sag')}
      <div class="wrap">
        <h2 class="label label--caps label--center" id="kjenner-tittel">${esc(c.kjenner.etikett)}</h2>
        <ul class="moments">
          ${c.kjenner.sitater.map((s) => { const [f, w, h] = ikon[s.ikon] || ikon.vokst; return `<li class="moment">
            <img src="/i/${f}" alt="" width="${w}" height="${h}" loading="lazy">
            <blockquote><p>${esc(s.a)}${s.b ? ` <span>${esc(s.b)}</span>` : ''}</p></blockquote>
          </li>`; }).join('')}
        </ul>
      </div>
    </section>

    <section class="s-hvorfor" aria-labelledby="hvorfor-tittel">
      ${edge('peak')}
      <div class="wrap">
        <p class="label">${esc(c.hvorfor.etikett)}</p>
        <div class="s-hvorfor__grid">
          <h2 class="display" id="hvorfor-tittel">${inline(c.hvorfor.tittel)}</h2>
          <div class="s-hvorfor__prop">
            <p class="s-hvorfor__big">${inline(c.hvorfor.stor)}</p>
            ${c.hvorfor.liten ? `<p class="s-hvorfor__small">${inline(c.hvorfor.liten)}</p>` : ''}
          </div>
        </div>
        <div class="distill" aria-hidden="true">
          <div class="distill__grid">${Array.from({ length: 52 }, (_, i) => `<span${i === 21 ? ' class="is-deg"' : ''}></span>`).join('')}</div>
          <p class="distill__note">${esc(c.hvorfor.merknad)}</p>
          <svg class="distill__arrow" width="263" height="152" viewBox="0 0 263.057 152.425" fill="none" aria-hidden="true" focusable="false"><path class="distill__arrow-path" pathLength="1" d="M263 0.496C263 0.496 174.064 10.91 125 37.474C74.819 64.642 26.715 119.328 7.994 142.32" stroke="#5A1A26"/><g class="distill__arrow-head"><path d="M7.994 142.32C4.243 146.926 1.672 150.26 0.5 151.846L16.5 149.496Z M0.5 135.996V151.846C1.672 150.26 4.243 146.926 7.994 142.32Z" fill="#5A1A26"/><path d="M7.994 142.32L16.5 149.496L0.5 151.846V135.996Z" stroke="#5A1A26"/></g></svg>
        </div>
      </div>
    </section>

    <section class="s-arbeid" id="arbeid" aria-labelledby="arbeid-tittel">
      <div class="s-arbeid__band"><div class="wrap"><p class="label">${esc(c.arbeid.etikett)}</p></div></div>
      <div class="wrap"><h2 class="display" id="arbeid-tittel">${inline(c.arbeid.tittel)}</h2></div>
      ${c.arbeid.prosjekter.map((p, i) => `<article class="case${i % 2 ? ' case--flip' : ''}" aria-labelledby="case-${i}">
        <div class="case__pic${harTavle(p.bilde) ? ' case__pic--tavle' : ` case__pic--${esc(p.bilde)}`}">
          ${harTavle(p.bilde)
            ? picture({ name: `case-${p.bilde}`, widths: [800, 1200, 1600], sizes: '(min-width: 760px) 48vw, 100vw', alt: p.bilde_alt, w: 1600, h: 1534 })
            : p.bilde === 'nordhagen'
              ? picture({ name: 'nordhagen', widths: [800, 1200, 1600], sizes: '(min-width: 760px) 48vw, 100vw', alt: p.bilde_alt, w: 1600, h: 1200 })
              : `<img src="/i/bauta.svg" alt="${esc(p.bilde_alt)}" width="624" height="624" loading="lazy">`}
        </div>
        <div class="case__meta">
          <p class="tag">${esc(p.merke)}</p>
          <h3 class="case__title" id="case-${i}">${esc(p.navn)}</h3>
          <p class="case__text">${inline(p.tekst)}</p>
          <dl class="facts case__facts"><dt>Fagfelt</dt><dd>${esc(p.fagfelt)}</dd><dt>Leveranse</dt><dd>${esc(p.leveranse)}</dd></dl>
        </div>
      </article>`).join('')}
    </section>

    <section class="s-prosess" id="prosess" aria-labelledby="prosess-tittel">
      <div class="s-prosess__band" aria-hidden="true"></div>
      <div class="s-prosess__body">
        ${edge('soft')}
        <div class="wrap">
          <p class="label">${esc(c.prosess.etikett)}</p>
          <h2 class="display" id="prosess-tittel">${inline(c.prosess.tittel)}</h2>
          <ol class="steps">
            ${c.prosess.steg.map((s, i) => `<li class="step">
              <img class="step__icon" src="/i/steg-${i + 1}.svg" alt="" loading="lazy">
              <span class="step__num">0${i + 1}</span>
              <h3 class="step__title">${esc(s.navn)}</h3>
              <p class="step__text">${inline(s.tekst)}</p>
            </li>`).join('')}
          </ol>
        </div>
      </div>
    </section>

    <section class="s-tjenester" id="tjenester" aria-labelledby="tjenester-tittel">
      ${edge('double')}
      <div class="wrap">
        <p class="label label--caps label--blue">${esc(c.tjenester.etikett)}</p>
        <div class="s-tjenester__intro">
          <div>
            <h2 class="display" id="tjenester-tittel">${inline(c.tjenester.tittel)}</h2>
            <div class="serif-body">${paras(c.tjenester.ingress)}</div>
          </div>
          <p class="serif-body s-tjenester__usikker">${inline(c.tjenester.usikker)}</p>
        </div>
        <ul class="tiers">
          ${tjenester.pakker.filter((p) => p.nivaa > 0).map((p) => `<li class="tier">
            ${dybdeIkon(p.nivaa)}
            <h3 class="tier__name">${esc(p.navn)}</h3>
            <p class="tier__when">${esc(p.naar)}</p>
            <p class="tier__ex">${esc(p.eksempler)}</p>
            <a class="pill pill--sand" href="/tjenester/${p.slug}/" aria-label="${esc(c.tjenester.knapp)}: ${esc(p.navn)}">${esc(c.tjenester.knapp)}</a>
          </li>`).join('')}
        </ul>
        <p class="s-tjenester__all"><a class="textlink" href="/tjenester/">${esc(c.tjenester.alle)}</a></p>
      </div>
    </section>

    <section class="s-fast" aria-labelledby="fast-tittel">
      <div class="wrap s-fast__grid">
        <div>
          <p class="label label--caps label--wine">${esc(c.fast.etikett)}</p>
          <h2 class="display" id="fast-tittel">${inline(c.fast.tittel)}</h2>
          <p class="s-fast__q">${esc(c.fast.sporsmal)}</p>
          <p class="s-fast__text">${inline(c.fast.tekst)}</p>
          <a class="pill pill--wine" href="/tjenester/${esc((tjenester.pakker.find((p) => p.nivaa === 0) || {}).slug || '')}/">${esc(c.fast.knapp)}</a>
        </div>
        ${tidslinje(c.fast)}
      </div>
    </section>

    <section class="s-om" id="om" aria-labelledby="om-tittel">
      <div class="wrap s-om__grid">
        <div class="s-om__head">
          <p class="label label--caps">${esc(c.om.etikett)}</p>
          <h2 class="display display--statement" id="om-tittel">${inline(c.om.tittel)}</h2>
        </div>
        <div class="s-om__body">
          <p>${inline(c.om.tekst)}</p>
          <p>${inline(c.om.hvem)}</p>
          <p>${inline(c.om.verktoy)}</p>
          ${site.instagram ? `<p><a class="textlink" href="https://www.instagram.com/${esc(site.instagram)}/" rel="me">${esc(c.om.instagram || 'Følg arbeidet på Instagram')}&nbsp;<span class="muted">@${esc(site.instagram)}</span></a></p>` : ''}
        </div>
        <figure class="s-om__fig">
          <div class="s-om__sheet"><img src="/i/rydde.svg" alt="${esc(c.om.illustrasjon_alt)}" width="358" height="141" loading="lazy"></div>
          <figcaption class="s-om__figcap">${esc(c.om.illustrasjon_tekst)}</figcaption>
        </figure>
      </div>
      <div class="s-om__glow" aria-hidden="true"></div>
    </section>

    ${kontakt(ctx)}`;
  return layout(ctx, { title: c.seo_tittel, description: c.seo_beskrivelse, path: '/', body, bodyClass: 'page-home', preloadHero: true });
};

/* ---------- Tjenester: oversikt ---------- */
export const tjenesteoversikt = (ctx, t) => {
  const { site } = ctx;
  const pakker = t.pakker.filter((p) => p.nivaa > 0);
  const fast = t.pakker.find((p) => p.nivaa === 0);
  const f = ctx.forside.fast;
  const anker = (slug) => (fast && slug === fast.slug ? '#fast-designer' : `#valg-${slug}`);
  const navn = (slug) => (t.pakker.find((p) => p.slug === slug) || {}).navn || '';
  const body = `
    <section class="s-pagehero s-svc-hero" aria-labelledby="side-tittel">
      <div class="wrap s-pagehero__grid">
        <div class="s-pagehero__text">
          <p class="label label--caps label--blue">${esc(t.etikett)}</p>
          <h1 class="display display--hero s-svc-hero__title" id="side-tittel">${inline(t.tittel)}</h1>
          <hr class="rule">
          <p class="s-pagehero__lead">${inline(t.ingress)}</p>
          <div class="s-intro__actions">
            <a class="pill" href="#nivaa">${esc(t.knapp)}</a>
            <a class="textlink" href="#kontakt">${esc(t.lenke)}</a>
          </div>
        </div>
        <div class="kort s-pagehero__side" role="group" aria-labelledby="kort-tittel">
          <div class="s-pagehero__panel" aria-hidden="true">${edge('panel', 'edge--panel')}</div>
          <h2 class="kort__title" id="kort-tittel">${esc(t.kortfortalt_tittel)}</h2>
          <ol class="kort__list">${t.kortfortalt.map((k, i) => `<li><span class="kort__num">0${i + 1}</span><span><strong>${esc(k.tittel)}</strong> ${esc(k.tekst)}</span></li>`).join('')}</ol>
        </div>
      </div>
    </section>

    <section class="s-sit" aria-labelledby="sit-tittel">
      ${edge('sag')}
      <div class="wrap">
        <h2 class="label label--caps label--center label--blue" id="sit-tittel">${esc(t.situasjoner_etikett)}</h2>
        <ul class="sit">
          ${t.situasjoner.map((x) => `<li><a class="sit__item" href="${anker(x.pakke)}" data-open="${esc(x.pakke)}">
            <span class="sit__quote">${esc(x.sitat)}</span>
            <span class="sit__text">${esc(x.tekst)}</span>
            <span class="sit__go">${esc(navn(x.pakke))} ${chevron}</span>
          </a></li>`).join('')}
        </ul>
      </div>
    </section>

    <section class="s-velger" id="nivaa" aria-labelledby="velger-tittel">
      ${edge('peak')}
      <div class="wrap">
        <div class="s-velger__head">
          <div>
            <p class="label">${esc(t.velger_etikett)}</p>
            <h2 class="display" id="velger-tittel">${inline(t.velger_tittel)}</h2>
          </div>
          <p class="s-velger__intro">${inline(t.velger_ingress)}</p>
        </div>
        <div class="velger" data-velger data-default="1">
          ${pakker.map((p, i) => `<div class="velger__item" data-slug="${esc(p.slug)}">
            <h3 class="velger__h">
              <button class="velger__btn" type="button" id="vb-${esc(p.slug)}" aria-expanded="true" aria-controls="valg-${esc(p.slug)}">
                <span class="velger__num" aria-hidden="true">0${i + 1}</span>
                <span class="velger__name">${esc(p.navn)}</span>
                <span class="velger__when">${esc(p.naar)}</span>
                <img class="velger__mini" src="/i/dybde-${Math.min(3, p.nivaa)}.svg" alt="" width="176" height="88">
                <span class="velger__plus" aria-hidden="true"></span>
              </button>
            </h3>
            <div class="velger__panel" id="valg-${esc(p.slug)}" role="region" aria-labelledby="vb-${esc(p.slug)}">
              <div class="velger__art">
                <img class="dybde dybde--xl" src="/i/dybde-${Math.min(3, p.nivaa)}.svg" alt="" width="176" height="88">
                <p class="velger__depth"><strong>Omfang:</strong> ${esc(p.dybde)}</p>
              </div>
              <div class="velger__body">
                <p class="velger__lead">${inline(p.ingress)}</p>
                <div class="velger__cols">
                  <div>
                    <h4 class="velger__h4">${esc(p.passer_tittel)}</h4>
                    <ul class="dots">${(p.passer || []).map((x) => `<li>${inline(x)}</li>`).join('')}</ul>
                  </div>
                  <div>
                    <h4 class="velger__h4">${esc(p.leveranser_tittel)}</h4>
                    <ul class="dots">${(p.leveranser || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
                  </div>
                </div>
                <h4 class="velger__h4">${esc(p.prosess_tittel)}</h4>
                <ol class="mini-steps">${(p.prosess || []).map((x) => `<li>${esc(x.navn)}</li>`).join('')}</ol>
                <div class="velger__actions">
                  <a class="pill pill--wine-solid" href="/tjenester/${esc(p.slug)}/">Les mer om ${esc(p.navn)} ${chevron}</a>
                  <a class="textlink" href="${mailto(site, '', `Spørsmål om ${p.navn}`)}">Spør om ${esc(p.navn)}</a>
                </div>
              </div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="s-fast s-fast--page" id="fast-designer" aria-labelledby="fast-tittel">
      <div class="wrap s-fast__grid">
        <div>
          <p class="label label--caps label--wine">Eller: ${esc(fast.navn.toLowerCase())}</p>
          <h2 class="display" id="fast-tittel">${esc(f.tittel)}</h2>
          <p class="s-fast__q">${esc(fast.naar)}</p>
          <p class="s-fast__text">${esc(fast.ingress)}</p>
          <div class="s-intro__actions s-fast__actions">
            <a class="pill pill--wine" href="/tjenester/${fast.slug}/">Les mer om fast designer</a>
            <a class="textlink" href="${mailto(site, '', 'Spørsmål om fast designer')}">Spør om et fast samarbeid</a>
          </div>
        </div>
        ${tidslinje(f)}
      </div>
    </section>

    <section class="s-reise" aria-labelledby="reise-tittel">
      <div class="wrap">
        <p class="label label--caps label--blue">${esc(t.reise_etikett)}</p>
        <h2 class="display" id="reise-tittel">${inline(t.reise_tittel)}</h2>
        <ol class="reise" data-draw>
          ${t.reise.map((r, i) => `<li class="reise__step">
            <span class="reise__dot" aria-hidden="true"></span>
            <span class="step__num">0${i + 1}</span>
            <h3 class="step__title">${esc(r.navn)}</h3>
            <p class="step__text">${inline(r.tekst)}</p>
            ${i === 0 ? `<a class="textlink reise__go" href="#kontakt">Til e-postadressen</a>` : ''}
          </li>`).join('')}
        </ol>
      </div>
    </section>

    ${kontakt(ctx, { lead: t.usikker_tekst, tittel: t.kontakt_tittel, undertittel: t.kontakt_undertittel })}`;
  const sti = [{ navn: 'Forside', url: '/' }, { navn: 'Tjenester', url: '/tjenester/' }];
  return layout(ctx, { title: t.seo_tittel, description: t.seo_beskrivelse, path: '/tjenester/', body, bodyClass: 'page-sub page-svc',
    ld: [brodsmuler(ctx.site, sti)], ogImage: ogFor('tjenester'), ogAlt: 'Måter å jobbe sammen på – STØLE' });
};

/* ---------- Tjenester: enkeltpakke ---------- */
export const pakke = (ctx, t, p) => {
  const andre = t.pakker.filter((x) => x.slug !== p.slug);
  const f = ctx.forside.fast;
  const body = `
    <section class="s-pagehero s-pagehero--pakke" aria-labelledby="side-tittel">
      <div class="wrap s-pagehero__grid">
        <div class="s-pagehero__text">
          <nav class="crumbs" aria-label="Brødsmuler"><ol><li><a href="/">Forside</a></li><li><a href="/tjenester/">Tjenester</a></li><li><span aria-current="page">${esc(p.navn)}</span></li></ol></nav>
          <h1 class="display display--hero" id="side-tittel">${esc(p.navn)}. <em>${esc(p.naar)}</em></h1>
          <hr class="rule">
          <p class="s-pagehero__lead">${inline(p.ingress)}</p>
          <div class="s-intro__actions">
            <a class="pill" href="#kontakt">${esc(ctx.site.knapp_meny)}</a>
            <a class="textlink" href="#prosess">Slik foregår det</a>
          </div>
        </div>
        <div class="s-pagehero__art s-pagehero__side">
          <div class="s-pagehero__panel" aria-hidden="true">${edge('panel', 'edge--panel')}</div>
          ${p.nivaa > 0
            ? `${dybdeIkon(p.nivaa, 'dybde--xl dybde--wine')}<p class="s-pagehero__caption"><strong>Omfang:</strong> ${esc(p.dybde)}</p>`
            : `<div class="s-pagehero__tl">${tidslinje(f)}</div>`}
        </div>
      </div>
    </section>

    <section class="s-passer" aria-labelledby="passer-tittel">
      ${edge('sag')}
      <div class="wrap s-passer__grid">
        <h2 class="label label--caps label--blue" id="passer-tittel">${esc(p.passer_tittel)}</h2>
        <ul class="checklist">${(p.passer || []).map((x) => `<li>${inline(x)}</li>`).join('')}</ul>
      </div>
    </section>

    <section class="s-prosess s-prosess--pakke" id="prosess" aria-labelledby="prosess-tittel">
      <div class="s-prosess__body">
        ${edge('peak')}
        <div class="wrap">
          <p class="label">${esc(p.prosess_tittel)}</p>
          <h2 class="display" id="prosess-tittel">${esc(p.prosess_overskrift || 'Forstå behovet bak først. Designe etterpå.')}</h2>
          <ol class="steps steps--${(p.prosess || []).length}">
            ${(p.prosess || []).map((s, i) => `<li class="step">
              <span class="step__num">0${i + 1}</span>
              <h3 class="step__title">${esc(s.navn)}</h3>
              <p class="step__text">${inline(s.tekst)}</p>
            </li>`).join('')}
          </ol>
        </div>
      </div>
    </section>

    <section class="s-leveranse" aria-labelledby="lev-tittel">
      ${edge('double')}
      <div class="wrap s-leveranse__grid">
        <div>
          <h2 class="label label--caps label--blue" id="lev-tittel">${esc(p.leveranser_tittel)}</h2>
          <ul class="tags">${(p.leveranser || []).map((x) => `<li class="tag">${esc(x)}</li>`).join('')}</ul>
        </div>
        <div>
          <h2 class="label label--caps label--blue">${esc(p.forvent_tittel)}</h2>
          <p class="serif-body serif-body--lg">${inline(p.forvent)}</p>
        </div>
      </div>
    </section>

    <section class="s-andre" aria-labelledby="andre-tittel">
      <div class="wrap">
        <h2 class="label label--caps label--blue" id="andre-tittel">Andre måter å jobbe sammen på</h2>
        <ul class="tiers tiers--small">
          ${andre.map((x) => `<li class="tier">
            ${dybdeIkon(x.nivaa)}
            <h3 class="tier__name">${esc(x.navn)}</h3>
            <p class="tier__when">${esc(x.naar)}</p>
            <a class="pill pill--sand" href="/tjenester/${x.slug}/" aria-label="Utforsk: ${esc(x.navn)}">Utforsk</a>
          </li>`).join('')}
        </ul>
      </div>
    </section>

    ${kontakt(ctx, { lead: p.neste })}`;
  const { site } = ctx;
  const sti = [{ navn: 'Forside', url: '/' }, { navn: 'Tjenester', url: '/tjenester/' }, { navn: p.navn, url: `/tjenester/${p.slug}/` }];
  const tjeneste = {
    '@context': 'https://schema.org', '@type': 'Service', name: p.navn, description: p.seo_beskrivelse,
    serviceType: 'Grafisk design og visuell identitet', url: `${site.url}/tjenester/${p.slug}/`,
    provider: { '@type': 'ProfessionalService', '@id': `${site.url}/#virksomhet`, name: site.navn, url: `${site.url}/` },
    areaServed: omrader(site),
  };
  return layout(ctx, { title: p.seo_tittel || `${p.navn} – STØLE`, description: p.seo_beskrivelse, path: `/tjenester/${p.slug}/`, body, bodyClass: 'page-sub',
    ld: [tjeneste, brodsmuler(site, sti)], ogImage: ogFor(p.slug), ogAlt: `${p.navn} – ${p.naar}` });
};

/* ---------- Personvern ---------- */
export const personvern = (ctx, c) => {
  const body = `
    <section class="s-pagehero s-pagehero--short" aria-labelledby="side-tittel">
      <div class="wrap">
        <p class="label label--caps label--blue">${esc(c.etikett)}</p>
        <h1 class="display display--hero" id="side-tittel">${inline(c.tittel)}</h1>
        <p class="s-pagehero__lead">${inline(c.ingress)}</p>
      </div>
    </section>
    <section class="s-tekst" aria-label="Personvernerklæring">
      ${edge('peak')}
      <div class="wrap s-tekst__grid">
        <nav class="toc" aria-label="Innhold på siden"><p class="label">På denne siden</p><ol>${c.seksjoner.map((s, i) => `<li><a href="#del-${i + 1}">${esc(s.tittel)}</a></li>`).join('')}</ol></nav>
        <div class="prose">
          ${c.seksjoner.map((s, i) => `<h2 id="del-${i + 1}">${esc(s.tittel)}</h2>${paras(s.tekst)}`).join('')}
          <p class="prose__updated">Sist oppdatert ${esc(c.oppdatert)}.</p>
        </div>
      </div>
    </section>`;
  return layout(ctx, { title: c.seo_tittel, description: c.seo_beskrivelse, path: '/personvern/', body, bodyClass: 'page-sub page-legal' });
};

/* ---------- 404 ---------- */
export const ikkeFunnet = (ctx) => {
  const body = `
    <section class="s-404" aria-labelledby="side-tittel">
      <div class="wrap s-404__grid">
        <div>
          <p class="label label--caps label--blue">Feil 404</p>
          <h1 class="display display--hero" id="side-tittel">Denne siden finnes ikke. <em>Men du er fortsatt hos STØLE.</em></h1>
          <p class="s-pagehero__lead">Lenken kan være gammel, eller adressen kan ha en skrivefeil.</p>
          <div class="s-intro__actions">
            <a class="pill" href="/">Til forsiden</a>
            <a class="textlink" href="/tjenester/">Se tjenestene</a>
          </div>
        </div>
        <div class="s-404__mark" aria-hidden="true"><img src="/i/mark-split.svg" alt="" width="264" height="496"></div>
      </div>
    </section>`;
  return layout(ctx, { title: 'Siden finnes ikke – STØLE', description: 'Siden du lette etter finnes ikke.', path: '/404.html', body, bodyClass: 'page-sub page-404', noindex: true });
};
