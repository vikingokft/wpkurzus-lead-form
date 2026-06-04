# Changelog

A jelölés a [Semantic Versioning](https://semver.org/lang/hu/) szerint:
`MAJOR.MINOR.PATCH` — törő / új funkció / javítás.

A CDN-fogyasztók `@1`-re pinnelve automatikusan kapják a MINOR és PATCH
frissítéseket; a MAJOR (törő) verziót kézzel kell emelni.

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
