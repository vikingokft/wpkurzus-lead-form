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

// Engedélyezett tag-prefixek (biztonság: a beküldött tag csak ilyennel kezdődhet,
// így egy hamisított kérés sem rakhat tetszőleges, érzékeny taget). Üres tömb =
// nincs prefix-korlát (csak karakterkészlet + max hossz érvényes).
define('LF_TAG_PREFIXES', ['LM:']);
