# tegelbit-web

Webbplatsen för [tegelbit.se](https://tegelbit.se). Statisk HTML, CSS och lite JavaScript i `site/`, hostad på GitHub Pages. Inget byggsteg och inga beroenden.

## Struktur

```
site/index.html               Sidan
site/404.html                 Visas av GitHub Pages för sidor som inte finns
site/CNAME                    Talar om för GitHub Pages att domänen är tegelbit.se
site/robots.txt               Tillåter sökmotorer
site/favicon.svg / .ico       Ikon i webbläsarfliken
site/apple-touch-icon.png     Ikon när någon sparar sidan på hemskärmen
site/og-image.png             Förhandsbild när länken delas (1200×630)
site/assets/css/tokens.css    Designsystemets lager 1 + 2: primitiva och semantiska tokens
site/assets/css/site.css      Lager 3: komponenterna, som bara läser semantiska tokens
site/assets/js/bits.js        Partikelnätet i bakgrunden (canvas)
site/assets/fonts/            Geist och Geist Mono, självhostade (licens: OFL.txt)
```

Temat väljs med `data-theme` på `<body>`: `se` (ljust) eller `dev` (mörkt). `site.css` använder bara `var(--color-…)`, så ett temabyte kräver ingen annan ändring.

Sidan har inga cookies, ingen analys och laddar inget från tredje part, så den behöver ingen cookie-banner.

## Testa lokalt

```
cd site && python3 -m http.server 8000
```

Öppna http://localhost:8000. Sidan använder absoluta sökvägar (`/assets/...`), så den behöver en server.

## Uppdatera sidan

Ändra filerna i `site/`, committa och pusha till `main`. GitHub Actions publicerar till Pages och ändringen syns efter ungefär en minut.

Workflowen kan också köras manuellt under **Actions → Deploy → Run workflow**.

## Domän

- `site/CNAME` innehåller `tegelbit.se`. Ta inte bort den, då tappar Pages domänen.
- DNS ligger i Route 53 (zonen `tegelbit.se`):
  - `tegelbit.se` A → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - `tegelbit.se` AAAA → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
  - `www.tegelbit.se` CNAME → `markusbroden.github.io`
- Domänen är verifierad för kontot under GitHub → Settings → Pages, så ingen annan kan ta den.
- HTTPS-certifikatet utfärdas och förnyas automatiskt av GitHub.

## Säkerhet

Repot är publikt. Lägg inget här som inte får synas på sajten: inga nycklar, `.env`-filer eller utkast. Secret scanning och push protection är påslagna.
