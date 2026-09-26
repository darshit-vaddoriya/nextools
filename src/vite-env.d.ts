/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://xxxx.supabase.co (contact form). */
  readonly PUBLIC_SUPABASE_URL: string;
  /** Supabase publishable key (sb_publishable_…). Public by design; not used by the contact form. */
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  /** Cloudflare Turnstile site key (public), for the contact form captcha. */
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
