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
  data-api="https://wpkurzus.hu/ingyenes/api/subscribe.php"
  data-funnel="50-kerdes-webdesign"
  data-form-title="Töltsd le ingyen!"
  data-cta="Letöltöm"
  data-theme="dark"
  data-tracking='{"funnel_id":"50-kerdes-webdesign","funnel_name":"50 kérdés webdesign","lead_source":"lead-magnet","lead_type":"munkafuzet"}'
></div>

<script
  src="https://cdn.jsdelivr.net/gh/wpviking/wpkurzus-lead-form@1/dist/lead-form.min.js"
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
      api: "https://wpkurzus.hu/ingyenes/api/subscribe.php",
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

A `api/` mappa egy hordozható PHP végpont. A `wpkurzus.hu` szerverén:

1. **Másold fel** a `api/subscribe.php`-t (pl. `/ingyenes/api/subscribe.php`).
2. **Config**: `api/config.example.php` → `config.php` (vagy a web root fölé `lf-config.php`),
   töltsd ki az AC kulcsokkal és a `LF_GLOBAL_ORIGINS`-t.
3. **Registry**: `api/funnels.example.json` → `funnels.json`, vedd fel a funneleket.

Egyik titkos fájl sem commitolódik (lásd `.gitignore`).

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
     src="https://cdn.jsdelivr.net/gh/wpviking/wpkurzus-lead-form@1.0.0/dist/lead-form.min.js"
     integrity="sha384-…"  crossorigin="anonymous"></script>
   ```
   Az SRI hash kiszámítása egy kiadott fájlra:
   ```bash
   curl -s https://cdn.jsdelivr.net/gh/wpviking/wpkurzus-lead-form@1.0.0/dist/lead-form.min.js \
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
