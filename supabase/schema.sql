-- Optional schema for cross-device syncing of a user's saved locations.
-- Run this in Supabase SQL Editor only if you enable cloud sync in index.html.

create table if not exists public.saved_locations (
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  created_at timestamptz not null default now(),
  primary key (user_id, latitude, longitude)
);

alter table public.saved_locations enable row level security;

drop policy if exists "Users can read their own saved locations" on public.saved_locations;
create policy "Users can read their own saved locations"
  on public.saved_locations for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can add their own saved locations" on public.saved_locations;
create policy "Users can add their own saved locations"
  on public.saved_locations for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own saved locations" on public.saved_locations;
create policy "Users can update their own saved locations"
  on public.saved_locations for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own saved locations" on public.saved_locations;
create policy "Users can delete their own saved locations"
  on public.saved_locations for delete to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.saved_locations to authenticated;
