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
| `data-form-title` | `formTitle` | | Cím az email mező felett (alap: „Töltsd le ingyen, és iratkozz fel hírlevelünkre!"; `""` = elrejti) |
| `data-turnstile-sitekey` | `turnstileSitekey` | | Cloudflare Turnstile **site key** — botvédelem bekapcsolása (alapból **KI**) |
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

Élő példány: **`https://api.vikingodev.hu/lead/v1/subscribe.php`** — ide POST-ol a widget.

### Telepítés

1. **Másold fel** a `api/subscribe.php`-t és a `api/.htaccess`-t a `lead/v1/`-be.
2. **Hozd létre a configot** (lásd lent: hová, milyen néven, mit tartalmazzon).

### Hol és milyen néven legyen a config (FONTOS)

A `subscribe.php` ebben a sorrendben keresi a configot:

1. **Env-változók** (`AC_API_URL`, `AC_API_KEY`, …) — ha vannak, **ezek nyernek** (a fájlt ekkor nem is olvassa).
2. **`lf-config.php` a SZÜLŐ mappákban** (a végpont fölött, akár a web root fölött).
3. **`config.php` UGYANABBAN a mappában**, mint a `subscribe.php` (fallback).

Ebből két ajánlott elrendezés:

**A) Web root fölött — legbiztonságosabb (ajánlott):**
```
(web root FÖLÖTT)
└── lf-config.php           ← AC fiók(ok) + listák + originek
web root (api.vikingodev.hu/)
└── lead/v1/
    ├── subscribe.php       ← https://api.vikingodev.hu/lead/v1/subscribe.php
    └── .htaccess           ← csak a subscribe.php hívható HTTP-n
```

**B) A végpont mellett — kényelmes (egy mappában minden):**
```
web root (api.vikingodev.hu/)
└── lead/v1/
    ├── subscribe.php
    ├── config.php          ← a név KÖTELEZŐEN config.php (lf-config.php-t itt NEM találja meg!)
    └── .htaccess           ← a config.php-t is letiltja HTTP-n (csak a subscribe.php hívható)
```

> ⚠️ A **B)** csak **Apache + működő `.htaccess`** mellett biztonságos (a `config.php` kívülről 403-at ad).
> Ha a tárhely **nginx**-et használ, a `.htaccess` nem érvényesül → a `config.php` kiszivároghat;
> ilyenkor az **A)** (web root fölé) kötelező.

### A config tartalma — production/sandbox kapcsolóval

Sablon: [`api/config.example.php`](api/config.example.php). **Mindkét környezet** (éles + teszt) adata
egyszerre benne van, és **egyetlen sor** (`AC_ENV`) váltja, melyik aktív — **a `subscribe.php`-t nem
kell módosítani** (a konfig-fájl állítja be az aktív fiók URL+kulcsát):

```php
define('AC_ENV', 'production');   // 'production' vagy 'sandbox' — EZT az egy sort váltod

$LF_ENVS = [
    'production' => ['url' => 'https://eles-fiok.api-us1.com',  'key' => '…', 'list' => 1],
    'sandbox'    => ['url' => 'https://teszt-fiok.api-us1.com', 'key' => '…', 'list' => 3],
];

// a subscribe.php ezeket a konstansokat várja — az aktív környezetből feloldva:
$__lf = $LF_ENVS[AC_ENV] ?? $LF_ENVS['production'];
define('AC_API_URL', $__lf['url']);
define('AC_API_KEY', $__lf['key']);
define('LF_LIST_ID',         $LF_ENVS['production']['list']);
define('LF_SANDBOX_LIST_ID', $LF_ENVS['sandbox']['list']);
// + LF_GLOBAL_ORIGINS, LF_TAG_PREFIXES (lásd a sablont)
```

- **Külön AC-fiók** sandboxra és productionre → más `url`+`key` a két ágban (az `url` és a `key`
  mindig **egy fiókból** való legyen, különben az AC 401-et ad → 502-es hiba).
- **Egy fiók, két lista** → ugyanaz az `url`+`key` mindkét ágban, csak a `list` tér el.
- **Váltás teszteléskor**: csak az `AC_ENV` sort írod át (`'sandbox'` ↔ `'production'`), mented — kész.
- **Turnstile alapból KI** — ne definiáld a `LF_TURNSTILE_SECRET`-et (lásd a [Turnstile](#cloudflare-turnstile-botvédelem--alapból-kikapcsolva) szekciót).

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
2. **Redirect host-ellenőrzés** — a redirect csak engedélyezett domainre mutathat
   (nincs open-redirect / phishing).
3. **Tag-validáció** — karakterkészlet + max 64 karakter. Opcionálisan szigorítható
   prefix-korláttal (`LF_TAG_PREFIXES`, pl. `['LM:']`) — alapból nincs prefix-megkötés.
4. **Cloudflare Turnstile** (botvédelem) — lásd lent.
5. **Rate limiting** (5 kérés/perc/IP), **honeypot**, **10KB payload limit**,
   **SSL verifikáció**, szerveroldali email-validáció.
6. A **lista állandó** (configból) — a kliens nem választhat listát.

**Erősen ajánlott (ActiveCampaign-ben):** kapcsold be a **dupla opt-in**-t a listán
/ automáción. Ez a legnagyobb védelem — egy hamisított vagy spam feliratkozás nem
válik valódi kontaktté, amíg a címzett nem kattint a megerősítő emailre.

### Cloudflare Turnstile (botvédelem) — ALAPBÓL KIKAPCSOLVA

> **A Turnstile a 2.2.0-tól alapból KI van kapcsolva** (`DEFAULT_TURNSTILE_SITEKEY = ""`).
> Sehol nem jelenik meg, hacsak egy adott beágyazás kifejezetten be nem kapcsolja.

Bekapcsoláshoz **két kulcs** kell, és fontos, hogy hová kerülnek:

| Kulcs | Hol van | Hová tedd |
|---|---|---|
| **Site key** (publikus) | a böngészőben jelenik meg | a beágyazásba: `data-turnstile-sitekey="0x..."` (vagy `init({ turnstileSitekey: "0x..." })`). Globális bekapcsoláshoz beégethető a `src/widget/index.js` `DEFAULT_TURNSTILE_SITEKEY`-be is. |
| **Secret key** (titkos) | csak a szerveren | `lf-config.php`: `define('LF_TURNSTILE_SECRET', '0x...')` — **SOHA ne a kliensbe / repóba** |

Ha a `LF_TURNSTILE_SECRET` ki van töltve a szerveren, a `subscribe.php` **kötelezően**
ellenőrzi a tokent a Cloudflare-nél. Ha a `turnstileSitekey` (beágyazásban vagy a default
konstansban) meg van adva, a widget megjeleníti a Turnstile widgetet és elküldi a tokent.

> A Turnstile akkor véd, ha **mindkét** kulcs be van állítva (site key a widgetben,
> secret a szerveren). Csak az egyik beállítása nem elég — sőt, ha csak a secret van
> beállítva a szerveren, de a widget nem küld tokent, a beküldés **400-as hibát** kap.

**Későbbi opció:** HMAC-kel aláírt `tag`+`redirect` („strict mode"), ha valahol
maximális védelem kell.

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
