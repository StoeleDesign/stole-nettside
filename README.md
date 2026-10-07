# STØLE – nettside

Nettsiden til STØLE (støle.com). Bygget fra Figma-designet, uten rammeverk og uten npm-pakker.

## Endre tekst

Logg inn på **https://app.pagescms.org** med GitHub-kontoen din og velg dette prosjektet. Der finner du:

- **Forside** – all tekst på forsiden
- **Tjenester og pakker** – tjenestesiden og hver pakke (Friskt pust, Grunnmuren, Total, Fast designer)
- **Kontaktinfo og meny** – e-post, org.nr., adresse, menyen og kontaktfeltet
- **Personvern** – personvernerklæringen

Trykk **Save**. GitHub bygger og publiserer siden automatisk (fanen **Actions** i repoet), og endringen er ute etter et par minutter.

Små formateringsregler:
- `*slik*` rundt ord gir kursiv aksentfarge (f.eks. i «Personen bak»).
- En tom linje gir nytt avsnitt.

## Struktur

| Mappe / fil | Hva |
|---|---|
| `content/` | All tekst (JSON). Det er dette redigeringspanelet endrer. |
| `templates/pages.mjs` | HTML-malene for alle sider |
| `src/css/main.css` | Designsystemet (farger, skrift, avstander, kanter) |
| `src/js/main.js` | Meny, smart topptekst, kopier-knapper |
| `src/i/` | Logo, merke, ikoner og illustrasjoner (SVG fra Figma) |
| `src/img/` | Bilder i AVIF/WebP/JPG |
| `src/fonts/` | Newsreader og Schibsted Grotesk (lokalt, ingen Google-kall) |
| `public/` | Favicon, `CNAME` (domenet for GitHub Pages) |
| `build.mjs` | Bygger alt til `dist/` |
| `serve.mjs` | Forhåndsvisning på egen maskin |
| `.pages.yml` | Oppsett for redigeringspanelet |
| `.github/workflows/pages.yml` | Bygger og publiserer til GitHub Pages |

## Kjøre lokalt

Krever Node 18 eller nyere.

```
node build.mjs
node serve.mjs
```

Åpne http://localhost:5173.

## Personvern og cookies

Siden bruker ingen informasjonskapsler, ingen analyse og ingen tredjepartstjenester. Legger du til noe slikt senere (f.eks. Google Analytics, kart eller video), må personvernerklæringen oppdateres, og du må vurdere om det trengs samtykke etter ekomloven § 3-15.

## Publisering

Siden ligger på GitHub Pages. Hver endring på `main` bygges og publiseres automatisk, uten begrensning på antall publiseringer.

DNS hos Uniweb for `xn--stle-hra.com` (støle.com):

| Type | Navn | Verdi |
|---|---|---|
| A | (tomt) | 185.199.108.153 |
| A | (tomt) | 185.199.109.153 |
| A | (tomt) | 185.199.110.153 |
| A | (tomt) | 185.199.111.153 |
| CNAME | www | stoeledesign.github.io |

E-postoppføringene (MX, SPF og DMARC) og Google-verifiseringen skal stå urørt.

Sikkerhet: GitHub Pages kan ikke sette egne HTTP-overskrifter, så innholdssikkerhet (CSP) og referrer-regler ligger som `<meta>` i hver side, og `main.js` hindrer at siden vises inni andre sider.
