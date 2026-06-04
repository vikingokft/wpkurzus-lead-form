<?php
/**
 * @wpkurzus/lead-form — szerver oldali konfiguráció.
 *
 * Másold át `config.php` néven (vagy a web root FELÉ `lf-config.php` néven a
 * nagyobb biztonságért), és töltsd ki a saját értékeiddel.
 *
 * EZT A FÁJLT SOHA NE COMMITOLD — a .gitignore kizárja.
 */

// ActiveCampaign API hozzáférés
define('AC_API_URL', 'https://youraccount.api-us1.com');
define('AC_API_KEY', 'ide-jon-az-api-kulcs');

// Környezet: 'production' vagy 'sandbox' — eldönti, melyik AC list_id/tagek
// érvényesek a funnels.json-ból.
define('AC_ENV', 'production');

// Globális engedélyezett originek MINDEN funnelhez (a CSRF/CORS allowlist alapja).
// Cross-domain beágyazásnál (pl. más domainen futó React) IDE kell tenni az
// origint, hogy a böngésző preflight (OPTIONS) kérése is átmenjen.
define('LF_GLOBAL_ORIGINS', [
    'https://wpkurzus.hu',
    'http://localhost:3000',
]);
