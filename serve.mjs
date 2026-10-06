// Forhåndsvisning på egen maskin: `node serve.mjs`, åpne http://localhost:5173
// Ingen avhengigheter. Viser den ferdigbygde siden i /dist. Kun tilgjengelig fra denne maskinen.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const port = Number(process.env.PORT) || 5173;

const notFound = (res) => {
  res.writeHead(404, { 'Content-Type': types['.html'] });
  res.end(fs.readFileSync(path.join(dist, '404.html')));
};

http.createServer((req, res) => {
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch { res.writeHead(400).end(); return; }
  let p;
  try { p = decodeURIComponent(url.pathname); } catch { res.writeHead(400).end(); return; }
  const file = path.join(dist, p);
  // Bare filer inne i dist/ (også ikke søstermapper som «dist-gammel»)
  if (file !== dist && !file.startsWith(dist + path.sep)) { res.writeHead(403).end(); return; }

  let stat = fs.existsSync(file) ? fs.statSync(file) : null;
  if (stat && stat.isDirectory()) {
    // Mappe uten skråstrek: send videre til adressen med skråstrek, slik Netlify gjør
    if (!p.endsWith('/')) { res.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end(); return; }
    const index = path.join(file, 'index.html');
    if (!fs.existsSync(index)) { notFound(res); return; }
    res.writeHead(200, { 'Content-Type': types['.html'] });
    fs.createReadStream(index).pipe(res);
    return;
  }
  if (!stat) { notFound(res); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`STØLE kjører på http://localhost:${port}`));
