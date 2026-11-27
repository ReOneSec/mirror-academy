-- Migration 007: remove dates for exam dates and downloads.
-- After expires_on the item is hidden from the website automatically; it stays in the admin
-- panel (marked "Removed from site") until someone deletes it. Safe to run more than once.

alter table public.exam_events add column if not exists expires_on date;
alter table public.downloads add column if not exists expires_on date;

create index if not exists exam_events_expires_on_idx on public.exam_events (expires_on);
create index if not exists downloads_expires_on_idx on public.downloads (expires_on);
