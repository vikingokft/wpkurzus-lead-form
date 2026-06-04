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
 *
 * Csak a `tag` és a `redirect` KÖTELEZŐ — az API végpont be van égetve.
 */

import { useEffect, useRef } from "react";
import { LeadForm } from "@wpkurzus/lead-form";
import "@wpkurzus/lead-form/styles";

export function LeadFormWidget() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    LeadForm.init(ref.current, {
      tag: "LM: MILYEN-VALLALKOZAST-INDITS",
      redirect: "https://wpkurzus.hu/ingyenes/milyen-vallalkozast-indits/koszi/",
      formTitle: "Töltsd le ingyen!",
      cta: "Letöltöm",
      theme: "dark",
      // Opcionális tracking a GTM lead eventhez:
      tracking: { funnel_id: "milyen-vallalkozast-indits", lead_source: "lead-magnet", lead_type: "kviz" },
      // SPA esetén szerver-redirect helyett saját router:
      // noRedirect: true,
      // onSuccess: (data, email) => { /* router.push("/koszi") */ },
      // onError: (msg) => console.warn(msg),
    });
  }, []);

  return <div ref={ref} />;
}
