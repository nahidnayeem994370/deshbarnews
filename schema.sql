-- দেশবার্তা নিউজ পোর্টাল: Supabase schema
-- Supabase Dashboard > SQL Editor এ পুরো ফাইলটি চালান.
-- নিরাপত্তা: public sign-ups বন্ধ রাখুন এবং অ্যাডমিন ইউজার Dashboard > Authentication থেকে তৈরি করুন.

create extension if not exists pgcrypto;

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 5 and 180),
  category text not null default 'জাতীয়',
  summary text not null check (char_length(summary) between 10 and 400),
  body text not null,
  author text not null default 'নিজস্ব প্রতিবেদক',
  image_url text,
  source_url text,
  featured boolean not null default false,
  published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_published_created_at_idx
  on public.news (published, created_at desc);
create index if not exists news_category_idx on public.news (category);

alter table public.news enable row level security;

-- Public can read published news only.
drop policy if exists "Anyone can read published news" on public.news;
create policy "Anyone can read published news"
on public.news for select
to anon, authenticated
using (published = true);

-- The author/admin can also see their own drafts in the admin panel.
drop policy if exists "Creators can read their own news" on public.news;
create policy "Creators can read their own news"
on public.news for select
to authenticated
using (auth.uid() = created_by);

-- Logged-in authenticated users can manage news.
-- IMPORTANT: Keep public sign-up disabled and create only trusted admin accounts.
drop policy if exists "Admins can insert news" on public.news;
create policy "Admins can insert news"
on public.news for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "Admins can update news" on public.news;
create policy "Admins can update news"
on public.news for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

drop policy if exists "Admins can delete news" on public.news;
create policy "Admins can delete news"
on public.news for delete
to authenticated
using (auth.uid() = created_by);

-- NOTE: This starter treats any authenticated user as a potential admin for INSERT.
-- Disable public sign-ups and manually create trusted users. For multi-user/editor roles,
-- add a private admin-role table and role-checking policies before enabling sign-ups.
