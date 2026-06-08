<?php
/**
 * @wpkurzus/lead-form — szerver oldali konfiguráció (v2).
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ HOVÁ tedd és MILYEN néven?                                                │
 * │                                                                           │
 * │  A) web root FÖLÖTT, `lf-config.php` néven   ← legbiztonságosabb (ajánlott)│
 * │  B) a végpont MELLETT, `lead/v1/config.php` néven  ← kényelmes (egy hely) │
 * │                                                                           │
 * │ A subscribe.php így keresi: (1) env-változók → (2) szülő mappákban        │
 * │ `lf-config.php` → (3) UGYANABBAN a mappában `config.php`. Ezért a         │
 * │ `lead/v1/`-ben a név KÖTELEZŐEN `config.php` (az `lf-config.php`-t ott NEM │
 * │ találja meg).                                                             │
 * │                                                                           │
 * │ ⚠️ Env-változók (AC_API_URL/AC_API_KEY) FELÜLÍRJÁK ezt a fájlt.           │
 * │ ⚠️ SOHA ne commitold (a .gitignore kizárja).                              │
 * │ ⚠️ A B) opció csak Apache + működő `.htaccess` mellett biztonságos (a     │
 * │    config.php kívülről 403). Nginx-en a `.htaccess` nem érvényes → A).    │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

// ===== AKTÍV KÖRNYEZET — EZT az egy sort állítsd a váltáshoz =====
define('AC_ENV', 'production');   // 'production' (éles) vagy 'sandbox' (teszt)

// ===== Mindkét környezet adatai (URL + kulcs + lista — egy AC-fiókhoz tartoznak) =====
// • KÜLÖN fiók sandboxra és productionre  → más `url`+`key` a két ágban.
// • EGY fiók, két lista                   → ugyanaz az `url`+`key` mindkettőben, csak a `list` tér el.
$LF_ENVS = [
    'production' => [
        'url'  => 'https://youraccount.api-us1.com',   // éles AC-fiók API URL
        'key'  => 'ide-jon-a-PRODUCTION-api-kulcs',     // éles fiók API-kulcsa (URL+kulcs EGY fiókból!)
        'list' => 1,                                    // éles lista ID ("WPKurzus Fő lista")
    ],
    'sandbox' => [
        'url'  => 'https://yoursandbox.api-us1.com',    // teszt AC-fiók API URL
        'key'  => 'ide-jon-a-SANDBOX-api-kulcs',        // teszt fiók API-kulcsa
        'list' => 3,                                    // sandbox lista ID
    ],
];

// ===== INNEN LEFELÉ NEM KELL ÁTÍRNI — a subscribe.php ezeket a konstansokat várja =====
$__lf = $LF_ENVS[AC_ENV] ?? $LF_ENVS['production'];
define('AC_API_URL', $__lf['url']);                           // az AKTÍV környezet fiókja
define('AC_API_KEY', $__lf['key']);
define('LF_LIST_ID',         $LF_ENVS['production']['list']); // production-höz ezt,
define('LF_SANDBOX_LIST_ID', $LF_ENVS['sandbox']['list']);    // sandbox-hoz ezt használja (AC_ENV szerint)

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

// Cloudflare Turnstile SECRET kulcs (opcionális botvédelem). ALAPBÓL KIKAPCSOLVA:
// ne definiáld. Ha definiálod, a szerver KÖTELEZŐEN tokent vár — ekkor a widgetnek
// is sitekey-t kell adni (data-turnstile-sitekey / turnstileSitekey), különben a
// tokenmentes beküldés 400-at kap. A SITE KEY (publikus) NEM ide megy, hanem a widgetbe.
// define('LF_TURNSTILE_SECRET', '0x...');
