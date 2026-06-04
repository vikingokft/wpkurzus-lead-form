# Changelog

A jelölés a [Semantic Versioning](https://semver.org/lang/hu/) szerint:
`MAJOR.MINOR.PATCH` — törő / új funkció / javítás.

A CDN-fogyasztók `@1`-re pinnelve automatikusan kapják a MINOR és PATCH
frissítéseket; a MAJOR (törő) verziót kézzel kell emelni.

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
