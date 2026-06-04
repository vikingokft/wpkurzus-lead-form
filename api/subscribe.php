<?php
/**
 * @wpkurzus/lead-form — feliratkozási végpont (v2, registry nélkül).
 *
 * A beágyazás adja meg a `tag`-et és a `redirect`-et — a lista ÁLLANDÓ (a szerver
 * configból). Nincs registry, nincs admin: egy fájl, egyszer felteszed.
 *
 * Biztonság:
 *   - Origin/Referer allowlist (LF_GLOBAL_ORIGINS) + CORS preflight
 *   - Rate limiting (IP-hash, 5/perc)
 *   - Payload limit (10KB), SSL verifikáció
 *   - Tag-validáció: karakterkészlet + max hossz + (opcionális) engedélyezett prefix
 *   - Redirect host-ellenőrzés: csak engedélyezett originre mutathat (nincs open-redirect)
 *
 * Konfig (lf-config.php vagy env): AC_API_URL, AC_API_KEY, AC_ENV,
 *   LF_LIST_ID (prod), LF_SANDBOX_LIST_ID (sandbox), LF_GLOBAL_ORIGINS,
 *   LF_TAG_PREFIXES (opcionális, alap: ['LM:']).
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

function lf_respond($code, $payload) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

function lf_env($key) {
    $v = getenv($key);
    if ($v !== false && $v !== '') return $v;
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];
    return null;
}

// --- Konfiguráció: env elsődleges, majd lf-config.php a web root fölött ---
$acApiUrl = lf_env('AC_API_URL');
$acApiKey = lf_env('AC_API_KEY');
if ($acApiUrl && $acApiKey) {
    define('AC_API_URL', $acApiUrl);
    define('AC_API_KEY', $acApiKey);
    define('AC_ENV', lf_env('AC_ENV') ?: 'production');
    if ($v = lf_env('LF_GLOBAL_ORIGINS')) {
        define('LF_GLOBAL_ORIGINS', array_values(array_filter(array_map('trim', explode(',', $v)))));
    }
    if ($v = lf_env('LF_LIST_ID')) define('LF_LIST_ID', (int)$v);
    if ($v = lf_env('LF_SANDBOX_LIST_ID')) define('LF_SANDBOX_LIST_ID', (int)$v);
} else {
    $configPath = null;
    $dir = __DIR__;
    for ($i = 0; $i < 6; $i++) {
        $dir = dirname($dir);
        if (file_exists($dir . '/lf-config.php')) { $configPath = $dir . '/lf-config.php'; break; }
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
// Opcionális tag-prefix korlát. Alap: ÜRES = nincs prefix-megkötés (csak
// karakterkészlet + max hossz). Configban bővíthető, pl. ['LM:', 'WEBINAR:'].
$tagPrefixes = defined('LF_TAG_PREFIXES') ? LF_TAG_PREFIXES : [];
$turnstileSecret = (defined('LF_TURNSTILE_SECRET') ? LF_TURNSTILE_SECRET : (lf_env('LF_TURNSTILE_SECRET') ?: ''));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// --- CORS preflight ---
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

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    lf_respond(405, ['success' => false, 'error' => 'Csak POST kérés engedélyezett.']);
}

// --- Origin/Referer allowlist (CSRF) ---
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$isValidOrigin = false;
foreach ($globalOrigins as $allowed) {
    if ($allowed !== '' && ($origin === $allowed || strpos($referer, $allowed) === 0)) {
        $isValidOrigin = true; break;
    }
}
if (!$isValidOrigin) {
    lf_respond(403, ['success' => false, 'error' => 'Érvénytelen forrás.']);
}
if ($origin && in_array($origin, $globalOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

// --- Rate limiting ---
function lf_check_rate_limit($ip, $maxRequests = 5, $windowSeconds = 60) {
    $dir = sys_get_temp_dir() . '/lf_rate_limit';
    if (!is_dir($dir)) mkdir($dir, 0700, true);
    if (mt_rand(1, 100) === 1) {
        foreach (glob($dir . '/*.json') as $f) {
            if (filemtime($f) < time() - 7200) @unlink($f);
        }
    }
    $file = $dir . '/' . hash('sha256', $ip) . '.json';
    $fp = fopen($file, 'c+');
    if (!$fp) return true;
    flock($fp, LOCK_EX);
    $data = json_decode(stream_get_contents($fp) ?: 'null', true);
    if (!is_array($data) || !isset($data['requests'])) $data = ['requests' => []];
    $now = time();
    $data['requests'] = array_values(array_filter($data['requests'], fn($ts) => ($now - $ts) < $windowSeconds));
    if (count($data['requests']) >= $maxRequests) {
        flock($fp, LOCK_UN); fclose($fp); return false;
    }
    $data['requests'][] = $now;
    ftruncate($fp, 0); rewind($fp); fwrite($fp, json_encode($data));
    flock($fp, LOCK_UN); fclose($fp);
    return true;
}
if (!lf_check_rate_limit($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0')) {
    lf_respond(429, ['success' => false, 'error' => 'Túl sok kérés. Kérjük, várj egy percet.']);
}

// --- Input ---
$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 10240) {
    lf_respond(413, ['success' => false, 'error' => 'Túl nagy kérés.']);
}
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    lf_respond(400, ['success' => false, 'error' => 'Érvénytelen kérés.']);
}

$email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$name = trim($input['name'] ?? '');
$tag = trim($input['tag'] ?? '');
$redirect = trim($input['redirect_url'] ?? '');

if (!$email) {
    lf_respond(400, ['success' => false, 'error' => 'Érvénytelen email cím.']);
}

// --- Tag validáció: karakterkészlet + hossz + (opcionális) prefix ---
if ($tag === '' || mb_strlen($tag) > 64 || !preg_match('/^[\p{L}\p{N} :_\-]+$/u', $tag)) {
    lf_respond(400, ['success' => false, 'error' => 'Érvénytelen tag.']);
}
if (!empty($tagPrefixes)) {
    $prefixOk = false;
    foreach ($tagPrefixes as $p) {
        if (strncmp($tag, $p, strlen($p)) === 0) { $prefixOk = true; break; }
    }
    if (!$prefixOk) {
        lf_respond(400, ['success' => false, 'error' => 'A tag nem engedélyezett prefixszel kezdődik.']);
    }
}

// --- Redirect validáció: valid URL + host az allowlistben (nincs open-redirect) ---
if ($redirect === '' || !filter_var($redirect, FILTER_VALIDATE_URL)) {
    lf_respond(400, ['success' => false, 'error' => 'Érvénytelen redirect URL.']);
}
$rp = parse_url($redirect);
$redirectOrigin = ($rp['scheme'] ?? '') . '://' . ($rp['host'] ?? '') . (isset($rp['port']) ? ':' . $rp['port'] : '');
if (!in_array($redirectOrigin, $globalOrigins, true)) {
    lf_respond(400, ['success' => false, 'error' => 'A redirect nem engedélyezett domainre mutat.']);
}

// --- Cloudflare Turnstile (ha be van állítva LF_TURNSTILE_SECRET) ---
if ($turnstileSecret !== '') {
    $token = trim($input['turnstile_token'] ?? '');
    if ($token === '') {
        lf_respond(400, ['success' => false, 'error' => 'Hiányzó botvédelmi token.']);
    }
    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'secret' => $turnstileSecret,
            'response' => $token,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]),
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $tsResp = json_decode(curl_exec($ch) ?: 'null', true);
    curl_close($ch);
    if (!is_array($tsResp) || empty($tsResp['success'])) {
        lf_respond(403, ['success' => false, 'error' => 'A botvédelmi ellenőrzés nem sikerült.']);
    }
}

// --- Lista (állandó, környezet szerint) ---
$acEnv = AC_ENV;
$listId = ($acEnv === 'sandbox')
    ? (defined('LF_SANDBOX_LIST_ID') ? LF_SANDBOX_LIST_ID : 0)
    : (defined('LF_LIST_ID') ? LF_LIST_ID : 0);
if ($listId <= 0) {
    lf_respond(500, ['success' => false, 'error' => 'Hiányzó lista konfiguráció.']);
}

// --- ActiveCampaign API ---
function lf_ac_call($method, $endpoint, $data = null) {
    $ch = curl_init(rtrim(AC_API_URL, '/') . '/api/3/' . ltrim($endpoint, '/'));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Api-Token: ' . AC_API_KEY, 'Content-Type: application/json', 'Accept: application/json'],
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    if ($error) return ['success' => false, 'error' => $error];
    return ['success' => $httpCode >= 200 && $httpCode < 300, 'http_code' => $httpCode, 'data' => json_decode($response, true)];
}

function lf_ac_contact($email, $name) {
    $contact = ['email' => $email];
    if (!empty($name)) $contact['firstName'] = $name;
    $r = lf_ac_call('POST', 'contact/sync', ['contact' => $contact]);
    return ($r['success'] && isset($r['data']['contact']['id'])) ? $r['data']['contact']['id'] : null;
}

function lf_ac_add_to_list($contactId, $listId) {
    return lf_ac_call('POST', 'contactLists', ['contactList' => ['list' => $listId, 'contact' => $contactId, 'status' => 1]]);
}

function lf_ac_tag_id($tagName) {
    $r = lf_ac_call('GET', 'tags?search=' . urlencode($tagName));
    if ($r['success'] && !empty($r['data']['tags'])) {
        foreach ($r['data']['tags'] as $t) {
            if ($t['tag'] === $tagName) return (int)$t['id'];
        }
    }
    $c = lf_ac_call('POST', 'tags', ['tag' => ['tag' => $tagName, 'tagType' => 'contact']]);
    return ($c['success'] && !empty($c['data']['tag']['id'])) ? (int)$c['data']['tag']['id'] : null;
}

function lf_ac_add_tag($contactId, $tagName) {
    $tagId = lf_ac_tag_id($tagName);
    if (!$tagId) return;
    lf_ac_call('POST', 'contactTags', ['contactTag' => ['contact' => $contactId, 'tag' => $tagId]]);
}

// --- Fő folyamat ---
$contactId = lf_ac_contact($email, $name);
if (!$contactId) {
    lf_respond(502, ['success' => false, 'error' => 'Nem sikerült a feliratkozás. Kérjük, próbáld újra.']);
}
$listResult = lf_ac_add_to_list($contactId, $listId);
if (!$listResult['success']) {
    error_log("[lead-form] AC lista hiba (contact: $contactId, list: $listId): " . json_encode($listResult));
}
lf_ac_add_tag($contactId, $tag);

// --- Siker ---
lf_respond(200, [
    'success' => true,
    'event_id' => 'evt_' . bin2hex(random_bytes(8)),
    'ts' => round(microtime(true) * 1000),
    'redirect_url' => $redirect,
]);
