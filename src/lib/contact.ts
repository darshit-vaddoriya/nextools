// Contact form submissions.
//
// The form posts to the Supabase Edge Function `contact`
// (supabase/functions/contact), which verifies the Cloudflare Turnstile token
// and only then stores the message in the `contact_messages` table with the
// project's secret key. The table has no anonymous insert policy, so a script
// cannot fill it without passing the captcha each time.

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
export const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;

export type ContactTopic = 'support' | 'feature' | 'legal';

export interface ContactMessage {
  topic: ContactTopic;
  name: string;
  email: string;
  message: string;
}

/** Same limits as the table's CHECK constraints, so errors show before sending. */
export const CONTACT_LIMITS = { name: 100, email: 254, messageMin: 10, messageMax: 5000 };

export const isContactConfigured = Boolean(SUPABASE_URL && TURNSTILE_SITE_KEY);

/** Why a send failed, so the form can say what to do next. */
export type ContactErrorKind = 'captcha' | 'rate' | 'invalid' | 'network';

export class ContactError extends Error {
  constructor(readonly kind: ContactErrorKind) {
    super(`Contact form: ${kind}`);
  }
}

export async function sendContactMessage(input: ContactMessage, captchaToken: string): Promise<void> {
  if (!isContactConfigured) throw new ContactError('network');

  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/functions/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: input.topic,
        name: input.name.trim(),
        email: input.email.trim(),
        message: input.message.trim(),
        page: window.location.pathname,
        token: captchaToken,
      }),
    });
  } catch {
    throw new ContactError('network');
  }
  if (res.ok) return;
  if (res.status === 403) throw new ContactError('captcha');
  if (res.status === 429) throw new ContactError('rate');
  if (res.status === 400) throw new ContactError('invalid');
  throw new ContactError('network');
}
