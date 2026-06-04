# @wpkurzus/lead-form

Beágyazható, témázható **lead-capture form** — egyetlen *single source of truth*,
amit több rendszer (WordPress, statikus HTML, React/Vite/Next) is be tud emelni.
Egy javítás itt → egy verziókiadás → mindenhol biztonságosan, könnyen frissül.

**A beemeléshez csak két dolgot kell megadni:** a **tag**-et és a **köszönő oldalt**.
Az API végpont be van égetve a widgetbe.

A formba bele van fejlesztve minden „okos" megoldás:

- ✉️ **Okos email-validáció** magyar hibaüzenetekkel
- 🔤 **Elgépelés-javító** (pl. `gmial.com → gmail.com`)
- ⬇️ **Domain autocomplete** dropdown (billentyűzet-támogatással)
- ✅ **GDPR consent** (nyilatkozat + halvány lábjegyzet)
- 🐝 **Honeypot** spam-szűrés, 15 mp timeout, loading állapot, dupla-beküldés védelem
- 📊 **GTM `lead` event** push (deduplikációval)
- 🎨 **Témázható** CSS-változókkal (`--lf-*`), `dark` / `light` téma

---

## Beemelés egy oldalra

```html
<div data-lead-form
     data-tag="LM: MILYEN-VALLALKOZAST-INDITS"
     data-redirect="https://wpkurzus.hu/ingyenes/milyen-vallalkozast-indits/koszi/"></div>
<script src="https://cdn.jsdelivr.net/gh/vikingokft/wpkurzus-lead-form@2/dist/lead-form.min.js"
        crossorigin="anonymous"></script>
```

- **`data-tag`** (kötelező) — ezt az AC taget kapja a feliratkozó.
- **`data-redirect`** (kötelező) — ide visz a beküldés után (köszönő oldal).
- Ha bármelyik hiányzik, a widget **látható hibát** ír ki a helyén (hogy ne felejtsd el).

> A `@2` mindig a legújabb **2.x** verziót adja. Fix verzióhoz: `@2.0.0` + SRI hash
> (lásd [Frissítés](#frissítés)).

### React / Vite / Next (npm)

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
      tag: "LM: MILYEN-VALLALKOZAST-INDITS",
      redirect: "https://wpkurzus.hu/ingyenes/milyen-vallalkozast-indits/koszi/",
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
| `data-tag` | `tag` | ✅ | Az AC tag, amit a feliratkozó kap (engedélyezett prefix, pl. `LM:`) |
| `data-redirect` | `redirect` | ✅ | Köszönő oldal URL-je (csak engedélyezett domainre mutathat) |
| `data-api` | `api` | | Felülírja a beégetett API végpontot |
| `data-cta` | `cta` | | CTA gomb szövege |
| `data-form-title` | `formTitle` | | Cím az email mező felett |
| `data-placeholder` | `placeholder` | | Input placeholder (alap: „E-mail cím") |
| `data-theme` | `theme` | | `dark` (alap) vagy `light` |
| `data-gdpr-html` | `gdprHtml` | | GDPR consent szöveg felülírása (HTML) |
| `data-note-html` | `noteHtml` | | Lábjegyzet felülírása (üres = elrejtés) |
| `data-tracking` | `tracking` | | GTM lead event mezők (JSON) |
| `data-messages` | `messages` | | Hibaüzenetek felülírása (JSON) |
| — | `noRedirect: true` | | Ne navigáljon a redirectre (SPA — `onSuccess` kezeli) |
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

## Backend (egy fájl, egyszer)

Az `api/subscribe.php` az egyetlen szerver oldali komponens — kell, mert az AC
API-kulcs nem kerülhet böngészőbe. **Nincs registry, nincs admin**: a beágyazás
adja a `tag`-et és a `redirect`-et, a **lista állandó** (a configból).

Ajánlott elrendezés a `api.vikingodev.hu`-n:

```
(web root FÖLÖTT)
└── lf-config.php           ← AC kulcs + állandó lista + engedélyezett originek

web root (api.vikingodev.hu/)
└── lead/v1/
    ├── subscribe.php       ← https://api.vikingodev.hu/lead/v1/subscribe.php
    └── .htaccess           ← csak a subscribe.php hívható HTTP-n
```

1. **Másold fel** a `api/subscribe.php`-t és a `api/.htaccess`-t a `lead/v1/`-be.
2. **Config**: env-változók **vagy** `api/config.example.php` → `lf-config.php` a
   web root fölé. Töltsd ki: `AC_API_URL`, `AC_API_KEY`, `AC_ENV`, `LF_LIST_ID`,
   `LF_SANDBOX_LIST_ID`, `LF_GLOBAL_ORIGINS`, `LF_TAG_PREFIXES`.

A titkos fájlok nem commitolódnak (lásd `.gitignore`).

### Új lead form létrehozása

1. Találj ki egy taget a konvenció szerint: `LM: VALAMI-SLUG`.
2. Tedd be a beágyazó kódot az oldalra a `data-tag` + `data-redirect` értékekkel.
3. Kész — az AC automációt a tag indítja (ahogy eddig is).

> **Új domain?** Vedd fel a `LF_GLOBAL_ORIGINS`-ba (a form ott fut + a redirect oda mutat).

---

## Biztonság

Mivel a `tag` és a `redirect` a beágyazásban van, több réteg véd a visszaélés ellen:

1. **Origin/Referer allowlist** — csak a `LF_GLOBAL_ORIGINS` domainekről fogad kérést.
2. **Tag-prefix korlát** (`LF_TAG_PREFIXES`, alap `LM:`) + karakterkészlet + max hossz
   — egy hamisított kérés sem tud *tetszőleges, érzékeny* taget rárakni, csak
   lead-magnet jellegűt.
3. **Redirect host-ellenőrzés** — a redirect csak engedélyezett domainre mutathat
   (nincs open-redirect / phishing).
4. **Rate limiting** (5 kérés/perc/IP), **honeypot**, **10KB payload limit**,
   **SSL verifikáció**, szerveroldali email-validáció.
5. A **lista állandó** (configból) — a kliens nem választhat listát.

**Erősen ajánlott (ActiveCampaign-ben):** kapcsold be a **dupla opt-in**-t a listán
/ automáción. Ez a legnagyobb védelem — egy hamisított vagy spam feliratkozás nem
válik valódi kontaktté, amíg a címzett nem kattint a megerősítő emailre.

**Opcionális, később:** láthatatlan CAPTCHA (Cloudflare Turnstile) botok ellen,
illetve HMAC-kel aláírt `tag`+`redirect` („strict mode"), ha valahol maximális
védelem kell.

---

## Frissítés

A repó a *single source of truth*. A frissítési folyamat:

1. Javítás / új funkció → commit ide.
2. `npm version patch|minor|major` → frissül a `package.json` és git tag jön létre.
3. `git push && git push --tags` → a **jsDelivr CDN** automatikusan kiszolgálja.
4. **CDN-fogyasztók**: `@2`-re pinnelve a nem-törő frissítést automatikusan kapják.
   Maximális biztonsághoz fix verzió + **SRI** hash:
   ```bash
   curl -s https://cdn.jsdelivr.net/gh/vikingokft/wpkurzus-lead-form@2.0.0/dist/lead-form.min.js \
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
