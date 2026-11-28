-- 008: Editable article links. Safe to run more than once. Run after 005.
-- When an article's slug changes, the old slug is kept here so old links forward to the new page.

create table if not exists public.article_slug_redirects (
  old_slug text primary key check (old_slug ~ '^[a-z0-9]+(-[a-z0-9]+){0,}$'),
  article_id uuid not null references public.articles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists article_slug_redirects_article_idx on public.article_slug_redirects (article_id);

alter table public.article_slug_redirects enable row level security;

drop policy if exists "Public can read article redirects" on public.article_slug_redirects;
create policy "Public can read article redirects"
  on public.article_slug_redirects for select
  to anon, authenticated
  using (true);

-- Keeps the old slug on every slug change, from the admin page or from SQL.
create or replace function public.keep_old_article_slug() returns trigger
language plpgsql as $$
begin
  if new.slug is distinct from old.slug then
    delete from public.article_slug_redirects where old_slug = new.slug;
    insert into public.article_slug_redirects (old_slug, article_id)
    values (old.slug, old.id)
    on conflict (old_slug) do update set article_id = excluded.article_id, created_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists articles_keep_old_slug on public.articles;
create trigger articles_keep_old_slug
  before update of slug on public.articles
  for each row execute function public.keep_old_article_slug();
