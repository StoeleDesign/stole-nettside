// Bygger nettsiden til STØLE.
// Ingen avhengigheter: kjører med ren Node (v18+), både lokalt og på Netlify.
// Innholdet ligger i /content (redigeres i Pages CMS), malene i /templates.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as T from './templates/pages.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, 'content', f), 'utf8'));

const site = read('site.json');
const forside = read('forside.json');
const tjenester = read('tjenester.json');
const personvern = read('personvern.json');

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

// Cache-busting: legg en kort hash av CSS/JS i filnavnet
const hashed = {};
for (const f of ['css/main.css', 'js/main.js']) {
  const buf = fs.readFileSync(path.join(out, f));
  const h = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const nf = f.replace(/(\.\w+)$/, `.${h}$1`);
  fs.renameSync(path.join(out, f), path.join(out, nf));
  hashed[f] = '/' + nf;
}

const ctx = { site, hashed, tjenester };
const pages = [];
const write = (url, html, opts = {}) => {
  const file = url.endsWith('/') ? path.join(out, url, 'index.html') : path.join(out, url);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (!opts.noindex) pages.push(url);
};

write('/', T.forside(ctx, forside));
write('/tjenester/', T.tjenesteoversikt(ctx, tjenester));
for (const p of tjenester.pakker) write(`/tjenester/${p.slug}/`, T.pakke(ctx, tjenester, p));
write('/personvern/', T.personvern(ctx, personvern));
write('/404.html', T.ikkeFunnet(ctx), { noindex: true });

// Sitemap og robots
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages.map((u) => `  <url><loc>${site.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`);
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`Bygget ${pages.length + 1} sider til dist/`);
