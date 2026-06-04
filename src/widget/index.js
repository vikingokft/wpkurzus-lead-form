/**
 * @wpkurzus/lead-form — belépési pont.
 *
 * Az API végpont BE VAN ÉGETVE (DEFAULT_API) — beemeléskor csak a `tag`-et és a
 * `redirect`-et kell megadni (mindkettő KÖTELEZŐ).
 *
 * 1) Auto-init (CDN / WordPress / statikus HTML):
 *    <div data-lead-form data-tag="LM: ..." data-redirect="https://.../koszi/"></div>
 *    <script src=".../lead-form.min.js"></script>
 *
 * 2) Programozott (npm / React / Vite / Next):
 *    import { LeadForm } from "@wpkurzus/lead-form";
 *    import "@wpkurzus/lead-form/styles";
 *    LeadForm.init("#mount", { tag: "LM: ...", redirect: "https://.../koszi/" });
 */

import cssText from "../styles/lead-form.css";
import { renderForm } from "./render.js";
import { bindForm } from "./form.js";
import { initEmailAutocomplete } from "./autocomplete.js";
import { getEmailError, isValidEmail, EMAIL_DOMAINS } from "./validation.js";

// A központi feliratkozási végpont — beégetve, hogy beemeléskor ne kelljen megadni.
// Felülírható: data-api="..." vagy init({ api: "..." }).
const DEFAULT_API = "https://api.vikingodev.hu/lead/v1/subscribe.php";

// Cloudflare Turnstile SITE KEY (publikus) — minden beágyazásnál automatikusan
// megjelenik a botvédelem. Felülírható: data-turnstile-sitekey="...".
// (A SECRET kulcs NEM ide, hanem a szerver lf-config.php-jába megy!)
const DEFAULT_TURNSTILE_SITEKEY = "0x4AAAAAADewU2LMyb2VllLb";

const STYLE_ID = "lf-styles";
const TURNSTILE_SCRIPT_ID = "lf-turnstile-script";

// CSS injektálás egyszer, a <head>-be. Az ESM-fogyasztók külön is
// importálhatják a stíluslapot ("@wpkurzus/lead-form/styles") — a guard
// megakadályozza a dupla beszúrást.
function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = cssText;
  document.head.appendChild(style);
}

function parseJSON(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
}

// data-* attribútumok → konfigurációs objektum.
function cfgFromElement(el) {
  const d = el.dataset;
  return {
    api: d.api, // opcionális — alapból a beégetett DEFAULT_API
    tag: d.tag, // KÖTELEZŐ
    redirect: d.redirect, // KÖTELEZŐ (köszönő oldal URL-je)
    cta: d.cta,
    formTitle: d.formTitle,
    placeholder: d.placeholder,
    theme: d.theme,
    gdprHtml: d.gdprHtml, // ha jelen van, felülírja az alapértelmezettet
    noteHtml: d.noteHtml,
    successMessage: d.successMessage,
    turnstileSitekey: d.turnstileSitekey,
    tracking: parseJSON(d.tracking, null),
    messages: parseJSON(d.messages, null),
  };
}

// Cloudflare Turnstile script betöltése (egyszer) + a megadott konténer renderelése.
function injectTurnstileScript() {
  if (document.getElementById(TURNSTILE_SCRIPT_ID)) return;
  const s = document.createElement("script");
  s.id = TURNSTILE_SCRIPT_ID;
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
}

function renderTurnstile(container, sitekey) {
  injectTurnstileScript();
  let tries = 0;
  const iv = setInterval(() => {
    if (window.turnstile && typeof window.turnstile.render === "function") {
      clearInterval(iv);
      if (!container.dataset.lfTsRendered) {
        container.dataset.lfTsRendered = "1";
        window.turnstile.render(container, { sitekey });
      }
    } else if (++tries > 100) {
      clearInterval(iv); // ~10s után feladjuk
    }
  }, 100);
}

// Visszaadja a hiányzó kötelező mezők listáját (üres = OK).
function missingRequired(cfg) {
  const missing = [];
  if (!cfg.tag) missing.push("tag (data-tag)");
  if (!cfg.redirect) missing.push("redirect (data-redirect)");
  return missing;
}

// Fejlesztőnek szóló, jól látható hibadoboz a mount elembe.
function renderConfigError(mount, missing) {
  const msg =
    "lead-form: hiányzó kötelező mező — " +
    missing.join(", ") +
    ". Példa: <div data-lead-form data-tag=\"LM: PELDA\" " +
    'data-redirect="https://wpkurzus.hu/.../koszi/"></div>';
  console.error("[lead-form] " + msg);
  mount.innerHTML =
    '<div style="font-family:system-ui,sans-serif;font-size:13px;line-height:1.5;' +
    "color:#7f1d1d;background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;" +
    'padding:12px 14px">⚠️ <strong>lead-form beállítási hiba</strong><br>Hiányzik: ' +
    missing.map((m) => "<code>" + m + "</code>").join(", ") +
    "</div>";
}

/**
 * Egy mount elembe rendereli és bekötí a formot.
 * @param {string|HTMLElement} target — szelektor vagy elem
 * @param {object} cfg — { api, funnel, tracking, cta, theme, ... }
 * @returns {HTMLFormElement|null}
 */
function init(target, cfg = {}) {
  ensureStyles();
  const mount =
    typeof target === "string" ? document.querySelector(target) : target;
  if (!mount) {
    console.error("[lead-form] A mount elem nem található:", target);
    return null;
  }
  if (mount.dataset.lfInitialized === "1") return mount.querySelector("form");

  const missing = missingRequired(cfg);
  if (missing.length) {
    renderConfigError(mount, missing);
    return null;
  }
  // API végpont: megadott vagy a beégetett alapértelmezett.
  cfg.api = cfg.api || DEFAULT_API;
  // Turnstile site key: megadott vagy a beégetett alapértelmezett.
  cfg.turnstileSitekey = cfg.turnstileSitekey || DEFAULT_TURNSTILE_SITEKEY || null;

  const form = renderForm(mount, cfg);
  bindForm(form, cfg);

  const emailInput = form.querySelector('input[name="email"]');
  if (emailInput) initEmailAutocomplete(emailInput, { dark: cfg.theme !== "light" });

  if (cfg.turnstileSitekey) {
    const tsEl = form.querySelector(".lf-turnstile");
    if (tsEl) renderTurnstile(tsEl, cfg.turnstileSitekey);
  }

  mount.dataset.lfInitialized = "1";
  return form;
}

/**
 * Felscan-eli a dokumentumot [data-lead-form] elemekért és inicializálja őket.
 * Az IIFE bundle automatikusan meghívja betöltéskor.
 */
function autoInit() {
  if (typeof document === "undefined") return;
  const run = () => {
    document.querySelectorAll("[data-lead-form]").forEach((el) => {
      init(el, cfgFromElement(el));
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}

export const LeadForm = {
  init,
  autoInit,
  // segédfüggvények újrafelhasználáshoz / teszteléshez
  getEmailError,
  isValidEmail,
  EMAIL_DOMAINS,
};

// Named + default export, valamint a globalName (IIFE) számára az autoInit.
export { init, autoInit, getEmailError, isValidEmail, EMAIL_DOMAINS };
export default LeadForm;
