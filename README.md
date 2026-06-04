# @wpkurzus/lead-form

Beágyazható, témázható **lead-capture form** — egyetlen *single source of truth*,
amit több rendszer (WordPress, statikus HTML, React/Vite/Next) is be tud emelni.
Egy javítás itt → egy verziókiadás → mindenhol biztonságosan, könnyen frissül.

A formba bele van fejlesztve minden „okos" megoldás:

- ✉️ **Okos email-validáció** magyar hibaüzenetekkel
- 🔤 **Elgépelés-javító** (pl. `gmial.com → gmail.com`)
- ⬇️ **Domain autocomplete** dropdown (billentyűzet-támogatással)
- ✅ **GDPR consent** (nyilatkozat + halvány lábjegyzet)
- 🐝 **Honeypot** spam-szűrés, 15 mp timeout, loading állapot, dupla-beküldés védelem
- 📊 **GTM `lead` event** push (deduplikációval)
- 🎨 **Témázható** CSS-változókkal (`--lf-*`), `dark` / `light` téma
- 🔒 **Biztonságos backend**: a tageket a szerver registry oldja fel — a kliens nem küldhet taget

---

## Architektúra

```
                        ┌─────────────────────────────┐
  WordPress  ──┐        │  wpkurzus-lead-form (repo)   │
  Statikus HTML├─embed──┤  = SINGLE SOURCE OF TRUTH    │
  React/Vite  ─┘        │  src/ → dist/ (CDN + npm)    │
                        └──────────────┬──────────────┘
                                       │ POST { email, funnel_slug }
                                       ▼
                        ┌─────────────────────────────┐
                        │  api/subscribe.php (központi)│
                        │  funnels.json → list + TAGEK │
                        │  (a kliens NEM küld taget)   │
                        └──────────────┬──────────────┘
                                       ▼  ActiveCampaign
```

---

## Telepítés / beágyazás

### 1) WordPress vagy statikus HTML — CDN embed

Tedd be az üres mount-divet, és töltsd be a scriptet egyszer:

```html
<div
  data-lead-form
  data-api="https://api.vikingodev.hu/lead/v1/subscribe.php"
  data-funnel="50-kerdes-webdesign"
  data-form-title="Töltsd le ingyen!"
  data-cta="Letöltöm"
  data-theme="dark"
  data-tracking='{"funnel_id":"50-kerdes-webdesign","funnel_name":"50 kérdés webdesign","lead_source":"lead-magnet","lead_type":"munkafuzet"}'
></div>

<script
  src="https://cdn.jsdelivr.net/gh/vikingokft/wpkurzus-lead-form@1/dist/lead-form.min.js"
  crossorigin="anonymous"></script>
```

