/*! @wpkurzus/lead-form — single source of truth lead form. Build: esbuild. */
var L=`/*
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

/* === GDPR consent === */
.lf-consent {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.lf-consent-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.lf-consent-label,
.lf-consent-note {
  font-size: 11px;
  line-height: 1.35;
  cursor: pointer;
}

@media (min-width: 768px) {
  .lf-consent-label,
  .lf-consent-note {
    font-size: 0.75rem;
    line-height: 1.5;
  }
}

.lf-consent-note {
  display: block;
  padding-left: 2rem;
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
`;var C=0,q='Feliratkozom a <strong>WPViking Kft.</strong> h\xEDrlevel\xE9re \xE9s k\xE9rem az ingyenes let\xF6lt\xE9si lehet\u0151s\xE9get. Az <a href="https://wpkurzus.hu/adatkezelesi-tajekoztato/" target="_blank" rel="noopener">adatkezel\xE9si t\xE1j\xE9koztat\xF3t</a> elolvastam, meg\xE9rtettem, hogy b\xE1rmikor leiratkozhatok a h\xEDrlev\xE9lr\u0151l.',F="T\xE1j\xE9koztatunk, hogy a h\xEDrlevel\xFCnkr\u0151l t\xF6rt\xE9n\u0151 k\xE9s\u0151bbi leiratkoz\xE1s nem \xE9rinti a let\xF6lthet\u0151 tartalmakhoz val\xF3 ingyenes hozz\xE1f\xE9r\xE9sed.";function _(e,o){let t="lf-"+ ++C,r=E(o.cta||"Feliratkozom"),n=o.formTitle?`<h3 class="lf-title">${E(o.formTitle)}</h3>`:"",d=E(o.placeholder||"E-mail c\xEDm"),f=o.gdprHtml!=null?o.gdprHtml:q,l=o.noteHtml!=null?o.noteHtml:F,a=l?`<label for="${t}-gdpr" class="lf-consent-note">${l}</label>`:"";return e.classList.add("lf-root"),e.classList.add(o.theme==="light"?"lf-root--light":"lf-root--dark"),e.innerHTML=`
    <form class="lf-form" novalidate>
      ${n}
      <div class="lf-fields">
        <div class="lf-row">
          <div class="lf-input-wrap">
            <label for="${t}-email" class="lf-sr-only">${d}</label>
            <input type="email" id="${t}-email" name="email" placeholder="${d}"
                   required autocomplete="email" class="lf-input">
          </div>
          <button type="submit" class="lf-btn lf-btn--desktop">${r}</button>
        </div>

        <div class="lf-error" data-error="email" aria-live="polite"></div>

        <div class="lf-consent">
          <div class="lf-consent-row">
            <input type="checkbox" id="${t}-gdpr" name="gdpr" required class="lf-checkbox">
            <label for="${t}-gdpr" class="lf-consent-label">${f}</label>
          </div>
          ${a}
        </div>
        <div class="lf-error" data-error="gdpr" aria-live="polite"></div>

        <button type="submit" class="lf-btn lf-btn--mobile">${r}</button>
      </div>

      <!-- Honeypot \u2014 spam botoknak -->
      <div class="lf-honeypot" aria-hidden="true">
        <input type="text" name="website" tabindex="-1" autocomplete="off">
      </div>

      <div class="lf-message" role="status" aria-live="polite"></div>
    </form>
  `,e.querySelector("form")}function E(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}var g=["gmail.com","freemail.hu","hotmail.com","yahoo.com","icloud.com","t-online.hu","outlook.com","outlook.hu","hotmail.hu"],T={"gmial.com":"gmail.com","gmai.com":"gmail.com","gamil.com":"gmail.com","gmail.co":"gmail.com","gmail.cm":"gmail.com","gmail.con":"gmail.com","gmail.om":"gmail.com","gmal.com":"gmail.com","gnail.com":"gmail.com","gmil.com":"gmail.com","gmail.hu":"gmail.com","hotmal.com":"hotmail.com","hotmai.com":"hotmail.com","hotmail.co":"hotmail.com","hotmail.con":"hotmail.com","outloo.com":"outlook.com","outlok.com":"outlook.com","yaho.com":"yahoo.com","yahooo.com":"yahoo.com","yahoo.co":"yahoo.com","yahoo.con":"yahoo.com","citromail.h":"citromail.hu","citromail.u":"citromail.hu","freemail.h":"freemail.hu","freemail.u":"freemail.hu"},v={emailEmpty:"Add meg az e-mail c\xEDmed.",emailNoAt:"Hi\xE1nyzik a @ karakter az e-mail c\xEDmb\u0151l.",emailFormat:"Az e-mail c\xEDm form\xE1tuma nem megfelel\u0151.",emailNoLocal:"Hi\xE1nyzik a felhaszn\xE1l\xF3n\xE9v a @ el\u0151tt.",emailNoDomain:"Hi\xE1nyzik vagy hib\xE1s a domain (pl. gmail.com).",emailTypo:"Elg\xE9pelted? Helyesen: {suggestion}",gdprRequired:"Az adatkezel\xE9si t\xE1j\xE9koztat\xF3 elfogad\xE1sa k\xF6telez\u0151.",networkError:"H\xE1l\xF3zati hiba. K\xE9rj\xFCk, pr\xF3b\xE1ld \xFAjra.",genericError:"Hiba t\xF6rt\xE9nt. K\xE9rj\xFCk, pr\xF3b\xE1ld \xFAjra."};function z(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function b(e,o=v){let t={...v,...o};if(!e)return t.emailEmpty;if(e.indexOf("@")===-1)return t.emailNoAt;let r=e.split("@");if(r.length!==2)return t.emailFormat;let n=r[0],d=r[1].toLowerCase();return n?!d||d.indexOf(".")===-1?t.emailNoDomain:T[d]?t.emailTypo.replace("{suggestion}",n+"@"+T[d]):z(e)?null:t.emailFormat:t.emailNoLocal}var j=15e3,S="lf_pushed_events";function y(e,o,t){let r=e.querySelector('[data-error="'+o+'"]');r&&(t?(r.textContent=t,r.classList.add("visible")):(r.textContent="",r.classList.remove("visible")))}function $(e){e.querySelectorAll("[data-error]").forEach(o=>{o.textContent="",o.classList.remove("visible")}),e.querySelectorAll(".has-error").forEach(o=>o.classList.remove("has-error"))}function x(e,o,t){let r=e.querySelector(".lf-message");r&&(r.textContent=o,r.classList.toggle("lf-message--error",!!t),r.classList.toggle("lf-message--success",!t),r.classList.add("visible"))}function w(e,o){e.querySelectorAll('[type="submit"]').forEach(t=>{t.disabled=o}),e.classList.toggle("lf-loading",o)}function P(e){try{return JSON.parse(sessionStorage.getItem(S)||"[]").indexOf(e)!==-1}catch{return!1}}function U(e){try{let o=JSON.parse(sessionStorage.getItem(S)||"[]");o.push(e),sessionStorage.setItem(S,JSON.stringify(o))}catch{}}function K(e,o,t){o&&(P(e.event_id)||(window.dataLayer=window.dataLayer||[],window.dataLayer.push({event:"lead",event_id:e.event_id,funnel_id:o.funnel_id,funnel_name:o.funnel_name,lead_source:o.lead_source,lead_type:o.lead_type,customer_email:t,page_path:window.location.pathname,page_url:window.location.href,page_referrer:document.referrer||"",ts:e.ts}),U(e.event_id)))}function A(e,o){let t={...v,...o.messages||{}},r=e.querySelector('input[name="email"]');r&&(r.addEventListener("blur",function(){let d=(this.value||"").trim();if(!d)return;let f=b(d,t);f?(this.classList.add("has-error"),y(e,"email",f)):(this.classList.remove("has-error"),y(e,"email",null))}),r.addEventListener("input",function(){this.classList.remove("has-error"),y(e,"email",null)}));let n=!1;e.addEventListener("submit",function(d){if(d.preventDefault(),n)return;n=!0,$(e);let f=e.querySelector('input[name="email"]'),l=e.querySelector('input[name="gdpr"]'),a=e.querySelector('input[name="website"]'),i=(f.value||"").trim();if(a?(a.value||"").trim():""){x(e,"K\xF6sz\xF6nj\xFCk a feliratkoz\xE1st!",!1);return}let u=!1,p=b(i,t);if(p&&(y(e,"email",p),f&&f.classList.add("has-error"),u=!0),l&&!l.checked&&(y(e,"gdpr",t.gdprRequired),u=!0),u){n=!1;return}w(e,!0);let m={email:i,funnel_slug:o.funnel},k=new AbortController,N=setTimeout(()=>k.abort(),j);fetch(o.api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(m),signal:k.signal}).then(c=>(clearTimeout(N),c.json().then(h=>({ok:c.ok,data:h})))).then(c=>{if(c.ok&&c.data.success){K(c.data,o.tracking,i);try{sessionStorage.setItem("lf_email",i)}catch{}typeof o.onSuccess=="function"&&o.onSuccess(c.data,i),o.redirect!==!1&&c.data.redirect_url?setTimeout(()=>{window.location.href=c.data.redirect_url},300):(n=!1,w(e,!1),x(e,o.successMessage||"K\xF6sz\xF6nj\xFCk a feliratkoz\xE1st!",!1))}else{n=!1,w(e,!1);let h=c.data&&c.data.error||t.genericError;x(e,h,!0),typeof o.onError=="function"&&o.onError(h)}}).catch(()=>{n=!1,w(e,!1),x(e,t.networkError,!0),typeof o.onError=="function"&&o.onError(t.networkError)})})}var G=1,J=3;function M(e,o={}){let t=document.createElement("div");t.className="lf-domain-dropdown",o.dark&&t.classList.add("lf-domain-dropdown--dark"),t.style.display="none",t.style.position="fixed",document.body.appendChild(t);let r=-1;function n(){let l=e.getBoundingClientRect();t.style.left=l.left+"px",t.style.width=l.width+"px",t.style.top=l.bottom+4+"px"}function d(l){let a=l.lastIndexOf("@");if(a===-1||a===0)return[];let i=l.substring(0,a),s=l.substring(a+1).toLowerCase();if(!i)return[];if(s&&s.indexOf(".")!==-1&&g.indexOf(s)!==-1)return[];let u=g.filter(m=>m.indexOf(s)===0),p=s.length>0?J:G;return u.slice(0,p).map(m=>i+"@"+m)}function f(l){if(!l.length){t.style.display="none",r=-1;return}t.innerHTML="",l.forEach((a,i)=>{let s=document.createElement("div");s.className="lf-domain-item"+(i===r?" active":"");let u=a.indexOf("@"),p=document.createElement("span");p.className="lf-domain-local",p.textContent=a.substring(0,u);let m=document.createElement("span");m.className="lf-domain-at",m.textContent="@"+a.substring(u+1),s.appendChild(p),s.appendChild(m),s.addEventListener("mousedown",k=>{k.preventDefault(),e.value=a,t.style.display="none",r=-1,e.focus(),e.dispatchEvent(new Event("input",{bubbles:!0}))}),t.appendChild(s)}),n(),t.style.display="block"}e.addEventListener("input",function(){r=-1,f(d(this.value||""))}),e.addEventListener("keydown",function(l){let a=t.querySelectorAll(".lf-domain-item");if(!(!a.length||t.style.display==="none"))if(l.key==="ArrowDown")l.preventDefault(),r=Math.min(r+1,a.length-1),a.forEach((i,s)=>i.classList.toggle("active",s===r));else if(l.key==="ArrowUp")l.preventDefault(),r=Math.max(r-1,0),a.forEach((i,s)=>i.classList.toggle("active",s===r));else if((l.key==="Enter"||l.key==="Tab")&&r>=0){l.preventDefault();let i=a[r];i&&(e.value=i.textContent,t.style.display="none",r=-1,e.dispatchEvent(new Event("input",{bubbles:!0})))}else l.key==="Escape"&&(t.style.display="none",r=-1)}),e.addEventListener("blur",function(){setTimeout(()=>{t.style.display="none",r=-1},150)}),window.addEventListener("scroll",()=>{t.style.display!=="none"&&n()},!0),window.addEventListener("resize",()=>{t.style.display!=="none"&&n()})}var I="lf-styles";function Y(){if(typeof document>"u"||document.getElementById(I))return;let e=document.createElement("style");e.id=I,e.textContent=L,document.head.appendChild(e)}function O(e,o){if(!e)return o;try{return JSON.parse(e)}catch{return o}}function R(e){let o=e.dataset;return{api:o.api,funnel:o.funnel,cta:o.cta,formTitle:o.formTitle,placeholder:o.placeholder,theme:o.theme,gdprHtml:o.gdprHtml,noteHtml:o.noteHtml,successMessage:o.successMessage,redirect:o.redirect==="false"?!1:void 0,tracking:O(o.tracking,null),messages:O(o.messages,null)}}function B(e){return e.api?e.funnel?!0:(console.error("[lead-form] Hi\xE1nyz\xF3 k\xF6telez\u0151 mez\u0151: funnel (data-funnel)."),!1):(console.error("[lead-form] Hi\xE1nyz\xF3 k\xF6telez\u0151 mez\u0151: api (data-api)."),!1)}function D(e,o={}){Y();let t=typeof e=="string"?document.querySelector(e):e;if(!t)return console.error("[lead-form] A mount elem nem tal\xE1lhat\xF3:",e),null;if(t.dataset.lfInitialized==="1")return t.querySelector("form");if(!B(o))return null;let r=_(t,o);A(r,o);let n=r.querySelector('input[name="email"]');return n&&M(n,{dark:o.theme!=="light"}),t.dataset.lfInitialized="1",r}function V(){if(typeof document>"u")return;let e=()=>{document.querySelectorAll("[data-lead-form]").forEach(o=>{D(o,R(o))})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e):e()}var W={init:D,autoInit:V,getEmailError:b,isValidEmail:z,EMAIL_DOMAINS:g};var de=W;export{g as EMAIL_DOMAINS,W as LeadForm,V as autoInit,de as default,b as getEmailError,D as init,z as isValidEmail};
//# sourceMappingURL=lead-form.esm.js.map
