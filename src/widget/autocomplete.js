/**
 * Email domain autocomplete dropdown.
 *
 * Az input `@` utáni része alapján javasol domaineket (EMAIL_DOMAINS).
 * Fixed pozícionálás a viewporthoz, hogy ne vágja le az overflow.
 * Billentyűzet-támogatás (fel/le/Enter/Tab/Escape). XSS-biztos (textContent).
 */

import { EMAIL_DOMAINS } from "./validation.js";

const MAX_RESULTS_EMPTY = 1; // csak @ után, szűrés nélkül: csak a top találat
const MAX_RESULTS_TYPING = 3; // gépelés közben max ennyi

/**
 * @param {HTMLInputElement} input
 * @param {{ dark?: boolean }} [opts]
 */
export function initEmailAutocomplete(input, opts = {}) {
  const dropdown = document.createElement("div");
  dropdown.className = "lf-domain-dropdown";
  if (opts.dark) dropdown.classList.add("lf-domain-dropdown--dark");
  dropdown.style.display = "none";
  dropdown.style.position = "fixed";
  document.body.appendChild(dropdown);

  let activeIndex = -1;

  function positionDropdown() {
    const rect = input.getBoundingClientRect();
    dropdown.style.left = rect.left + "px";
    dropdown.style.width = rect.width + "px";
    dropdown.style.top = rect.bottom + 4 + "px";
  }

  function getMatches(value) {
    const atPos = value.lastIndexOf("@");
    if (atPos === -1 || atPos === 0) return [];
    const local = value.substring(0, atPos);
    const partial = value.substring(atPos + 1).toLowerCase();
    if (!local) return [];
    // Ha már teljes és valid domain van, ne mutassuk.
    if (partial && partial.indexOf(".") !== -1) {
      if (EMAIL_DOMAINS.indexOf(partial) !== -1) return [];
    }
    const matches = EMAIL_DOMAINS.filter((d) => d.indexOf(partial) === 0);
    const limit = partial.length > 0 ? MAX_RESULTS_TYPING : MAX_RESULTS_EMPTY;
    return matches.slice(0, limit).map((d) => local + "@" + d);
  }

  function render(matches) {
    if (!matches.length) {
      dropdown.style.display = "none";
      activeIndex = -1;
      return;
    }
    dropdown.innerHTML = "";
    matches.forEach((email, i) => {
      const item = document.createElement("div");
      item.className = "lf-domain-item" + (i === activeIndex ? " active" : "");
      const atPos = email.indexOf("@");
      const localSpan = document.createElement("span");
      localSpan.className = "lf-domain-local";
      localSpan.textContent = email.substring(0, atPos);
      const atSpan = document.createElement("span");
      atSpan.className = "lf-domain-at";
      atSpan.textContent = "@" + email.substring(atPos + 1);
      item.appendChild(localSpan);
      item.appendChild(atSpan);
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = email;
        dropdown.style.display = "none";
        activeIndex = -1;
        input.focus();
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      dropdown.appendChild(item);
    });
    positionDropdown();
    dropdown.style.display = "block";
  }

  input.addEventListener("input", function () {
    activeIndex = -1;
    render(getMatches(this.value || ""));
  });

  input.addEventListener("keydown", function (e) {
    const items = dropdown.querySelectorAll(".lf-domain-item");
    if (!items.length || dropdown.style.display === "none") return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    } else if ((e.key === "Enter" || e.key === "Tab") && activeIndex >= 0) {
      e.preventDefault();
      const selected = items[activeIndex];
      if (selected) {
        input.value = selected.textContent;
        dropdown.style.display = "none";
        activeIndex = -1;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } else if (e.key === "Escape") {
      dropdown.style.display = "none";
      activeIndex = -1;
    }
  });

  input.addEventListener("blur", function () {
    // Kis késleltetés, hogy a mousedown lefuthasson a dropdown elemen.
    setTimeout(() => {
      dropdown.style.display = "none";
      activeIndex = -1;
    }, 150);
  });

  window.addEventListener(
    "scroll",
    () => {
      if (dropdown.style.display !== "none") positionDropdown();
    },
    true
  );
  window.addEventListener("resize", () => {
    if (dropdown.style.display !== "none") positionDropdown();
  });
}
