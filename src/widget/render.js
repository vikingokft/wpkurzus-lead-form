/**
 * A form HTML vázának felépítése egy mount elembe.
 *
 * A GDPR szövegek alapból a WPViking Kft.-re vannak állítva, de az init
 * opciókkal felülírhatók (gdprHtml, noteHtml). A markup `lf-` névtérrel
 * van prefixelve, hogy ne ütközzön a host oldal stílusaival.
 */

let uid = 0;

const DEFAULT_GDPR_HTML =
  'Feliratkozom a <strong>WPViking Kft.</strong> hírlevelére és kérem az ingyenes letöltési lehetőséget. ' +
  'Az <a href="https://wpkurzus.hu/adatkezelesi-tajekoztato/" target="_blank" rel="noopener">adatkezelési tájékoztatót</a> ' +
  "elolvastam, megértettem, hogy bármikor leiratkozhatok a hírlevélről.";

const DEFAULT_NOTE_HTML =
  "Tájékoztatunk, hogy a hírlevelünkről történő későbbi leiratkozás nem érinti a letölthető tartalmakhoz való ingyenes hozzáférésed.";

/**
 * @param {HTMLElement} mount — a cél elem, amibe a form rendereli magát
 * @param {object} cfg — feloldott konfiguráció (lásd index.js)
 * @returns {HTMLFormElement}
 */
export function renderForm(mount, cfg) {
  const id = "lf-" + ++uid;
  const cta = escapeHtml(cfg.cta || "Feliratkozom");
  const title = cfg.formTitle ? `<h3 class="lf-title">${escapeHtml(cfg.formTitle)}</h3>` : "";
  const placeholder = escapeHtml(cfg.placeholder || "E-mail cím");
  const gdprHtml = cfg.gdprHtml != null ? cfg.gdprHtml : DEFAULT_GDPR_HTML;
  const noteHtml = cfg.noteHtml != null ? cfg.noteHtml : DEFAULT_NOTE_HTML;
  const note = noteHtml
    ? `<label for="${id}-gdpr" class="lf-consent-note">${noteHtml}</label>`
    : "";

  mount.classList.add("lf-root");
  mount.classList.add(cfg.theme === "light" ? "lf-root--light" : "lf-root--dark");

  mount.innerHTML = `
    <form class="lf-form" novalidate>
      ${title}
      <div class="lf-fields">
        <div class="lf-row">
          <div class="lf-input-wrap">
            <label for="${id}-email" class="lf-sr-only">${placeholder}</label>
            <input type="email" id="${id}-email" name="email" placeholder="${placeholder}"
                   required autocomplete="email" class="lf-input">
          </div>
          <button type="submit" class="lf-btn lf-btn--desktop">${cta}</button>
        </div>

        <div class="lf-error" data-error="email" aria-live="polite"></div>

        <div class="lf-consent">
          <div class="lf-consent-row">
            <input type="checkbox" id="${id}-gdpr" name="gdpr" required class="lf-checkbox">
            <label for="${id}-gdpr" class="lf-consent-label">${gdprHtml}</label>
          </div>
          ${note}
        </div>
        <div class="lf-error" data-error="gdpr" aria-live="polite"></div>

        <button type="submit" class="lf-btn lf-btn--mobile">${cta}</button>
      </div>

      <!-- Honeypot — spam botoknak -->
      <div class="lf-honeypot" aria-hidden="true">
        <input type="text" name="website" tabindex="-1" autocomplete="off">
      </div>

      <div class="lf-message" role="status" aria-live="polite"></div>
    </form>
  `;

  return mount.querySelector("form");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
