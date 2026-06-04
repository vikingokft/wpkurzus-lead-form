/**
 * Form viselkedés: valós idejű validáció, honeypot, beküldés (fetch + timeout),
 * loading állapot, dupla-beküldés védelem, GTM dataLayer `lead` event.
 *
 * A backend csak a `funnel_slug`-ot + emailt kapja — a tageket és a listát a
 * szerver oldali registry oldja fel (a kliens nem tud taget megadni → biztonságos).
 */

import { getEmailError, DEFAULT_MESSAGES } from "./validation.js";

const SUBMIT_TIMEOUT_MS = 15000;
const DEDUP_KEY = "lf_pushed_events";

function showFieldError(form, fieldName, message) {
  const el = form.querySelector('[data-error="' + fieldName + '"]');
  if (!el) return;
  if (message) {
    el.textContent = message;
    el.classList.add("visible");
  } else {
    el.textContent = "";
    el.classList.remove("visible");
  }
}

function clearFieldErrors(form) {
  form.querySelectorAll("[data-error]").forEach((el) => {
    el.textContent = "";
    el.classList.remove("visible");
  });
  form.querySelectorAll(".has-error").forEach((el) => el.classList.remove("has-error"));
}

function showFormMessage(form, message, isError) {
  const el = form.querySelector(".lf-message");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("lf-message--error", !!isError);
  el.classList.toggle("lf-message--success", !isError);
  el.classList.add("visible");
}

function setLoading(form, isLoading) {
  form.querySelectorAll('[type="submit"]').forEach((btn) => {
    btn.disabled = isLoading;
  });
  form.classList.toggle("lf-loading", isLoading);
}

function isDuplicate(eventId) {
  try {
    const pushed = JSON.parse(sessionStorage.getItem(DEDUP_KEY) || "[]");
    return pushed.indexOf(eventId) !== -1;
  } catch (e) {
    return false;
  }
}

function markAsPushed(eventId) {
  try {
    const pushed = JSON.parse(sessionStorage.getItem(DEDUP_KEY) || "[]");
    pushed.push(eventId);
    sessionStorage.setItem(DEDUP_KEY, JSON.stringify(pushed));
  } catch (e) {}
}

function pushLeadEvent(serverResponse, tracking, email) {
  if (!tracking) return;
  if (isDuplicate(serverResponse.event_id)) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "lead",
    event_id: serverResponse.event_id,
    funnel_id: tracking.funnel_id,
    funnel_name: tracking.funnel_name,
    lead_source: tracking.lead_source,
    lead_type: tracking.lead_type,
    customer_email: email,
    page_path: window.location.pathname,
    page_url: window.location.href,
    page_referrer: document.referrer || "",
    ts: serverResponse.ts,
  });
  markAsPushed(serverResponse.event_id);
}

/**
 * Beköti a viselkedést egy form elemre.
 * @param {HTMLFormElement} form
 * @param {object} cfg — feloldott konfiguráció (api, funnel, tracking, messages, callbacks…)
 */
export function bindForm(form, cfg) {
  const messages = { ...DEFAULT_MESSAGES, ...(cfg.messages || {}) };

  // Valós idejű email validáció.
  const emailField = form.querySelector('input[name="email"]');
  if (emailField) {
    emailField.addEventListener("blur", function () {
      const val = (this.value || "").trim();
      if (!val) return;
      const err = getEmailError(val, messages);
      if (err) {
        this.classList.add("has-error");
        showFieldError(form, "email", err);
      } else {
        this.classList.remove("has-error");
        showFieldError(form, "email", null);
      }
    });
    emailField.addEventListener("input", function () {
      this.classList.remove("has-error");
      showFieldError(form, "email", null);
    });
  }

  let isSubmitting = false;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;
    clearFieldErrors(form);

    const emailInput = form.querySelector('input[name="email"]');
    const gdprInput = form.querySelector('input[name="gdpr"]');
    const honeypotInput = form.querySelector('input[name="website"]');

    const email = (emailInput.value || "").trim();
    const honeypot = honeypotInput ? (honeypotInput.value || "").trim() : "";

    // Honeypot: ha kitöltött, csendben "sikert" mutatunk, de nem küldünk.
    if (honeypot) {
      showFormMessage(form, "Köszönjük a feliratkozást!", false);
      return;
    }

    let hasError = false;

    const emailError = getEmailError(email, messages);
    if (emailError) {
      showFieldError(form, "email", emailError);
      if (emailInput) emailInput.classList.add("has-error");
      hasError = true;
    }

    if (gdprInput && !gdprInput.checked) {
      showFieldError(form, "gdpr", messages.gdprRequired);
      hasError = true;
    }

    if (hasError) {
      isSubmitting = false;
      return;
    }

    setLoading(form, true);

    const body = { email: email, funnel_slug: cfg.funnel };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

    fetch(cfg.api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then((response) => {
        clearTimeout(timeout);
        return response.json().then((data) => ({ ok: response.ok, data }));
      })
      .then((result) => {
        if (result.ok && result.data.success) {
          pushLeadEvent(result.data, cfg.tracking, email);
          try {
            sessionStorage.setItem("lf_email", email);
          } catch (e) {}

          if (typeof cfg.onSuccess === "function") {
            cfg.onSuccess(result.data, email);
          }
          // Átirányítás, ha a szerver adott redirect URL-t és nincs letiltva.
          if (cfg.redirect !== false && result.data.redirect_url) {
            setTimeout(() => {
              window.location.href = result.data.redirect_url;
            }, 300);
          } else {
            isSubmitting = false;
            setLoading(form, false);
            showFormMessage(form, cfg.successMessage || "Köszönjük a feliratkozást!", false);
          }
        } else {
          isSubmitting = false;
          setLoading(form, false);
          const msg = (result.data && result.data.error) || messages.genericError;
          showFormMessage(form, msg, true);
          if (typeof cfg.onError === "function") cfg.onError(msg);
        }
      })
      .catch(() => {
        isSubmitting = false;
        setLoading(form, false);
        showFormMessage(form, messages.networkError, true);
        if (typeof cfg.onError === "function") cfg.onError(messages.networkError);
      });
  });
}