> A `@1` azt jelenti: mindig a legújabb **1.x** verzió (nem-törő frissítéseket
> automatikusan megkapod). Fix verzióhoz: `@1.0.0`. Lásd [Frissítés](#frissítés).

### 2) Build-alapú JS projekt (React / Vite / Next) — npm

```bash
npm install @wpkurzus/lead-form
```

```jsx
import { useEffect, useRef } from "react";
import { LeadForm } from "@wpkurzus/lead-form";
import "@wpkurzus/lead-form/styles";

export function Optin() {
  const ref = useRef(null);
  useEffect(() => {
    LeadForm.init(ref.current, {
      api: "https://api.vikingodev.hu/lead/v1/subscribe.php",
      funnel: "50-kerdes-webdesign",
      tracking: { funnel_id: "50-kerdes-webdesign", funnel_name: "50 kérdés webdesign", lead_source: "lead-magnet", lead_type: "munkafuzet" },
    });
  }, []);
  return <div ref={ref} />;
}
```

Lásd még az [`examples/`](examples/) mappát.

---

## Konfiguráció

| `data-*` attribútum | JS opció | Kötelező | Leírás |
|---|---|:---:|---|
| `data-api` | `api` | ✅ | A központi `subscribe.php` URL-je |
| `data-funnel` | `funnel` | ✅ | Funnel slug (a szerver `funnels.json` kulcsa) |
| `data-cta` | `cta` | | CTA gomb szövege |
| `data-form-title` | `formTitle` | | Cím az email mező felett |
| `data-placeholder` | `placeholder` | | Input placeholder (alap: „E-mail cím") |
| `data-theme` | `theme` | | `dark` (alap) vagy `light` |
| `data-gdpr-html` | `gdprHtml` | | GDPR consent szöveg felülírása (HTML) |
| `data-note-html` | `noteHtml` | | Lábjegyzet felülírása (üres = elrejtés) |
| `data-tracking` | `tracking` | | GTM lead event mezők (JSON) |
| `data-messages` | `messages` | | Hibaüzenetek felülírása (JSON) |
| `data-redirect="false"` | `redirect: false` | | Ne irányítson át, csak siker-üzenet |
| — | `onSuccess(data, email)` | | Callback sikeres beküldésnél (csak JS) |
| — | `onError(message)` | | Callback hibánál (csak JS) |

### Témázás

A host oldalon felülírhatod a CSS-változókat — nincs fork, nincs kódmásolás:

```css
.lf-root {
  --lf-primary: #F56F46;
  --lf-primary-hover: #EA5624;
  --lf-surface-dark: #25273E;
  --lf-radius-lg: 0.625rem;
}
```

---

## Backend telepítés (központi, egyszer)

A `api/` mappa egy hordozható PHP végpont (curl-t használ). A **központi deploy
a `api.vikingodev.hu` aldoménre** kerül, verziózott útvonalon — így minden oldal
(wpkurzus.hu, vikingo.hu, jövőbeli) ugyanazt az egy API-t hívja.

Ajánlott elrendezés a szerveren:

```
(web root FÖLÖTT)
├── lf-config.php             ← AC kulcsok (ha NEM env-változót használsz)
└── funnels.json              ← registry (opcionálisan ide, LF_REGISTRY_PATH-szal)

web root (api.vikingodev.hu/)
└── lead/
    └── v1/
        ├── subscribe.php     ← https://api.vikingodev.hu/lead/v1/subscribe.php
        ├── .htaccess         ← hardening: csak a subscribe.php hívható HTTP-n
        └── funnels.json      ← registry (ha nem a web root fölött van)
```

1. **Másold fel** a `api/subscribe.php`-t és a `api/.htaccess`-t a `lead/v1/` mappába.
2. **Config** — válassz (lásd [Biztonság](#biztonság)):
   - **(ajánlott)** állítsd be env-változóként az `AC_API_URL`, `AC_API_KEY`, `AC_ENV`,
     `LF_GLOBAL_ORIGINS` értékeket → semmilyen kulcs nem kerül fájlba;
   - **vagy** `api/config.example.php` → `lf-config.php` a **web root fölé**.
3. **Registry**: `api/funnels.example.json` → `funnels.json`, vedd fel a funneleket.

Egyik titkos fájl sem commitolódik (lásd `.gitignore`).

> **Verziózott út:** a végpont a `/lead/v1/` alatt él. Ha valaha törő változás
> kell a backendben, a `/lead/v2/` mehet párhuzamosan, a régi kliensek nem törnek el.

### Biztonság

Több, egymásra épülő réteg védi a titkokat (defense-in-depth):

1. **Kulcsok tárolása — env-változó az elsődleges.** A `subscribe.php` ebben a
   sorrendben keresi a configot: **(1) környezeti változók** → **(2) `lf-config.php`
   a web root fölött** → **(3) `config.php` a végpont mellett (csak fejlesztéshez)**.
   Élesben az env-változó az ajánlott: így a kulcs *egyetlen fájlban sincs* a deploy
   alatt. A „PHP fájlban tárolt kulcs" csak akkor kockázatos, ha a web rootban van —
   a web root **fölött** lévő `.php` HTTP-n elérhetetlen és közvetlen hívásra sem ad
   ki semmit, de az env-változó ennél is tisztább.
2. **`.htaccess` hardening.** A mellékelt `api/.htaccess` letilt **minden** direkt
   HTTP-hozzáférést a `subscribe.php`-n kívül — így a `funnels.json`, `config.php`,
   `.example` és dokumentációs fájlok böngészőből nem érhetők el. (A PHP szerver
   oldalon olvassa őket, azt ez nem érinti.)
3. **A registry web root fölé tehető** — `LF_REGISTRY_PATH` env/define-nal.
4. **Beépített védelmek a kódban**: CSRF/Origin allowlist, CORS preflight, fájl-alapú
   rate limiting (5 kérés/perc/IP), 10KB payload limit, SSL verifikáció (peer+host),
   és a tagek kizárólag szerver oldali feloldása (a kliens sosem küld taget).

> **nginx tárhely?** A `.htaccess` csak Apache alatt érvényesül. nginx esetén tedd a
> `funnels.json`-t és a configot a web root fölé (vagy a `server` blokkba:
> `location ~ /lead/v1/(funnels\.json|config\.php) { deny all; }`).

### Új form / új tag felvétele

A tageket **mindig a registryben** határozod meg, funnelenként külön — a kliens
sosem küld taget (így nem lehet vele visszaélni). Új formhoz egyszerűen adj egy
bejegyzést a `funnels.json`-hoz:

```jsonc
{
  "uj-funnel-slug": {
    "activecampaign": {
      "production": { "list_id": 1, "tags": ["LM: UJ-FUNNEL", "FORRAS: kampany-x"] },
      "sandbox":    { "list_id": 3, "tags": ["LM: UJ-FUNNEL"] }
    },
    "redirect_url": "https://valamelyik-domain.hu/koszonjuk/",
    "allowed_origins": ["https://valamelyik-domain.hu"]
  }
}
```

Az embed oldalán csak a `data-funnel="uj-funnel-slug"`-ot kell megadni.

> **Cross-domain beágyazás:** ha a form egy másik domainen fut, az adott origint
> tedd be a `LF_GLOBAL_ORIGINS`-ba (a böngésző preflight kérése miatt) **és** a
> funnel `allowed_origins`-ába.

---

## Frissítés

A repó a *single source of truth*. A frissítési folyamat:

1. Javítás / új funkció → commit ide.
2. `npm version patch|minor|major` → frissül a `package.json` és git tag jön létre.
3. `git push --follow-tags` → a **jsDelivr CDN** automatikusan kiszolgálja az új taget.
4. **CDN-fogyasztók**: `@1`-re pinnelve a nem-törő frissítést automatikusan kapják.
   Maximális biztonsághoz használj fix verziót + **SRI** hash-t:
   ```html
   <script
     src="https://cdn.jsdelivr.net/gh/vikingokft/wpkurzus-lead-form@1.0.0/dist/lead-form.min.js"
     integrity="sha384-…"  crossorigin="anonymous"></script>
   ```
   Az SRI hash kiszámítása egy kiadott fájlra:
   ```bash
   curl -s https://cdn.jsdelivr.net/gh/vikingokft/wpkurzus-lead-form@1.0.0/dist/lead-form.min.js \
     | openssl dgst -sha384 -binary | openssl base64 -A
   ```
5. **npm-fogyasztók**: `npm update @wpkurzus/lead-form`.

A változásokat lásd a [CHANGELOG.md](CHANGELOG.md)-ben.

---

## Fejlesztés

```bash
npm install        # esbuild telepítése
npm run build      # dist/ generálás (IIFE + ESM + CSS)
npm run dev        # figyelő mód
```

Forrás: [`src/widget/`](src/widget/) (JS modulok) és [`src/styles/`](src/styles/) (CSS).
A `dist/` **commitolva van**, mert a CDN onnan szolgál ki.
