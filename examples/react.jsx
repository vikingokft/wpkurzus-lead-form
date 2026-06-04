/**
 * React / Vite / Next beágyazás
 * ==============================
 *
 * Telepítés:
 *   npm install @wpkurzus/lead-form
 *
 * A widget keretrendszer-független DOM-ot rendel egy ref-elt divbe. A stíluslapot
 * egyszer importáld (a CSS automatikusan injektálódik init-kor is, de a külön
 * import segít a build pipeline-nak / SSR-nek).
 */

import { useEffect, useRef } from "react";
import { LeadForm } from "@wpkurzus/lead-form";
import "@wpkurzus/lead-form/styles";

export function LeadFormWidget() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    LeadForm.init(ref.current, {
      api: "https://wpkurzus.hu/ingyenes/api/subscribe.php",
      funnel: "50-kerdes-webdesign",
      formTitle: "Töltsd le ingyen!",
      cta: "Letöltöm",
      theme: "dark",
      tracking: {
        funnel_id: "50-kerdes-webdesign",
        funnel_name: "50 kérdés webdesign",
        lead_source: "lead-magnet",
        lead_type: "munkafuzet",
      },
      // Opcionális callbackek (pl. ha nem szerver-redirect, hanem SPA-route kell):
      // redirect: false,
      // onSuccess: (data, email) => { /* router.push("/koszi") */ },
      // onError: (msg) => console.warn(msg),
    });
  }, []);

  return <div ref={ref} />;
}
