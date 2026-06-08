# Changelog

A jelölés a [Semantic Versioning](https://semver.org/lang/hu/) szerint:
`MAJOR.MINOR.PATCH` — törő / új funkció / javítás.

A CDN-fogyasztók `@1`-re pinnelve automatikusan kapják a MINOR és PATCH
frissítéseket; a MAJOR (törő) verziót kézzel kell emelni.

## [2.2.1] — Backend dokumentáció + production/sandbox kapcsoló

### Dokumentáció
- **README „Backend" szekció pontosítva:** a config keresési sorrendje (env-változók →
  `lf-config.php` a szülő mappákban → `config.php` ugyanabban a mappában), és két ajánlott
  elrendezés: **A)** `lf-config.php` a web root fölött (legbiztonságosabb), **B)** `config.php`
  a `lead/v1/`-ben a `subscribe.php` mellett (kényelmes; csak Apache + `.htaccess` mellett biztonságos).
  Megjegyzés: a `lead/v1/`-ben a név **kötelezően `config.php`** (az `lf-config.php`-t ott nem találja meg).
- **`api/config.example.php` átírva** a **production/sandbox kapcsoló** mintára: mindkét környezet
  (URL + kulcs + lista) egyszerre konfigurálva, és egyetlen `AC_ENV` sor váltja, melyik aktív —
  **a `subscribe.php` változatlan** (a config-fájl oldja fel az aktív fiók adatait). Külön AC-fiók
  és „egy fiók, két lista" eset is támogatott. Turnstile alapból kikapcsolva (lásd 2.2.0).

> Megjegyzés: a `dist/` ebben a kiadásban **nem változott** (kód-azonos a 2.2.0-val) — csak
> dokumentáció és a config-sablon frissült.

## [2.2.0] — Turnstile alapból kikapcsolva

### Megváltozott
- **A Cloudflare Turnstile ALAPBÓL KI van kapcsolva** (`DEFAULT_TURNSTILE_SITEKEY = ""`).
  A korábban beégetett site key eltávolítva, így a widget alapból **nem** jelenít meg
  Turnstile-t és **nem** küld tokent. Bekapcsolható per-beágyazás (`data-turnstile-sitekey`
  / `turnstileSitekey`), vagy globálisan a default konstans kitöltésével.
- **Figyelem (token-párosítás):** ha a szerver `lf-config.php`-jában be van állítva
  `LF_TURNSTILE_SECRET`, de a widget nem küld tokent (mert a sitekey üres), a beküldés
  **400 „Hiányzó botvédelmi token"** hibát ad. A Turnstile teljes kivételéhez a szerverről
  is el kell távolítani a `LF_TURNSTILE_SECRET`-et.

## [2.1.1] — Turnstile site key beégetve

- A WPViking Turnstile **site key** (publikus) beégetve a `DEFAULT_TURNSTILE_SITEKEY`-be,
  így minden beágyazásnál automatikusan megjelenik a botvédelem. A **secret key** a
  szerver `lf-config.php`-jába kerül (nincs a repóban).

## [2.1.0] — Turnstile + alap cím + prefix lazítás

### Hozzáadva
- **Cloudflare Turnstile** botvédelem: `data-turnstile-sitekey` (vagy beégetett
  `DEFAULT_TURNSTILE_SITEKEY`) a widgetben + `LF_TURNSTILE_SECRET` a szerveren
  (kötelező token-ellenőrzés a Cloudflare-nél, ha be van állítva).
- Alapértelmezett form cím: „Töltsd le ingyen, és iratkozz fel hírlevelünkre!"
  (`data-form-title=""` elrejti).

### Megváltozott
- A tag-prefix korlát (`LF_TAG_PREFIXES`) alapból **ÜRES** (nincs `LM:` megkötés) —
  bármilyen tag elfogadható (karakterkészlet + max 64 karakter érvényes). Configban
  szigorítható, ha kell.

## [2.0.0] — egyszerűsített modell: tag+redirect a beágyazásban (BREAKING)

A registry/admin/funnel-slug megszűnt. A beemeléshez már csak a **tag** és a
**köszönő oldal (redirect)** kell — az API végpont be van égetve a widgetbe.

### Megváltozott (BREAKING)
- Embed: `data-funnel` → **`data-tag`** + **`data-redirect`** (mindkettő kötelező).
- A widget API URL-je beégetve (`data-api` opcionális felülírás).
- `subscribe.php`: a kérés `tag` + `redirect_url` mezőt küld; a **lista állandó**
  (config: `LF_LIST_ID` / `LF_SANDBOX_LIST_ID`). Nincs `funnels.json` registry.
- JS opció: `redirect: false` helyett `noRedirect: true`.

### Eltávolítva
- `api/admin/` (admin felület), `api/funnels.example.json`, a teljes registry-logika.

### Hozzáadva (biztonság)
- Tag-prefix korlát (`LF_TAG_PREFIXES`, alap `LM:`) + karakterkészlet + max hossz.
- Redirect host-ellenőrzés (csak engedélyezett originre mutathat — open-redirect védelem).
- Hiányzó `tag`/`redirect` esetén a widget látható fejlesztői hibát jelenít meg.

### Migráció
- `data-funnel="x"` → `data-tag="LM: X"` + `data-redirect="https://.../koszi/"`.
- A szerveren: töröld a `funnels.json`-t, állítsd be a `LF_LIST_ID`-t a configban.

## [1.0.2] — GDPR consent igazítás

### Javítva
- A consent címke és az alatta lévő tájékoztató szöveg bal széle most pontosan
  egy vonalban van (CSS grid: checkbox az 1. oszlopban, mindkét szöveg a 2.-ban),
  a korábbi mágikus `padding-left` helyett — checkbox-mérettől függetlenül igazodik.

## [1.0.1] — backend biztonsági hardening

### Hozzáadva
- `.htaccess` az `api/` mappában: minden direkt HTTP-hozzáférés tiltva a `subscribe.php`-n
  kívül (funnels.json, config.php, .example, docs nem érhető el böngészőből).
- **Környezeti változós konfiguráció** (`AC_API_URL`, `AC_API_KEY`, `AC_ENV`,
  `LF_GLOBAL_ORIGINS`) — élesben a kulcs egyetlen fájlban sem szerepel.
- `LF_REGISTRY_PATH`: a `funnels.json` áthelyezhető a web root fölé.
- `Referrer-Policy: no-referrer` válasz fejléc.

### Megjegyzés
- A JS bundle változatlan (a CDN `@1.0.0` és `@1.0.1` byte-azonos).

## [1.0.0] — kezdeti kiadás

### Hozzáadva
- Beágyazható lead-capture form (auto-init `[data-lead-form]` + programozott `LeadForm.init`).
- Okos email-validáció magyar hibaüzenetekkel + elgépelés-javító (pl. `gmial.com → gmail.com`).
- Email domain autocomplete dropdown (billentyűzet-támogatással).
- GDPR consent (nyilatkozat + halvány lábjegyzet, felülírható szöveggel).
- Honeypot spam-szűrés, 15 mp-es timeout, loading állapot, dupla-beküldés védelem.
- GTM `dataLayer` `lead` event push (deduplikációval).
- Témázható CSS (`--lf-*` változók), `dark`/`light` téma, `lf-` névtér.
- Hordozható PHP backend: registry-vezérelt tagek/lista (a kliens nem küldhet taget),
  CSRF/Origin allowlist (globális + funnel-specifikus), CORS preflight, rate limiting, SSL verifikáció.
- Három kimenet egy forrásból: CDN IIFE bundle, npm ESM csomag, önálló CSS.
