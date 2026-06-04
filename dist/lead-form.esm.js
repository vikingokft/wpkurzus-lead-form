/*! @wpkurzus/lead-form — single source of truth lead form. Build: esbuild. */
var T=`/*
 * @wpkurzus/lead-form \u2014 \xF6n\xE1ll\xF3 st\xEDluslap.
 *
 * Nincs Tailwind-f\xFCgg\u0151s\xE9g. Minden sz\xEDn/sug\xE1r CSS-v\xE1ltoz\xF3n kereszt\xFCl t\xE9m\xE1zhat\xF3:
 * \xEDrd fel\xFCl a \`.lf-root { --lf-primary: #... }\` v\xE1ltoz\xF3kat a host oldalon.
 *
 * N\xE9vt\xE9r: minden oszt\xE1ly \`lf-\` prefix\u0171, hogy ne \xFCtk\xF6zz\xF6n a host oldal st\xEDlusaival.
 */

.lf-root {
  /* --- T\xE9m\xE1zhat\xF3 v\xE1ltoz\xF3k (WPKurzus brand alap\xE9rt\xE9kek) --- */
  --lf-primary: #f56f46;
  --lf-primary-hover: #ea5624;
  --lf-heading: #25273e;
  --lf-text: #505164;
  --lf-text-light: #9293a5;
  --lf-surface-dark: #25273e;
  --lf-error: #dc2626;
  --lf-error-dark: #fca5a5;
  --lf-radius-lg: 0.625rem;
  --lf-radius-2xl: 1.25rem;
  --lf-radius-md: 0.5rem;
  --lf-font: inherit;

  box-sizing: border-box;
  font-family: var(--lf-font);
  display: block;
}

.lf-root *,
.lf-root *::before,
.lf-root *::after {
  box-sizing: border-box;
}

/* === K\xE1rtya (a form saj\xE1t h\xE1ttere \u2014 hordozhat\xF3) === */
.lf-form {
  border-radius: var(--lf-radius-2xl);
  padding: 1.5rem;
  position: relative;
}

@media (min-width: 768px) {
  .lf-form {
    padding: 2rem;
  }
}

.lf-root--dark .lf-form {
  background-color: var(--lf-surface-dark);
  color: #fff;
}

/* S\xF6t\xE9t t\xE9m\xE1n bel\xFCl egy finom "frosted" bels\u0151 k\xE1rtya-\xE9rzet */
.lf-root--dark {
  background-color: var(--lf-surface-dark);
  border-radius: var(--lf-radius-2xl);
}

.lf-root--light .lf-form {
  background-color: #fff;
  color: var(--lf-text);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 30px rgba(37, 39, 62, 0.08);
}

/* === C\xEDm === */
.lf-title {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
}
.lf-root--dark .lf-title {
  color: #fff;
}
.lf-root--light .lf-title {
  color: var(--lf-heading);
}
@media (min-width: 768px) {
  .lf-title {
    font-size: 1.25rem;
  }
}

/* === Mez\u0151k layout === */
.lf-fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lf-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lf-input-wrap {
  flex: 1;
}

@media (min-width: 640px) {
  .lf-row {
    flex-direction: row;
  }
}

/* === Input === */
.lf-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem; /* 16px \u2014 iOS zoom elker\xFCl\xE9se mobilon */
  background-color: #fff;
  color: var(--lf-heading);
  border: 2px solid transparent;
  border-radius: var(--lf-radius-lg);
  outline: none;
  transition: border-color 0.2s ease;
}

@media (min-width: 768px) {
  .lf-input {
    font-size: 0.875rem;
  }
}

.lf-input::placeholder {
  color: var(--lf-text-light);
}

.lf-input:focus {
  border-color: var(--lf-primary);
}

.lf-input.has-error {
  border-color: var(--lf-error);
}

/* === Gomb === */
.lf-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--lf-primary);
  color: #fff;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1.75rem;
  font-size: 0.875rem;
  white-space: nowrap;
  border: none;
  border-radius: var(--lf-radius-lg);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.lf-btn:hover {
  background-color: var(--lf-primary-hover);
}

.lf-btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(245, 111, 70, 0.4);
}

.lf-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Desktop gomb a sorban, mobil gomb teljes sz\xE9less\xE9g\u0171 \u2014 reszponz\xEDv v\xE1lt\xE1s */
.lf-btn--desktop {
  display: none;
}
.lf-btn--mobile {
  display: inline-flex;
  width: 100%;
}

@media (min-width: 640px) {
  .lf-btn--desktop {
    display: inline-flex;
  }
  .lf-btn--mobile {
    display: none;
  }
}

/* === GDPR consent ===
   Grid: a checkbox az 1. oszlopban, a c\xEDmke \xC9S a t\xE1j\xE9koztat\xF3 ugyanabban a 2.
   oszlopban \u2014 \xEDgy a k\xE9t sz\xF6veg bal sz\xE9le mindig egy vonalban van, a checkbox
   m\xE9ret\xE9t\u0151l f\xFCggetlen\xFCl (nincs m\xE1gikus padding). */
.lf-consent {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.75rem;
  row-gap: 0.4rem;
  align-items: start;
  padding: 0.25rem 0;
}

.lf-consent-label,
.lf-consent-note {
  grid-column: 2;
  font-size: 11px;
  line-height: 1.35;
  cursor: pointer;
}

.lf-checkbox {
  grid-column: 1;
  grid-row: 1;
}

@media (min-width: 768px) {
  .lf-consent-label,
  .lf-consent-note {
    font-size: 0.75rem;
    line-height: 1.5;
  }
}

.lf-root--dark .lf-consent-label,
.lf-root--dark .lf-consent-note {
  color: rgba(255, 255, 255, 0.75);
}
.lf-root--light .lf-consent-label,
.lf-root--light .lf-consent-note {
  color: var(--lf-text-light);
}

.lf-consent-label a {
  text-decoration: underline;
  color: inherit;
}
.lf-root--dark .lf-consent-label a {
  color: #fff;
}
.lf-root--light .lf-consent-label a {
  color: var(--lf-primary);
}

/* === Checkbox (custom) === */
.lf-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
  border: 2px solid rgba(0, 0, 0, 0.25);
  border-radius: 0.3rem;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.lf-root--dark .lf-checkbox {
  border-color: rgba(255, 255, 255, 0.35);
}
.lf-checkbox:hover {
  border-color: var(--lf-primary);
}
.lf-root--dark .lf-checkbox:hover {
  border-color: rgba(255, 255, 255, 0.6);
}
.lf-checkbox:checked {
  background-color: var(--lf-primary);
  border-color: var(--lf-primary);
}
.lf-checkbox:checked::after {
  content: "";
  position: absolute;
  top: 1px;
  left: 5px;
  width: 5px;
  height: 10px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.lf-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(245, 111, 70, 0.3);
}

/* === Mez\u0151 hib\xE1k === */
.lf-error {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: none;
  color: var(--lf-error);
}
.lf-root--dark .lf-error {
  color: var(--lf-error-dark);
}
.lf-error.visible {
  display: block;
}

/* === Form \xFCzenet (siker/hiba) === */
.lf-message {
  display: none;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: var(--lf-radius-md);
  color: #fff;
}
.lf-message.visible {
  display: block;
}
.lf-message--error {
  background-color: var(--lf-error);
}
.lf-message--success {
  background-color: #00aa5b;
}

/* Loading \xE1llapot */
.lf-loading .lf-btn {
  opacity: 0.7;
  cursor: wait;
}

/* === Cloudflare Turnstile === */
.lf-turnstile {
  min-height: 65px;
}
.lf-turnstile:empty {
  min-height: 0;
}

/* === Honeypot \u2014 vizu\xE1lisan rejtve === */
.lf-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* === K\xE9perny\u0151olvas\xF3-only label === */
.lf-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ======================
   EMAIL DOMAIN AUTOCOMPLETE
   (a dropdown a <body>-hoz f\u0171z\u0151dik, ez\xE9rt NEM az .lf-root alatt van)
   ====================== */
.lf-domain-dropdown {
  z-index: 99999;
  background: #fff;
  border: 1px solid #e2e4f0;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-width: calc(100vw - 32px);
  font-family: inherit;
}

.lf-domain-item {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  color: #505164;
  transition: background-color 0.1s ease;
}

.lf-domain-item:hover,
.lf-domain-item.active {
  background-color: #f5f6fc;
}

.lf-domain-local {
  color: #25273e;
}

.lf-domain-at {
  color: #9293a5;
  font-weight: 600;
}

/* S\xF6t\xE9t dropdown (dark t\xE9ma) */
.lf-domain-dropdown--dark {
  background: #3d4275;
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.lf-domain-dropdown--dark .lf-domain-item {
  color: #fff;
}
.lf-domain-dropdown--dark .lf-domain-item:hover,
.lf-domain-dropdown--dark .lf-domain-item.active {
  background-color: rgba(255, 255, 255, 0.12);
}
.lf-domain-dropdown--dark .lf-domain-local {
  color: #fff;
  font-weight: 600;
}
.lf-domain-dropdown--dark .lf-domain-at {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}
`;var H=0,j="T\xF6ltsd le ingyen, \xE9s iratkozz fel h\xEDrlevel\xFCnkre!",P='Feliratkozom a <strong>WPViking Kft.</strong> h\xEDrlevel\xE9re \xE9s k\xE9rem az ingyenes let\xF6lt\xE9si lehet\u0151s\xE9get. Az <a href="https://wpkurzus.hu/adatkezelesi-tajekoztato/" target="_blank" rel="noopener">adatkezel\xE9si t\xE1j\xE9koztat\xF3t</a> elolvastam, meg\xE9rtettem, hogy b\xE1rmikor leiratkozhatok a h\xEDrlev\xE9lr\u0151l.',U="T\xE1j\xE9koztatunk, hogy a h\xEDrlevel\xFCnkr\u0151l t\xF6rt\xE9n\u0151 k\xE9s\u0151bbi leiratkoz\xE1s nem \xE9rinti a let\xF6lthet\u0151 tartalmakhoz val\xF3 ingyenes hozz\xE1f\xE9r\xE9sed.";function _(e,t){let o="lf-"+ ++H,r=x(t.cta||"Feliratkozom"),n=t.formTitle!=null?t.formTitle:j,d=n?`<h3 class="lf-title">${x(n)}</h3>`:"",c=x(t.placeholder||"E-mail c\xEDm"),l=t.turnstileSitekey?`<div class="lf-turnstile" data-sitekey="${x(t.turnstileSitekey)}"></div>`:"",i=t.gdprHtml!=null?t.gdprHtml:P,a=t.noteHtml!=null?t.noteHtml:U,s=a?`<label for="${o}-gdpr" class="lf-consent-note">${a}</label>`:"";return e.classList.add("lf-root"),e.classList.add(t.theme==="light"?"lf-root--light":"lf-root--dark"),e.innerHTML=`
    <form class="lf-form" novalidate>
      ${d}
      <div class="lf-fields">
        <div class="lf-row">
          <div class="lf-input-wrap">
            <label for="${o}-email" class="lf-sr-only">${c}</label>
            <input type="email" id="${o}-email" name="email" placeholder="${c}"
                   required autocomplete="email" class="lf-input">
          </div>
          <button type="submit" class="lf-btn lf-btn--desktop">${r}</button>
        </div>

        <div class="lf-error" data-error="email" aria-live="polite"></div>

        <div class="lf-consent">
          <input type="checkbox" id="${o}-gdpr" name="gdpr" required class="lf-checkbox">
          <label for="${o}-gdpr" class="lf-consent-label">${i}</label>
          ${s}
        </div>
        <div class="lf-error" data-error="gdpr" aria-live="polite"></div>

        ${l}

        <button type="submit" class="lf-btn lf-btn--mobile">${r}</button>
      </div>

      <!-- Honeypot \u2014 spam botoknak -->
      <div class="lf-honeypot" aria-hidden="true">
        <input type="text" name="website" tabindex="-1" autocomplete="off">
      </div>

      <div class="lf-message" role="status" aria-live="polite"></div>
    </form>
  `,e.querySelector("form")}function x(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}var g=["gmail.com","freemail.hu","hotmail.com","yahoo.com","icloud.com","t-online.hu","outlook.com","outlook.hu","hotmail.hu"],A={"gmial.com":"gmail.com","gmai.com":"gmail.com","gamil.com":"gmail.com","gmail.co":"gmail.com","gmail.cm":"gmail.com","gmail.con":"gmail.com","gmail.om":"gmail.com","gmal.com":"gmail.com","gnail.com":"gmail.com","gmil.com":"gmail.com","gmail.hu":"gmail.com","hotmal.com":"hotmail.com","hotmai.com":"hotmail.com","hotmail.co":"hotmail.com","hotmail.con":"hotmail.com","outloo.com":"outlook.com","outlok.com":"outlook.com","yaho.com":"yahoo.com","yahooo.com":"yahoo.com","yahoo.co":"yahoo.com","yahoo.con":"yahoo.com","citromail.h":"citromail.hu","citromail.u":"citromail.hu","freemail.h":"freemail.hu","freemail.u":"freemail.hu"},w={emailEmpty:"Add meg az e-mail c\xEDmed.",emailNoAt:"Hi\xE1nyzik a @ karakter az e-mail c\xEDmb\u0151l.",emailFormat:"Az e-mail c\xEDm form\xE1tuma nem megfelel\u0151.",emailNoLocal:"Hi\xE1nyzik a felhaszn\xE1l\xF3n\xE9v a @ el\u0151tt.",emailNoDomain:"Hi\xE1nyzik vagy hib\xE1s a domain (pl. gmail.com).",emailTypo:"Elg\xE9pelted? Helyesen: {suggestion}",gdprRequired:"Az adatkezel\xE9si t\xE1j\xE9koztat\xF3 elfogad\xE1sa k\xF6telez\u0151.",turnstileRequired:"K\xE9rlek, igazold, hogy nem vagy robot.",networkError:"H\xE1l\xF3zati hiba. K\xE9rj\xFCk, pr\xF3b\xE1ld \xFAjra.",genericError:"Hiba t\xF6rt\xE9nt. K\xE9rj\xFCk, pr\xF3b\xE1ld \xFAjra."};function z(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function b(e,t=w){let o={...w,...t};if(!e)return o.emailEmpty;if(e.indexOf("@")===-1)return o.emailNoAt;let r=e.split("@");if(r.length!==2)return o.emailFormat;let n=r[0],d=r[1].toLowerCase();return n?!d||d.indexOf(".")===-1?o.emailNoDomain:A[d]?o.emailTypo.replace("{suggestion}",n+"@"+A[d]):z(e)?null:o.emailFormat:o.emailNoLocal}var $=15e3,S="lf_pushed_events";function y(e,t,o){let r=e.querySelector('[data-error="'+t+'"]');r&&(o?(r.textContent=o,r.classList.add("visible")):(r.textContent="",r.classList.remove("visible")))}function R(e){e.querySelectorAll("[data-error]").forEach(t=>{t.textContent="",t.classList.remove("visible")}),e.querySelectorAll(".has-error").forEach(t=>t.classList.remove("has-error"))}function k(e,t,o){let r=e.querySelector(".lf-message");r&&(r.textContent=t,r.classList.toggle("lf-message--error",!!o),r.classList.toggle("lf-message--success",!o),r.classList.add("visible"))}function E(e,t){e.querySelectorAll('[type="submit"]').forEach(o=>{o.disabled=t}),e.classList.toggle("lf-loading",t)}function K(e){try{return JSON.parse(sessionStorage.getItem(S)||"[]").indexOf(e)!==-1}catch{return!1}}function G(e){try{let t=JSON.parse(sessionStorage.getItem(S)||"[]");t.push(e),sessionStorage.setItem(S,JSON.stringify(t))}catch{}}function J(e,t,o){t&&(K(e.event_id)||(window.dataLayer=window.dataLayer||[],window.dataLayer.push({event:"lead",event_id:e.event_id,funnel_id:t.funnel_id,funnel_name:t.funnel_name,lead_source:t.lead_source,lead_type:t.lead_type,customer_email:o,page_path:window.location.pathname,page_url:window.location.href,page_referrer:document.referrer||"",ts:e.ts}),G(e.event_id)))}function I(e,t){let o={...w,...t.messages||{}},r=e.querySelector('input[name="email"]');r&&(r.addEventListener("blur",function(){let d=(this.value||"").trim();if(!d)return;let c=b(d,o);c?(this.classList.add("has-error"),y(e,"email",c)):(this.classList.remove("has-error"),y(e,"email",null))}),r.addEventListener("input",function(){this.classList.remove("has-error"),y(e,"email",null)}));let n=!1;e.addEventListener("submit",function(d){if(d.preventDefault(),n)return;n=!0,R(e);let c=e.querySelector('input[name="email"]'),l=e.querySelector('input[name="gdpr"]'),i=e.querySelector('input[name="website"]'),a=(c.value||"").trim();if(i?(i.value||"").trim():""){k(e,"K\xF6sz\xF6nj\xFCk a feliratkoz\xE1st!",!1);return}let u=!1,p=b(a,o);p&&(y(e,"email",p),c&&c.classList.add("has-error"),u=!0),l&&!l.checked&&(y(e,"gdpr",o.gdprRequired),u=!0);let m="";if(t.turnstileSitekey){let f=e.querySelector('[name="cf-turnstile-response"]');m=f?(f.value||"").trim():"",m||(k(e,o.turnstileRequired,!0),u=!0)}if(u){n=!1;return}E(e,!0);let v={email:a,tag:t.tag,redirect_url:t.redirect};m&&(v.turnstile_token=m);let L=new AbortController,q=setTimeout(()=>L.abort(),$);fetch(t.api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(v),signal:L.signal}).then(f=>(clearTimeout(q),f.json().then(h=>({ok:f.ok,data:h})))).then(f=>{if(f.ok&&f.data.success){J(f.data,t.tracking,a);try{sessionStorage.setItem("lf_email",a)}catch{}typeof t.onSuccess=="function"&&t.onSuccess(f.data,a),!t.noRedirect&&f.data.redirect_url?setTimeout(()=>{window.location.href=f.data.redirect_url},300):(n=!1,E(e,!1),k(e,t.successMessage||"K\xF6sz\xF6nj\xFCk a feliratkoz\xE1st!",!1))}else{n=!1,E(e,!1);let h=f.data&&f.data.error||o.genericError;k(e,h,!0),typeof t.onError=="function"&&t.onError(h)}}).catch(()=>{n=!1,E(e,!1),k(e,o.networkError,!0),typeof t.onError=="function"&&t.onError(o.networkError)})})}var Y=1,B=3;function M(e,t={}){let o=document.createElement("div");o.className="lf-domain-dropdown",t.dark&&o.classList.add("lf-domain-dropdown--dark"),o.style.display="none",o.style.position="fixed",document.body.appendChild(o);let r=-1;function n(){let l=e.getBoundingClientRect();o.style.left=l.left+"px",o.style.width=l.width+"px",o.style.top=l.bottom+4+"px"}function d(l){let i=l.lastIndexOf("@");if(i===-1||i===0)return[];let a=l.substring(0,i),s=l.substring(i+1).toLowerCase();if(!a)return[];if(s&&s.indexOf(".")!==-1&&g.indexOf(s)!==-1)return[];let u=g.filter(m=>m.indexOf(s)===0),p=s.length>0?B:Y;return u.slice(0,p).map(m=>a+"@"+m)}function c(l){if(!l.length){o.style.display="none",r=-1;return}o.innerHTML="",l.forEach((i,a)=>{let s=document.createElement("div");s.className="lf-domain-item"+(a===r?" active":"");let u=i.indexOf("@"),p=document.createElement("span");p.className="lf-domain-local",p.textContent=i.substring(0,u);let m=document.createElement("span");m.className="lf-domain-at",m.textContent="@"+i.substring(u+1),s.appendChild(p),s.appendChild(m),s.addEventListener("mousedown",v=>{v.preventDefault(),e.value=i,o.style.display="none",r=-1,e.focus(),e.dispatchEvent(new Event("input",{bubbles:!0}))}),o.appendChild(s)}),n(),o.style.display="block"}e.addEventListener("input",function(){r=-1,c(d(this.value||""))}),e.addEventListener("keydown",function(l){let i=o.querySelectorAll(".lf-domain-item");if(!(!i.length||o.style.display==="none"))if(l.key==="ArrowDown")l.preventDefault(),r=Math.min(r+1,i.length-1),i.forEach((a,s)=>a.classList.toggle("active",s===r));else if(l.key==="ArrowUp")l.preventDefault(),r=Math.max(r-1,0),i.forEach((a,s)=>a.classList.toggle("active",s===r));else if((l.key==="Enter"||l.key==="Tab")&&r>=0){l.preventDefault();let a=i[r];a&&(e.value=a.textContent,o.style.display="none",r=-1,e.dispatchEvent(new Event("input",{bubbles:!0})))}else l.key==="Escape"&&(o.style.display="none",r=-1)}),e.addEventListener("blur",function(){setTimeout(()=>{o.style.display="none",r=-1},150)}),window.addEventListener("scroll",()=>{o.style.display!=="none"&&n()},!0),window.addEventListener("resize",()=>{o.style.display!=="none"&&n()})}var V="https://api.vikingodev.hu/lead/v1/subscribe.php",W="0x4AAAAAADewU2LMyb2VllLb",D="lf-styles",N="lf-turnstile-script";function X(){if(typeof document>"u"||document.getElementById(D))return;let e=document.createElement("style");e.id=D,e.textContent=T,document.head.appendChild(e)}function O(e,t){if(!e)return t;try{return JSON.parse(e)}catch{return t}}function Q(e){let t=e.dataset;return{api:t.api,tag:t.tag,redirect:t.redirect,cta:t.cta,formTitle:t.formTitle,placeholder:t.placeholder,theme:t.theme,gdprHtml:t.gdprHtml,noteHtml:t.noteHtml,successMessage:t.successMessage,turnstileSitekey:t.turnstileSitekey,tracking:O(t.tracking,null),messages:O(t.messages,null)}}function Z(){if(document.getElementById(N))return;let e=document.createElement("script");e.id=N,e.src="https://challenges.cloudflare.com/turnstile/v0/api.js",e.async=!0,e.defer=!0,document.head.appendChild(e)}function ee(e,t){Z();let o=0,r=setInterval(()=>{window.turnstile&&typeof window.turnstile.render=="function"?(clearInterval(r),e.dataset.lfTsRendered||(e.dataset.lfTsRendered="1",window.turnstile.render(e,{sitekey:t}))):++o>100&&clearInterval(r)},100)}function te(e){let t=[];return e.tag||t.push("tag (data-tag)"),e.redirect||t.push("redirect (data-redirect)"),t}function oe(e,t){let o="lead-form: hi\xE1nyz\xF3 k\xF6telez\u0151 mez\u0151 \u2014 "+t.join(", ")+'. P\xE9lda: <div data-lead-form data-tag="LM: PELDA" data-redirect="https://wpkurzus.hu/.../koszi/"></div>';console.error("[lead-form] "+o),e.innerHTML='<div style="font-family:system-ui,sans-serif;font-size:13px;line-height:1.5;color:#7f1d1d;background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:12px 14px">\u26A0\uFE0F <strong>lead-form be\xE1ll\xEDt\xE1si hiba</strong><br>Hi\xE1nyzik: '+t.map(r=>"<code>"+r+"</code>").join(", ")+"</div>"}function C(e,t={}){X();let o=typeof e=="string"?document.querySelector(e):e;if(!o)return console.error("[lead-form] A mount elem nem tal\xE1lhat\xF3:",e),null;if(o.dataset.lfInitialized==="1")return o.querySelector("form");let r=te(t);if(r.length)return oe(o,r),null;t.api=t.api||V,t.turnstileSitekey=t.turnstileSitekey||W||null;let n=_(o,t);I(n,t);let d=n.querySelector('input[name="email"]');if(d&&M(d,{dark:t.theme!=="light"}),t.turnstileSitekey){let c=n.querySelector(".lf-turnstile");c&&ee(c,t.turnstileSitekey)}return o.dataset.lfInitialized="1",n}function re(){if(typeof document>"u")return;let e=()=>{document.querySelectorAll("[data-lead-form]").forEach(t=>{C(t,Q(t))})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e):e()}var le={init:C,autoInit:re,getEmailError:b,isValidEmail:z,EMAIL_DOMAINS:g};var be=le;export{g as EMAIL_DOMAINS,le as LeadForm,re as autoInit,be as default,b as getEmailError,C as init,z as isValidEmail};
//# sourceMappingURL=lead-form.esm.js.map
