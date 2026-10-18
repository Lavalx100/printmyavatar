create table if not exists public.avatar_generation_usage (
  bucket_kind text not null check (bucket_kind in ('user_hour', 'project_day')),
  bucket_key text not null,
  bucket_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (bucket_kind, bucket_key, bucket_start)
);

alter table public.avatar_generation_usage enable row level security;
revoke all on table public.avatar_generation_usage from public, anon, authenticated;
grant all on table public.avatar_generation_usage to service_role;

create or replace function public.consume_avatar_generation_quota(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.now();
  v_hour_start timestamptz := pg_catalog.date_trunc('hour', pg_catalog.timezone('UTC', pg_catalog.now())) at time zone 'UTC';
  v_day_start timestamptz := pg_catalog.date_trunc('day', pg_catalog.timezone('UTC', pg_catalog.now())) at time zone 'UTC';
  v_user_count integer;
  v_project_count integer;
begin
  -- Serialize the small quota transaction so concurrent requests cannot exceed either cap.
  perform pg_catalog.pg_advisory_xact_lock(734219, 1);

  delete from public.avatar_generation_usage
  where bucket_start < v_now - interval '48 hours';

  insert into public.avatar_generation_usage (bucket_kind, bucket_key, bucket_start, request_count)
  values ('user_hour', p_user_id::text, v_hour_start, 0)
  on conflict do nothing;

  insert into public.avatar_generation_usage (bucket_kind, bucket_key, bucket_start, request_count)
  values ('project_day', 'all', v_day_start, 0)
  on conflict do nothing;

  select request_count into v_user_count
  from public.avatar_generation_usage
  where bucket_kind = 'user_hour' and bucket_key = p_user_id::text and bucket_start = v_hour_start;

  select request_count into v_project_count
  from public.avatar_generation_usage
  where bucket_kind = 'project_day' and bucket_key = 'all' and bucket_start = v_day_start;

  if v_user_count >= 5 or v_project_count >= 50 then
    return false;
  end if;

  update public.avatar_generation_usage
  set request_count = request_count + 1
  where bucket_kind = 'user_hour' and bucket_key = p_user_id::text and bucket_start = v_hour_start;

  update public.avatar_generation_usage
  set request_count = request_count + 1
  where bucket_kind = 'project_day' and bucket_key = 'all' and bucket_start = v_day_start;

  return true;
end;
$$;

revoke all on function public.consume_avatar_generation_quota(uuid) from public, anon, authenticated;
grant execute on function public.consume_avatar_generation_quota(uuid) to service_role;
