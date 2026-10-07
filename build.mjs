// Bygger nettsiden til STØLE.
// Ingen avhengigheter: kjører med ren Node (v18+), både lokalt og på Netlify.
// Innholdet ligger i /content (redigeres i Pages CMS), malene i /templates.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import * as T from './templates/pages.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, 'content', f), 'utf8'));

const site = read('site.json');
const forside = read('forside.json');
const tjenester = read('tjenester.json');
const personvern = read('personvern.json');

// Adressen til en pakke lages fra navnet hvis den mangler (æ/ø/å blir ae/o/a)
const slugify = (s) => String(s).toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
for (const p of tjenester.pakker) p.slug = p.slug ? slugify(p.slug) : slugify(p.navn);
const slugs = tjenester.pakker.map((p) => p.slug);
if (new Set(slugs).size !== slugs.length) throw new Error(`To pakker har samme adresse: ${slugs.join(', ')}`);
if (!tjenester.pakker.some((p) => p.nivaa === 0)) console.warn('Advarsel: ingen pakke har dybde 0 (fast designer).');

// Rydd og kopier statiske filer
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const copyDir = (from, to) => {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
};
for (const d of ['fonts', 'img', 'i', 'css', 'js']) copyDir(path.join(root, 'src', d), path.join(out, d));
copyDir(path.join(root, 'public'), out);
copyDir(path.join(root, 'uploads'), path.join(out, 'uploads'));

// Cache-busting: legg en kort hash i filnavnet til fonter, CSS og JS
const hashed = {};
const hashOf = (buf) => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
for (const f of fs.readdirSync(path.join(out, 'fonts'))) {
  const nf = f.replace(/(\.\w+)$/, `.${hashOf(fs.readFileSync(path.join(out, 'fonts', f)))}$1`);
  fs.renameSync(path.join(out, 'fonts', f), path.join(out, 'fonts', nf));
  hashed[`fonts/${f}`] = `/fonts/${nf}`;
}
{
  const cssFile = path.join(out, 'css/main.css');
  let css = fs.readFileSync(cssFile, 'utf8');
  for (const [k, v] of Object.entries(hashed)) css = css.split(`/${k}`).join(v);
  fs.writeFileSync(cssFile, css);
}
for (const f of ['css/main.css', 'js/main.js']) {
  const buf = fs.readFileSync(path.join(out, f));
  const h = hashOf(buf);
  const nf = f.replace(/(\.\w+)$/, `.${h}$1`);
  fs.renameSync(path.join(out, f), path.join(out, nf));
  hashed[f] = '/' + nf;
}

const ctx = { site, hashed, tjenester, forside };
const pages = [];
const write = (url, html, opts = {}) => {
  const file = url.endsWith('/') ? path.join(out, url, 'index.html') : path.join(out, url);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (!opts.noindex) pages.push({ url, kilder: opts.kilder || [] });
};

// Siste endring for sitemap: dato for siste commit som rørte innholdet eller malene (ellers i dag)
const today = new Date().toISOString().slice(0, 10);
const lastmod = (filer) => {
  try {
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...filer, 'templates', 'src/css'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : today;
  } catch { return today; }
};

const felles = ['content/site.json'];
write('/', T.forside(ctx, forside), { kilder: [...felles, 'content/forside.json'] });
write('/tjenester/', T.tjenesteoversikt(ctx, tjenester), { kilder: [...felles, 'content/tjenester.json', 'content/forside.json'] });
for (const p of tjenester.pakker) write(`/tjenester/${p.slug}/`, T.pakke(ctx, tjenester, p), { kilder: [...felles, 'content/tjenester.json'] });
write('/personvern/', T.personvern(ctx, personvern), { kilder: [...felles, 'content/personvern.json'] });
write('/404.html', T.ikkeFunnet(ctx), { noindex: true });

// Sitemap og robots
fs.writeFileSync(path.join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages.map((u) => `  <url><loc>${site.url}${u.url}</loc><lastmod>${lastmod(u.kilder)}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`);
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

// llms.txt: kort, offentlig oppsummering for KI-assistenter (lenkes ikke fra sidene). Tekst i content/ki.json.
if (fs.existsSync(path.join(root, 'content', 'ki.json'))) {
  const ki = read('ki.json');
  const liste = (xs = []) => xs.filter(Boolean).map((x) => `- ${String(x).trim()}`).join('\n');
  const deler = [
    `# ${site.navn}`,
    ki.sammendrag && `> ${String(ki.sammendrag).replace(/\s*\n\s*/g, ' ').trim()}`,
    ki.passer_for?.length && `## Hvem ${site.navn} passer for\n\n${liste(ki.passer_for)}`,
    ki.slik_jobber?.length && `## Slik jobber ${site.navn}\n\n${liste(ki.slik_jobber)}`,
    `## Tjenester\n\n${liste([
      ...tjenester.pakker.map((p) => `[${p.navn}](${site.url}/tjenester/${p.slug}/): ${p.seo_beskrivelse}`),
      `[Alle tjenester](${site.url}/tjenester/): ${tjenester.seo_beskrivelse}`,
    ])}`,
    `## Kontakt\n\n${liste([
      `E-post: ${site.epost} (${site.epost_teknisk})`,
      `Nettside: https://${site.visningsdomene}/ (${site.url}/)`,
      site.instagram && `Instagram: https://www.instagram.com/${site.instagram}/`,
      `Virksomhet: ${site.virksomhet} (${site.foretaksform}), org.nr. ${site.orgnr}, ${site.adresse}`,
    ])}`,
  ];
  fs.writeFileSync(path.join(out, 'llms.txt'), deler.filter(Boolean).join('\n\n') + '\n');
}

console.log(`Bygget ${pages.length + 1} sider til dist/`);
