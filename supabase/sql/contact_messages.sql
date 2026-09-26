-- Contact form storage. Run in the Supabase SQL Editor.
-- Sections 1-2 were already applied. Run section 3 (retention) now, and
-- section 4 once the Edge Function is deployed.

-- 1. Table ------------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  topic       text not null check (topic in ('support', 'feature', 'legal')),
  name        text check (char_length(name) <= 100),
  email       text not null check (
                char_length(email) <= 254
                and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message     text not null check (char_length(message) between 10 and 5000),
  page        text,
  user_agent  text check (char_length(user_agent) <= 500)
);
alter table public.contact_messages enable row level security;

-- 2. Rate limit: 10/minute and 300/day overall, 3/hour per email -------------
create or replace function public.contact_messages_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from contact_messages
      where created_at > now() - interval '1 minute') >= 10 then
    raise exception 'Too many messages right now, try again in a minute';
  end if;
  if (select count(*) from contact_messages
      where created_at > now() - interval '1 day') >= 300 then
    raise exception 'Daily message limit reached';
  end if;
  if (select count(*) from contact_messages
      where lower(email) = lower(new.email)
        and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Too many messages from this email address';
  end if;
  return new;
end;
$$;

drop trigger if exists contact_messages_rate_limit on public.contact_messages;
create trigger contact_messages_rate_limit
  before insert on public.contact_messages
  for each row execute function public.contact_messages_rate_limit();

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at);
create index if not exists contact_messages_email_idx on public.contact_messages (lower(email), created_at);

-- 3. Retention: delete after 12 months ------------------------------------
-- The Privacy Policy promises this, so it must be scheduled. Enable pg_cron
-- first (Dashboard > Database > Extensions > pg_cron), then run this once.
-- The contact Edge Function also sweeps old rows on each new message, as a
-- backstop, but only this job guarantees deletion on a quiet month.
create extension if not exists pg_cron;
select cron.schedule(
  'delete-old-contact-messages', '0 3 * * *',
  $$delete from public.contact_messages where created_at < now() - interval '12 months'$$
);

-- 4. Turnstile: only the `contact` Edge Function may insert -------------------
-- Run this AFTER the function is deployed. The function writes with the
-- secret key, which bypasses RLS; with this policy gone, the publishable key
-- can no longer insert, so every message has to pass the captcha.
drop policy if exists "Anyone can send a contact message" on public.contact_messages;
