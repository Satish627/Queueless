alter table public.queue_entries
  add column if not exists guest_token uuid not null default gen_random_uuid();

create or replace function public.recompute_queue_positions(p_queue_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  entry_row record;
  next_position integer := 1;
begin
  for entry_row in
    select qe.id
    from public.queue_entries qe
    where qe.queue_id = p_queue_id
      and qe.status in ('waiting', 'called')
    order by qe.position asc, qe.joined_at asc
  loop
    update public.queue_entries
    set position = next_position
    where id = entry_row.id;

    next_position := next_position + 1;
  end loop;
end;
$$;

create or replace function public.list_public_businesses()
returns table (
  business_id uuid,
  owner_id uuid,
  name text,
  slug text,
  category text,
  address text,
  city text,
  description text,
  is_active boolean,
  business_created_at timestamptz,
  queue_id uuid,
  queue_name text,
  queue_status public.queue_status,
  avg_service_minutes integer,
  queue_created_at timestamptz,
  waiting_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    b.id as business_id,
    b.owner_id,
    b.name,
    b.slug,
    b.category,
    b.address,
    b.city,
    b.description,
    b.is_active,
    b.created_at as business_created_at,
    q.id as queue_id,
    q.name as queue_name,
    q.status as queue_status,
    q.avg_service_minutes,
    q.created_at as queue_created_at,
    coalesce(stats.waiting_count, 0) as waiting_count
  from public.businesses b
  left join lateral (
    select q1.*
    from public.queues q1
    where q1.business_id = b.id
    order by q1.created_at desc
    limit 1
  ) q on true
  left join lateral (
    select count(*)::bigint as waiting_count
    from public.queue_entries qe
    where qe.queue_id = q.id
      and qe.status in ('waiting', 'called')
  ) stats on true
  where b.is_active = true
  order by b.created_at desc;
$$;

create or replace function public.get_public_business(p_business_id uuid)
returns table (
  business_id uuid,
  owner_id uuid,
  name text,
  slug text,
  category text,
  address text,
  city text,
  description text,
  is_active boolean,
  business_created_at timestamptz,
  queue_id uuid,
  queue_name text,
  queue_status public.queue_status,
  avg_service_minutes integer,
  queue_created_at timestamptz,
  waiting_count bigint
)
language sql
security definer
set search_path = public
as $$
  select *
  from public.list_public_businesses()
  where business_id = p_business_id
  limit 1;
$$;

create or replace function public.join_queue_guest(
  p_queue_id uuid,
  p_display_name text
)
returns table (
  entry_id uuid,
  guest_token uuid,
  queue_id uuid,
  business_id uuid,
  display_name text,
  status public.queue_entry_status,
  position integer,
  queue_name text,
  business_name text,
  avg_service_minutes integer,
  joined_at timestamptz,
  called_at timestamptz,
  served_at timestamptz,
  cancelled_at timestamptz,
  estimated_wait_minutes integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queue public.queues%rowtype;
  v_entry public.queue_entries%rowtype;
  v_business_name text;
  v_display_name text;
  v_position integer;
begin
  v_display_name := btrim(coalesce(p_display_name, ''));
  if v_display_name = '' then
    raise exception 'Display name is required.';
  end if;

  select *
  into v_queue
  from public.queues
  where id = p_queue_id
  limit 1;

  if not found then
    raise exception 'Queue not found.';
  end if;

  if v_queue.status <> 'open' then
    raise exception 'Queue is closed.';
  end if;

  select coalesce(max(qe.position), 0) + 1
  into v_position
  from public.queue_entries qe
  where qe.queue_id = p_queue_id
    and qe.status in ('waiting', 'called');

  insert into public.queue_entries (
    queue_id,
    customer_id,
    display_name,
    source,
    status,
    position
  )
  values (
    p_queue_id,
    null,
    v_display_name,
    'app',
    'waiting',
    v_position
  )
  returning * into v_entry;

  select b.name
  into v_business_name
  from public.businesses b
  where b.id = v_queue.business_id;

  return query
  select
    v_entry.id,
    v_entry.guest_token,
    v_entry.queue_id,
    v_queue.business_id,
    v_entry.display_name,
    v_entry.status,
    v_entry.position,
    v_queue.name,
    coalesce(v_business_name, 'Unknown business'),
    v_queue.avg_service_minutes,
    v_entry.joined_at,
    v_entry.called_at,
    v_entry.served_at,
    v_entry.cancelled_at,
    (v_entry.position * v_queue.avg_service_minutes)::integer;
end;
$$;

create or replace function public.get_queue_entry_guest(
  p_entry_id uuid,
  p_guest_token uuid
)
returns table (
  entry_id uuid,
  guest_token uuid,
  queue_id uuid,
  business_id uuid,
  display_name text,
  status public.queue_entry_status,
  position integer,
  queue_name text,
  business_name text,
  avg_service_minutes integer,
  joined_at timestamptz,
  called_at timestamptz,
  served_at timestamptz,
  cancelled_at timestamptz,
  estimated_wait_minutes integer
)
language sql
security definer
set search_path = public
as $$
  select
    qe.id as entry_id,
    qe.guest_token,
    qe.queue_id,
    q.business_id,
    qe.display_name,
    qe.status,
    qe.position,
    q.name as queue_name,
    b.name as business_name,
    q.avg_service_minutes,
    qe.joined_at,
    qe.called_at,
    qe.served_at,
    qe.cancelled_at,
    case
      when qe.status in ('waiting', 'called') then (qe.position * q.avg_service_minutes)::integer
      else 0
    end as estimated_wait_minutes
  from public.queue_entries qe
  join public.queues q on q.id = qe.queue_id
  join public.businesses b on b.id = q.business_id
  where qe.id = p_entry_id
    and qe.guest_token = p_guest_token
  limit 1;
$$;

create or replace function public.leave_queue_guest(
  p_entry_id uuid,
  p_guest_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queue_id uuid;
begin
  update public.queue_entries
  set
    status = 'cancelled',
    cancelled_at = now()
  where id = p_entry_id
    and guest_token = p_guest_token
    and status in ('waiting', 'called')
  returning queue_id into v_queue_id;

  if v_queue_id is null then
    return false;
  end if;

  perform public.recompute_queue_positions(v_queue_id);
  return true;
end;
$$;

create or replace function public.list_queue_entries_for_queue(p_queue_id uuid)
returns table (
  entry_id uuid,
  queue_id uuid,
  display_name text,
  source public.queue_entry_source,
  status public.queue_entry_status,
  position integer,
  joined_at timestamptz,
  called_at timestamptz,
  served_at timestamptz,
  cancelled_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    qe.id as entry_id,
    qe.queue_id,
    qe.display_name,
    qe.source,
    qe.status,
    qe.position,
    qe.joined_at,
    qe.called_at,
    qe.served_at,
    qe.cancelled_at
  from public.queue_entries qe
  where qe.queue_id = p_queue_id
    and qe.status in ('waiting', 'called')
  order by qe.position asc, qe.joined_at asc;
$$;

create or replace function public.add_walk_in_entry(
  p_queue_id uuid,
  p_display_name text
)
returns table (
  entry_id uuid,
  queue_id uuid,
  display_name text,
  source public.queue_entry_source,
  status public.queue_entry_status,
  position integer,
  joined_at timestamptz,
  called_at timestamptz,
  served_at timestamptz,
  cancelled_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry public.queue_entries%rowtype;
  v_position integer;
  v_display_name text;
begin
  v_display_name := btrim(coalesce(p_display_name, ''));
  if v_display_name = '' then
    raise exception 'Display name is required.';
  end if;

  select coalesce(max(qe.position), 0) + 1
  into v_position
  from public.queue_entries qe
  where qe.queue_id = p_queue_id
    and qe.status in ('waiting', 'called');

  insert into public.queue_entries (
    queue_id,
    customer_id,
    display_name,
    source,
    status,
    position
  )
  values (
    p_queue_id,
    null,
    v_display_name,
    'walk_in',
    'waiting',
    v_position
  )
  returning * into v_entry;

  return query
  select
    v_entry.id,
    v_entry.queue_id,
    v_entry.display_name,
    v_entry.source,
    v_entry.status,
    v_entry.position,
    v_entry.joined_at,
    v_entry.called_at,
    v_entry.served_at,
    v_entry.cancelled_at;
end;
$$;

create or replace function public.call_next_entry_for_queue(p_queue_id uuid)
returns table (
  entry_id uuid,
  queue_id uuid,
  display_name text,
  source public.queue_entry_source,
  status public.queue_entry_status,
  position integer,
  joined_at timestamptz,
  called_at timestamptz,
  served_at timestamptz,
  cancelled_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry public.queue_entries%rowtype;
begin
  update public.queue_entries qe
  set
    status = 'called',
    called_at = now()
  where qe.id = (
    select qe2.id
    from public.queue_entries qe2
    where qe2.queue_id = p_queue_id
      and qe2.status = 'waiting'
    order by qe2.position asc, qe2.joined_at asc
    limit 1
  )
  returning * into v_entry;

  if v_entry.id is null then
    return;
  end if;

  return query
  select
    v_entry.id,
    v_entry.queue_id,
    v_entry.display_name,
    v_entry.source,
    v_entry.status,
    v_entry.position,
    v_entry.joined_at,
    v_entry.called_at,
    v_entry.served_at,
    v_entry.cancelled_at;
end;
$$;

create or replace function public.set_queue_entry_status(
  p_entry_id uuid,
  p_status public.queue_entry_status
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queue_id uuid;
begin
  update public.queue_entries
  set
    status = p_status,
    called_at = case when p_status = 'called' then now() else called_at end,
    served_at = case when p_status = 'served' then now() else served_at end,
    cancelled_at = case when p_status in ('cancelled', 'no_show') then now() else cancelled_at end
  where id = p_entry_id
    and status in ('waiting', 'called')
  returning queue_id into v_queue_id;

  if v_queue_id is null then
    return false;
  end if;

  if p_status in ('served', 'cancelled', 'no_show') then
    perform public.recompute_queue_positions(v_queue_id);
  end if;

  return true;
end;
$$;

create or replace function public.update_queue_settings(
  p_queue_id uuid,
  p_status public.queue_status,
  p_avg_service_minutes integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_avg_service_minutes < 1 or p_avg_service_minutes > 120 then
    raise exception 'Average service minutes must be between 1 and 120.';
  end if;

  update public.queues
  set
    status = p_status,
    avg_service_minutes = p_avg_service_minutes
  where id = p_queue_id;

  return found;
end;
$$;

create or replace function public.update_business_preview_details(
  p_business_id uuid,
  p_name text,
  p_category text,
  p_city text,
  p_address text,
  p_description text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.businesses
  set
    name = btrim(coalesce(p_name, name)),
    category = btrim(coalesce(p_category, category)),
    city = btrim(coalesce(p_city, city)),
    address = btrim(coalesce(p_address, address)),
    description = p_description
  where id = p_business_id;

  return found;
end;
$$;

grant execute on function public.list_public_businesses() to anon, authenticated;
grant execute on function public.get_public_business(uuid) to anon, authenticated;
grant execute on function public.join_queue_guest(uuid, text) to anon, authenticated;
grant execute on function public.get_queue_entry_guest(uuid, uuid) to anon, authenticated;
grant execute on function public.leave_queue_guest(uuid, uuid) to anon, authenticated;
grant execute on function public.list_queue_entries_for_queue(uuid) to anon, authenticated;
grant execute on function public.add_walk_in_entry(uuid, text) to anon, authenticated;
grant execute on function public.call_next_entry_for_queue(uuid) to anon, authenticated;
grant execute on function public.set_queue_entry_status(uuid, public.queue_entry_status) to anon, authenticated;
grant execute on function public.update_queue_settings(uuid, public.queue_status, integer) to anon, authenticated;
grant execute on function public.update_business_preview_details(uuid, text, text, text, text, text) to anon, authenticated;
