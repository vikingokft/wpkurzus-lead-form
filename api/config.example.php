<?php
/**
 * @wpkurzus/lead-form — szerver oldali konfiguráció (v2).
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Élesben AJÁNLOTT a környezeti változós megoldás (ekkor erre a fájlra      │
 * │ nincs is szükség). Ha fájlt használsz, tedd a WEB ROOT FÖLÉ lf-config.php │
 * │ néven. SOHA ne commitold (a .gitignore kizárja).                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * A subscribe.php sorrendje: (1) env-változók → (2) lf-config.php a web root
 * fölött → (3) config.php a végpont mellett (csak fejlesztéshez).
 *
 * Env-változós alternatíva:
 *   AC_API_URL, AC_API_KEY, AC_ENV, LF_LIST_ID, LF_SANDBOX_LIST_ID,
 *   LF_GLOBAL_ORIGINS (vesszővel)
 */

// ActiveCampaign API hozzáférés
define('AC_API_URL', 'https://youraccount.api-us1.com');
define('AC_API_KEY', 'ide-jon-az-api-kulcs');

// Környezet: 'production' vagy 'sandbox'
define('AC_ENV', 'production');

// ÁLLANDÓ listák (a feliratkozó MINDIG ezekre kerül, környezet szerint).
// A funnelt a beágyazásból érkező TAG különbözteti meg, nem a lista.
define('LF_LIST_ID', 1);          // production — "WPKurzus Fő lista"
define('LF_SANDBOX_LIST_ID', 3);  // sandbox

// Engedélyezett oldalak (CSRF/CORS allowlist). Cross-domain beágyazásnál minden
// origint IDE kell tenni (a böngésző preflight kérése miatt). A redirect URL is
// csak ezekre a domainekre mutathat (open-redirect védelem).
define('LF_GLOBAL_ORIGINS', [
    'https://wpkurzus.hu',
    'https://www.wpkurzus.hu',
    'https://vikingo.hu',
    'https://www.vikingo.hu',
    'http://localhost:3000',
]);

// Engedélyezett tag-prefixek (opcionális biztonsági korlát). Üres tömb = bármilyen
// tag elfogadható (csak karakterkészlet + max 64 karakter érvényes). Ha szigorítani
// akarsz, sorold fel az engedélyezett prefixeket, pl. ['LM:', 'WEBINAR:'].
define('LF_TAG_PREFIXES', []);

// Cloudflare Turnstile SECRET kulcs (a botvédelemhez). Ha üresen hagyod / nem
// definiálod, a Turnstile-ellenőrzés KI van kapcsolva. A SITE KEY (publikus) NEM
// ide megy, hanem a beágyazásba (data-turnstile-sitekey) vagy a widget DEFAULT-jába.
// define('LF_TURNSTILE_SECRET', '0x...');
