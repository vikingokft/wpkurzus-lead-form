/**
 * Email validáció + magyar nyelvű, beszédes hibaüzenetek + elgépelés-javító.
 *
 * Ez a modul keretrendszer-független, mellékhatás nélküli. A hibaüzenetek
 * felülírhatók az init `messages` opciójával (lásd index.js).
 */

// Ismert domainek az autocomplete-hez és az elgépelés-detektáláshoz.
export const EMAIL_DOMAINS = [
  "gmail.com",
  "freemail.hu",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "t-online.hu",
  "outlook.com",
  "outlook.hu",
  "hotmail.hu",
];

// Gyakori domain-elírások → helyes alak.
export const DOMAIN_TYPOS = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.om": "gmail.com",
  "gmal.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gmail.hu": "gmail.com",
  "hotmal.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outloo.com": "outlook.com",
  "outlok.com": "outlook.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "citromail.h": "citromail.hu",
  "citromail.u": "citromail.hu",
  "freemail.h": "freemail.hu",
  "freemail.u": "freemail.hu",
};

// Alapértelmezett magyar üzenetek. Az init `messages` opciójával felülírható.
export const DEFAULT_MESSAGES = {
  emailEmpty: "Add meg az e-mail címed.",
  emailNoAt: "Hiányzik a @ karakter az e-mail címből.",
  emailFormat: "Az e-mail cím formátuma nem megfelelő.",
  emailNoLocal: "Hiányzik a felhasználónév a @ előtt.",
  emailNoDomain: "Hiányzik vagy hibás a domain (pl. gmail.com).",
  // {suggestion} helyettesítődik a javasolt címmel
  emailTypo: "Elgépelted? Helyesen: {suggestion}",
  gdprRequired: "Az adatkezelési tájékoztató elfogadása kötelező.",
  turnstileRequired: "Kérlek, igazold, hogy nem vagy robot.",
  networkError: "Hálózati hiba. Kérjük, próbáld újra.",
  genericError: "Hiba történt. Kérjük, próbáld újra.",
};

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Visszaadja az email hibaüzenetet, vagy null-t ha érvényes.
 * @param {string} email
 * @param {object} [messages] — felülíró üzenetek (DEFAULT_MESSAGES alak)
 * @returns {string|null}
 */
export function getEmailError(email, messages = DEFAULT_MESSAGES) {
  const m = { ...DEFAULT_MESSAGES, ...messages };
  if (!email) return m.emailEmpty;
  if (email.indexOf("@") === -1) return m.emailNoAt;
  const parts = email.split("@");
  if (parts.length !== 2) return m.emailFormat;
  const local = parts[0];
  const domain = parts[1].toLowerCase();
  if (!local) return m.emailNoLocal;
  if (!domain || domain.indexOf(".") === -1) return m.emailNoDomain;
  if (DOMAIN_TYPOS[domain]) {
    return m.emailTypo.replace("{suggestion}", local + "@" + DOMAIN_TYPOS[domain]);
  }
  if (!isValidEmail(email)) return m.emailFormat;
  return null;
}
