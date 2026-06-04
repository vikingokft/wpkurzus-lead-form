<?php
/**
 * @wpkurzus/lead-form — szerver oldali konfiguráció (FALLBACK).
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FONTOS: élesben AJÁNLOTT a környezeti változós megoldás (lásd lent),      │
 * │ ekkor erre a fájlra NINCS is szükség — a kulcs egyetlen fájlban sem lesz. │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * A subscribe.php a következő sorrendben keresi a konfigurációt
 * (legbiztonságosabb előre):
 *
 *   1) KÖRNYEZETI VÁLTOZÓK  ← AJÁNLOTT
 *      Állítsd be a tárhely vezérlőpultjában / PHP-FPM pool configban / rendszer-
 *      env-ben. A kulcs így SEMMILYEN fájlban nincs a deploy alatt:
 *        AC_API_URL=https://youraccount.api-us1.com
 *        AC_API_KEY=ide-jon-a-kulcs
 *        AC_ENV=production
 *        LF_GLOBAL_ORIGINS=https://wpkurzus.hu,https://www.wpkurzus.hu,https://vikingo.hu
 *        LF_REGISTRY_PATH=/var/secure/funnels.json   (opcionális — web root fölé)
 *
 *   2) lf-config.php a WEB ROOT FÖLÖTT  ← ha nincs env
 *      Tedd ezt a fájlt a web root fölé `lf-config.php` néven. HTTP-n elérhetetlen,
 *      a subscribe.php felfelé keresve megtalálja.
 *
 *   3) config.php a végpont mellett  ← CSAK fejlesztéshez
 *      A .htaccess letiltja a direkt HTTP-hozzáférést, de élesben kerüld.
 *
 * Másold át a választott helyre, és SOHA ne commitold (a .gitignore kizárja).
 */

// ActiveCampaign API hozzáférés
define('AC_API_URL', 'https://youraccount.api-us1.com');
define('AC_API_KEY', 'ide-jon-az-api-kulcs');

// Környezet: 'production' vagy 'sandbox' — eldönti, melyik AC list_id/tagek
// érvényesek a funnels.json-ból.
define('AC_ENV', 'production');

// Globális engedélyezett originek MINDEN funnelhez (a CSRF/CORS allowlist alapja).
// A központi API (api.vikingodev.hu) cross-domain hívásokat fogad a fogyasztó
// oldalakról — minden ilyen origint IDE kell tenni, hogy a böngésző preflight
// (OPTIONS) kérése is átmenjen. Új oldal indításakor csak bővítsd a listát.
define('LF_GLOBAL_ORIGINS', [
    'https://wpkurzus.hu',
    'https://www.wpkurzus.hu',
    'https://vikingo.hu',       // jövőbeli oldal — előre felvéve
    'https://www.vikingo.hu',
    'http://localhost:3000',    // helyi fejlesztés
]);

// Opcionális: a registry (funnels.json) áthelyezése a web root fölé.
// define('LF_REGISTRY_PATH', dirname(__DIR__, 4) . '/funnels.json');
