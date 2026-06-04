/** @wpkurzus/lead-form — típusdefiníciók */

export interface LeadFormTracking {
  funnel_id?: string;
  funnel_name?: string;
  lead_source?: string;
  lead_type?: string;
}

export interface LeadFormMessages {
  emailEmpty?: string;
  emailNoAt?: string;
  emailFormat?: string;
  emailNoLocal?: string;
  emailNoDomain?: string;
  /** {suggestion} helyettesítődik a javasolt címmel */
  emailTypo?: string;
  gdprRequired?: string;
  networkError?: string;
  genericError?: string;
}

export interface LeadFormConfig {
  /** Kötelező — a központi subscribe.php végpont URL-je */
  api: string;
  /** Kötelező — a funnel slug (a szerver registry kulcsa) */
  funnel: string;
  cta?: string;
  formTitle?: string;
  placeholder?: string;
  theme?: "dark" | "light";
  /** GDPR consent label HTML-je (felülírja a WPViking alapértelmezettet) */
  gdprHtml?: string;
  /** Halvány lábjegyzet HTML-je a consent alatt */
  noteHtml?: string;
  successMessage?: string;
  /** false → ne irányítson át, a successMessage jelenik meg */
  redirect?: boolean;
  tracking?: LeadFormTracking | null;
  messages?: LeadFormMessages | null;
  onSuccess?: (data: { event_id: string; ts: number; redirect_url?: string }, email: string) => void;
  onError?: (message: string) => void;
}

export function init(target: string | HTMLElement, cfg: LeadFormConfig): HTMLFormElement | null;
export function autoInit(): void;
export function getEmailError(email: string, messages?: LeadFormMessages): string | null;
export function isValidEmail(email: string): boolean;
export const EMAIL_DOMAINS: string[];

declare const LeadForm: {
  init: typeof init;
  autoInit: typeof autoInit;
  getEmailError: typeof getEmailError;
  isValidEmail: typeof isValidEmail;
  EMAIL_DOMAINS: string[];
};

export { LeadForm };
export default LeadForm;
