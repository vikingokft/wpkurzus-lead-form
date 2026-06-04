/**
 * @wpkurzus/lead-form — belépési pont.
 *
 * Kétféle használat ugyanabból a bundle-ből:
 *
 * 1) Auto-init (CDN / WordPress / statikus HTML):
 *    <div data-lead-form data-api="..." data-funnel="..."></div>
 *    <script src=".../lead-form.min.js"></script>
 *    → a bundle betöltéskor felscan-eli a [data-lead-form] elemeket.
 *
 * 2) Programozott (npm / React / Vite / Next):
 *    import { LeadForm } from "@wpkurzus/lead-form";
 *    import "@wpkurzus/lead-form/styles";
 *    LeadForm.init("#mount", { api, funnel, tracking, ... });
 */

import cssText from "../styles/lead-form.css";
import { renderForm } from "./render.js";
import { bindForm } from "./form.js";
import { initEmailAutocomplete } from "./autocomplete.js";
import { getEmailError, isValidEmail, EMAIL_DOMAINS } from "./validation.js";

const STYLE_ID = "lf-styles";

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
    api: d.api,
    funnel: d.funnel,
    cta: d.cta,
    formTitle: d.formTitle,
    placeholder: d.placeholder,
    theme: d.theme,
    gdprHtml: d.gdprHtml, // ha jelen van, felülírja az alapértelmezettet
    noteHtml: d.noteHtml,
    successMessage: d.successMessage,
    redirect: d.redirect === "false" ? false : undefined,
    tracking: parseJSON(d.tracking, null),
    messages: parseJSON(d.messages, null),
  };
}

function validateConfig(cfg) {
  if (!cfg.api) {
    console.error("[lead-form] Hiányzó kötelező mező: api (data-api).");
    return false;
  }
  if (!cfg.funnel) {
    console.error("[lead-form] Hiányzó kötelező mező: funnel (data-funnel).");
    return false;
  }
  return true;
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
  if (!validateConfig(cfg)) return null;

  const form = renderForm(mount, cfg);
  bindForm(form, cfg);

  const emailInput = form.querySelector('input[name="email"]');
  if (emailInput) initEmailAutocomplete(emailInput, { dark: cfg.theme !== "light" });

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
