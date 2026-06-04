<?php
/**
 * @wpkurzus/lead-form — központi feliratkozási végpont.
 *
 * Egy közös API minden beágyazó rendszerhez. A tageket és a listát NEM a kliens
 * küldi, hanem a szerver oldali registry (funnels.json) oldja fel funnelenként —
 * így a kliens nem tud tetszőleges taget/listát hozzáadni (biztonságos).
 *
 * Feladatai:
 *   1. CORS + CSRF (Origin/Referer) ellenőrzés — globális + funnel-specifikus allowlist
 *   2. Rate limiting (fájl-alapú, IP-hash)
 *   3. Input validáció + payload limit
 *   4. ActiveCampaign: kontakt sync → lista → tagek
 *   5. event_id + redirect_url visszaadása a kliensnek
 *
 * Telepítés:
 *   - config.php          → AC kulcsok (web root felett ajánlott; lásd config.example.php)
 *   - funnels.json        → tag/lista registry (lásd funnels.example.json)
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

function lf_respond($code, $payload) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

// Környezeti változó olvasása (getenv + $_SERVER fallback FPM/SetEnv esetére).
function lf_env($key) {
    $v = getenv($key);
    if ($v !== false && $v !== '') return $v;
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];
    return null;
}

// --- Konfiguráció betöltése ---
// Biztonsági sorrend (legbiztonságosabb előre):
//   1) Környezeti változók (AC_API_URL, AC_API_KEY, ...) — a kulcs SEMMILYEN
//      fájlban nincs a deploy alatt. EZ AZ AJÁNLOTT élesben.
//   2) `lf-config.php` a web root FÖLÖTT (HTTP-n elérhetetlen).
//   3) `config.php` a végpont mellett (csak fejlesztéshez; .htaccess védi).
$acApiUrl = lf_env('AC_API_URL');
$acApiKey = lf_env('AC_API_KEY');

if ($acApiUrl && $acApiKey) {
    define('AC_API_URL', $acApiUrl);
    define('AC_API_KEY', $acApiKey);
    define('AC_ENV', lf_env('AC_ENV') ?: 'production');
    // Vesszővel elválasztott originek az env-ből.
    $envOrigins = lf_env('LF_GLOBAL_ORIGINS');
    if ($envOrigins) {
        define('LF_GLOBAL_ORIGINS', array_values(array_filter(array_map('trim', explode(',', $envOrigins)))));
    }
} else {
    $configPath = null;
    $dir = __DIR__;
    for ($i = 0; $i < 6; $i++) {
        $dir = dirname($dir);
        if (file_exists($dir . '/lf-config.php')) {
            $configPath = $dir . '/lf-config.php';
            break;
        }
    }
    if (!$configPath && file_exists(__DIR__ . '/config.php')) {
        $configPath = __DIR__ . '/config.php';
    }
    if (!$configPath) {
        lf_respond(500, ['success' => false, 'error' => 'Szerver konfigurációs hiba.']);
    }
    require_once $configPath;
}

if (!defined('AC_API_URL') || !defined('AC_API_KEY') || AC_API_KEY === '') {
    lf_respond(500, ['success' => false, 'error' => 'Szerver konfigurációs hiba.']);
}

$globalOrigins = defined('LF_GLOBAL_ORIGINS') ? LF_GLOBAL_ORIGINS : [];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// --- CORS preflight (cross-domain beágyazás) ---
// A preflight kérésben még nincs body, ezért csak a globális allowlist alapján
// tudunk dönteni. A cross-domain origineket a config LF_GLOBAL_ORIGINS-ába tedd.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    if ($origin && in_array($origin, $globalOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Max-Age: 86400');
        header('Vary: Origin');
    }
    http_response_code(204);
    exit;
}

// --- Csak POST ---
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    lf_respond(405, ['success' => false, 'error' => 'Csak POST kérés engedélyezett.']);
}

// --- Registry betöltése (funnel → list_id + tagek) ---
// A registry helye felülírható env-ből vagy a configból (LF_REGISTRY_PATH),
// hogy a web root FÖLÉ tehető legyen. Alapból a végpont mellett (a .htaccess
// letiltja a direkt HTTP-hozzáférést hozzá).
$registryPath = lf_env('LF_REGISTRY_PATH')
    ?: (defined('LF_REGISTRY_PATH') ? LF_REGISTRY_PATH : __DIR__ . '/funnels.json');
if (!file_exists($registryPath)) {
    lf_respond(500, ['success' => false, 'error' => 'Funnel registry nem található.']);
}
$registry = json_decode(file_get_contents($registryPath), true);
if (!is_array($registry)) {
    lf_respond(500, ['success' => false, 'error' => 'Hibás funnel registry.']);
}

// --- Payload limit ---
$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 10240) { // max 10KB
    lf_respond(413, ['success' => false, 'error' => 'Túl nagy kérés.']);
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    lf_respond(400, ['success' => false, 'error' => 'Érvénytelen kérés.']);
}

$email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$name = trim($input['name'] ?? '');
$funnelSlug = trim($input['funnel_slug'] ?? '');

if (empty($funnelSlug) || !isset($registry[$funnelSlug])) {
    lf_respond(400, ['success' => false, 'error' => 'Ismeretlen funnel.']);
}
$funnel = $registry[$funnelSlug];

// --- CSRF / Origin allowlist (globális + funnel-specifikus) ---
$funnelOrigins = $funnel['allowed_origins'] ?? [];
$allowedOrigins = array_values(array_unique(array_merge($globalOrigins, $funnelOrigins)));

$referer = $_SERVER['HTTP_REFERER'] ?? '';
$isValidOrigin = false;
foreach ($allowedOrigins as $allowed) {
    if ($allowed !== '' && ($origin === $allowed || strpos($referer, $allowed) === 0)) {
        $isValidOrigin = true;
        break;
    }
}
if (!$isValidOrigin) {
    lf_respond(403, ['success' => false, 'error' => 'Érvénytelen forrás.']);
}

// CORS válasz fejléc a megengedett origin-nek (cross-domain beágyazáshoz)
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

// --- Rate limiting ---
function lf_check_rate_limit($ip, $maxRequests = 5, $windowSeconds = 60) {
    $dir = sys_get_temp_dir() . '/lf_rate_limit';
    if (!is_dir($dir)) {
        mkdir($dir, 0700, true);
    }
    // Garbage collection ~1% eséllyel
    if (mt_rand(1, 100) === 1) {
        foreach (glob($dir . '/*.json') as $f) {
            if (filemtime($f) < time() - 7200) {
                @unlink($f);
            }
        }
    }
    $file = $dir . '/' . hash('sha256', $ip) . '.json';
    $fp = fopen($file, 'c+');
    if (!$fp) return true;
    flock($fp, LOCK_EX);
    $contents = stream_get_contents($fp);
    $data = $contents ? json_decode($contents, true) : null;
    if (!is_array($data) || !isset($data['requests'])) {
        $data = ['requests' => []];
    }
    $now = time();
    $data['requests'] = array_values(array_filter($data['requests'], function ($ts) use ($now, $windowSeconds) {
        return ($now - $ts) < $windowSeconds;
    }));
    if (count($data['requests']) >= $maxRequests) {
        flock($fp, LOCK_UN);
        fclose($fp);
        return false;
    }
    $data['requests'][] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

$clientIp = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (!lf_check_rate_limit($clientIp)) {
    lf_respond(429, ['success' => false, 'error' => 'Túl sok kérés. Kérjük, várj egy percet.']);
}

if (!$email) {
    lf_respond(400, ['success' => false, 'error' => 'Érvénytelen email cím.']);
}

// AC környezet (sandbox/production) a config.php-ból
$acEnv = defined('AC_ENV') ? AC_ENV : 'production';
$acConfig = $funnel['activecampaign'][$acEnv] ?? ($funnel['activecampaign'] ?? null);
if (!is_array($acConfig) || empty($acConfig['list_id'])) {
    lf_respond(500, ['success' => false, 'error' => 'Hiányzó AC konfiguráció a funnelhez.']);
}

// --- ActiveCampaign API hívások ---
function lf_ac_call($method, $endpoint, $data = null) {
    $url = rtrim(AC_API_URL, '/') . '/api/3/' . ltrim($endpoint, '/');
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Api-Token: ' . AC_API_KEY,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    if ($error) {
        return ['success' => false, 'error' => $error];
    }
    return [
        'success' => $httpCode >= 200 && $httpCode < 300,
        'http_code' => $httpCode,
        'data' => json_decode($response, true),
    ];
}

function lf_ac_contact($email, $name) {
    $contact = ['email' => $email];
    if (!empty($name)) {
        $contact['firstName'] = $name;
    }
    $result = lf_ac_call('POST', 'contact/sync', ['contact' => $contact]);
    if ($result['success'] && isset($result['data']['contact']['id'])) {
        return $result['data']['contact']['id'];
    }
    return null;
}

function lf_ac_add_to_list($contactId, $listId) {
    return lf_ac_call('POST', 'contactLists', [
        'contactList' => ['list' => $listId, 'contact' => $contactId, 'status' => 1],
    ]);
}

function lf_ac_tag_id($tagName) {
    $result = lf_ac_call('GET', 'tags?search=' . urlencode($tagName));
    if ($result['success'] && !empty($result['data']['tags'])) {
        foreach ($result['data']['tags'] as $tag) {
            if ($tag['tag'] === $tagName) {
                return (int)$tag['id'];
            }
        }
    }
    $create = lf_ac_call('POST', 'tags', ['tag' => ['tag' => $tagName, 'tagType' => 'contact']]);
    if ($create['success'] && !empty($create['data']['tag']['id'])) {
        return (int)$create['data']['tag']['id'];
    }
    error_log("[lead-form] AC tag létrehozás sikertelen: $tagName — " . json_encode($create));
    return null;
}

function lf_ac_add_tags($contactId, $tagNames) {
    foreach ($tagNames as $tagName) {
        $tagName = trim($tagName);
        if ($tagName === '') continue;
        $tagId = lf_ac_tag_id($tagName);
        if (!$tagId) continue;
        lf_ac_call('POST', 'contactTags', [
            'contactTag' => ['contact' => $contactId, 'tag' => $tagId],
        ]);
    }
}

// --- FŐ FOLYAMAT ---
$contactId = lf_ac_contact($email, $name);
if (!$contactId) {
    lf_respond(502, ['success' => false, 'error' => 'Nem sikerült a feliratkozás. Kérjük, próbáld újra.']);
}

$listResult = lf_ac_add_to_list($contactId, $acConfig['list_id']);
if (!$listResult['success']) {
    error_log("[lead-form] AC lista hiba (contact: $contactId, list: {$acConfig['list_id']}): " . json_encode($listResult));
}

if (!empty($acConfig['tags'])) {
    lf_ac_add_tags($contactId, $acConfig['tags']);
}

// --- Sikeres válasz ---
$eventId = 'evt_' . bin2hex(random_bytes(8));
$timestamp = round(microtime(true) * 1000);
$redirectUrl = $funnel['redirect_url'] ?? null;

lf_respond(200, [
    'success' => true,
    'event_id' => $eventId,
    'ts' => $timestamp,
    'redirect_url' => $redirectUrl,
]);
