// Supabase Edge Function: POST /functions/v1/contact
//
// The contact form posts here instead of writing to the table directly. The
// function checks the Cloudflare Turnstile token first and only then inserts
// the message with the project's secret key, so the table no longer needs an
// anonymous insert policy and a script cannot fill it without passing the
// captcha each time. The rate-limit trigger on the table still applies.
//
// Secrets (set with `supabase secrets set`):
//   TURNSTILE_SECRET_KEY   from the Cloudflare Turnstile widget
//   CONTACT_DB_KEY         optional, a secret key if the injected one is missing
// Provided by Supabase automatically:
//   SUPABASE_URL, SUPABASE_SECRET_KEYS, SUPABASE_SERVICE_ROLE_KEY
//
// Deploy with --no-verify-jwt: this endpoint is public by design.

const ALLOWED_ORIGINS = new Set(['https://nexttool.click', 'https://www.nexttool.click']);
const isAllowedOrigin = (origin: string) =>
  ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

const TOPICS = new Set(['support', 'feature', 'legal']);
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : 'https://nexttool.click',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function reply(origin: string, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret) throw new Error('TURNSTILE_SECRET_KEY is not set');
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const data = await res.json() as { success?: boolean };
  return data.success === true;
}

/**
 * The key the insert is made with. Supabase injects the new secret keys as
 * SUPABASE_SECRET_KEYS (a JSON object of name -> sb_secret_ key) and the
 * legacy service_role JWT as SUPABASE_SERVICE_ROLE_KEY; the new one is
 * preferred because legacy keys can be switched off. CONTACT_DB_KEY is a
 * manual override (names starting SUPABASE_ cannot be set as secrets by hand).
 */
function databaseKey(): string | undefined {
  const manual = Deno.env.get('CONTACT_DB_KEY');
  if (manual) return manual;
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys) as Record<string, string>;
      const first = parsed.default ?? Object.values(parsed)[0];
      if (first) return first;
    } catch {
      if (secretKeys.startsWith('sb_secret_')) return secretKeys;
    }
  }
  return Deno.env.get('SUPABASE_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== 'POST') return reply(origin, 405, { error: 'method' });
  if (!isAllowedOrigin(origin)) return reply(origin, 403, { error: 'origin' });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply(origin, 400, { error: 'invalid' });
  }

  const topic = str(body.topic);
  const name = str(body.name);
  const email = str(body.email);
  const message = str(body.message);
  const token = str(body.token);

  // Same rules as the table's CHECK constraints, answered before any work.
  if (
    !TOPICS.has(topic) || name.length > 100 || email.length > 254 || !EMAIL_RE.test(email)
    || message.length < 10 || message.length > 5000 || !token
  ) {
    return reply(origin, 400, { error: 'invalid' });
  }

  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null;
  try {
    if (!(await verifyTurnstile(token, ip))) return reply(origin, 403, { error: 'captcha' });
  } catch (e) {
    console.error('turnstile', e);
    return reply(origin, 500, { error: 'server' });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const key = databaseKey();
  if (!url || !key) {
    console.error('Supabase URL or secret key missing from the function environment');
    return reply(origin, 500, { error: 'server' });
  }

  const res = await fetch(`${url}/rest/v1/contact_messages`, {
    method: 'POST',
    headers: {
      apikey: key,
      // Legacy service_role keys are JWTs and also go in Authorization;
      // new sb_secret_ keys must not.
      ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }),
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      topic,
      name: name || null,
      email,
      message,
      page: str(body.page).slice(0, 200) || null,
      user_agent: (req.headers.get('user-agent') ?? '').slice(0, 500) || null,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    // The rate-limit trigger raises these messages.
    if (/too many|limit reached/i.test(text)) return reply(origin, 429, { error: 'rate' });
    console.error('insert failed', res.status, text);
    return reply(origin, 500, { error: 'server' });
  }

  // Retention: the Privacy Policy promises deletion within 12 months. The
  // pg_cron job in contact_messages.sql is the main mechanism; this sweep on
  // every accepted message is the backstop in case the job was never scheduled.
  const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const purge = await fetch(`${url}/rest/v1/contact_messages?created_at=lt.${encodeURIComponent(cutoff)}`, {
    method: 'DELETE',
    headers: {
      apikey: key,
      ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }),
      Prefer: 'return=minimal',
    },
  }).catch((e) => { console.error('retention sweep', e); return null; });
  if (purge && !purge.ok) console.error('retention sweep failed', purge.status, await purge.text());

  return reply(origin, 200, { ok: true });
});
