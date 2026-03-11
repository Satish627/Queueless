create extension if not exists "pgcrypto";

create type public.profile_role as enum ('customer', 'staff', 'owner');
create type public.queue_status as enum ('open', 'closed');
create type public.queue_entry_source as enum ('app', 'walk_in');
create type public.queue_entry_status as enum ('waiting', 'called', 'served', 'cancelled', 'no_show');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.profile_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  slug text not null unique,
  category text not null,
  address text not null,
  city text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.business_staff (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.profile_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique (business_id, profile_id)
);

create table if not exists public.queues (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  status public.queue_status not null default 'open',
  avg_service_minutes integer not null check (avg_service_minutes > 0 and avg_service_minutes <= 120),
  created_at timestamptz not null default now()
);

create unique index if not exists queues_single_open_per_business_idx
  on public.queues (business_id)
  where status = 'open';

create table if not exists public.queue_entries (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references public.queues(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  source public.queue_entry_source not null,
  status public.queue_entry_status not null default 'waiting',
  position integer not null check (position > 0),
  joined_at timestamptz not null default now(),
  called_at timestamptz,
  served_at timestamptz,
  cancelled_at timestamptz
);

create unique index if not exists queue_entries_unique_active_position_idx
  on public.queue_entries (queue_id, position)
  where status in ('waiting', 'called');

create index if not exists queue_entries_queue_id_status_idx
  on public.queue_entries (queue_id, status, position);

create index if not exists businesses_city_category_idx
  on public.businesses (city, category);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_staff enable row level security;
alter table public.queues enable row level security;
alter table public.queue_entries enable row level security;

create policy "profiles_self_select"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles_self_update"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "businesses_public_read"
  on public.businesses
  for select
  using (is_active = true);

create policy "businesses_owner_manage"
  on public.businesses
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "business_staff_access"
  on public.business_staff
  for select
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = business_staff.business_id
      and b.owner_id = auth.uid()
    )
    or profile_id = auth.uid()
  );

create policy "queues_owner_or_staff_read"
  on public.queues
  for select
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = queues.business_id
      and (
        b.owner_id = auth.uid()
        or exists (
          select 1
          from public.business_staff bs
          where bs.business_id = b.id
            and bs.profile_id = auth.uid()
        )
      )
    )
  );

create policy "queues_owner_manage"
  on public.queues
  for all
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = queues.business_id
      and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.businesses b
      where b.id = queues.business_id
      and b.owner_id = auth.uid()
    )
  );

create policy "queue_entries_customer_view_own"
  on public.queue_entries
  for select
  using (customer_id = auth.uid());

create policy "queue_entries_staff_view"
  on public.queue_entries
  for select
  using (
    exists (
      select 1
      from public.queues q
      join public.businesses b on b.id = q.business_id
      where q.id = queue_entries.queue_id
        and (
          b.owner_id = auth.uid()
          or exists (
            select 1
            from public.business_staff bs
            where bs.business_id = b.id
              and bs.profile_id = auth.uid()
          )
        )
    )
  );

create policy "queue_entries_customer_insert"
  on public.queue_entries
  for insert
  with check (
    source = 'app'
    and customer_id = auth.uid()
  );

create policy "queue_entries_staff_manage"
  on public.queue_entries
  for all
  using (
    exists (
      select 1
      from public.queues q
      join public.businesses b on b.id = q.business_id
      where q.id = queue_entries.queue_id
        and (
          b.owner_id = auth.uid()
          or exists (
            select 1
            from public.business_staff bs
            where bs.business_id = b.id
              and bs.profile_id = auth.uid()
          )
        )
    )
  )
  with check (
    exists (
      select 1
      from public.queues q
      join public.businesses b on b.id = q.business_id
      where q.id = queue_entries.queue_id
        and (
          b.owner_id = auth.uid()
          or exists (
            select 1
            from public.business_staff bs
            where bs.business_id = b.id
              and bs.profile_id = auth.uid()
          )
        )
    )
  );
